
import type { Server as HttpServer } from 'http';

import * as jwt from 'jsonwebtoken';
import { Server as SocketIOServer } from 'socket.io';
import type { Socket } from 'socket.io';

import { MESSAGE } from '../../config/constants';
import env from '../../config/env';
import { MessageModel } from '../../db/models/Message';
import { UserModel } from '../../db/models/User';
import logger from '../../shared/logger';
import type { JwtPayload } from '../auth/auth.types';
import { notificationsService } from '../notifications/notifications.service';
import { requestsRepository } from '../requests/requests.repository';
import { ridesRepository } from '../rides/rides.repository';
import { safetyService } from '../safety/safety.service';
import { usersRepository } from '../users/users.repository';

let io: SocketIOServer;

export function getIO(): SocketIOServer {
  return io;
}

// Per-socket rate limiter: 20 events per 10 seconds
const socketRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(socketId: string): boolean {
  const now = Date.now();
  const entry = socketRateLimitMap.get(socketId);
  if (!entry || now > entry.resetAt) {
    socketRateLimitMap.set(socketId, { count: 1, resetAt: now + 10_000 });
    return true;
  }
  if (entry.count >= 20) {
    return false;
  }
  entry.count++;
  return true;
}

// Clean up rate limit map on disconnect
function cleanupRateLimit(socketId: string): void {
  socketRateLimitMap.delete(socketId);
}

export function initializeSockets(server: HttpServer): void {
  io = new SocketIOServer(server, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST'],
    },
  });

  // Authentication Middleware
  io.use((socket: Socket, next: any) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    try {
      const decoded = jwt.verify(token, env.accessTokenSecret, { algorithms: ['HS256'] }) as JwtPayload;
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as JwtPayload;
    logger.info(`User ${user.userId} connected to sockets`);

    void socket.join(user.userId);

    socket.on('join_ride', async (rideId: string) => {
      try {
        if (!rideId || typeof rideId !== 'string') {
          socket.emit('error', { message: 'Invalid rideId.' });
          return;
        }

        const [ride, isPassenger] = await Promise.all([
          ridesRepository.findById(rideId),
          requestsRepository.isAcceptedPassenger(rideId, user.userId),
        ]);

        const isPoster = ride?.posterId?.toString() === user.userId;

        if (!isPoster && !isPassenger) {
          socket.emit('error', { message: 'Not authorized to join this ride room.' });
          logger.warn(`Unauthorized join_ride attempt by ${user.userId} for ride ${rideId}`);
          return;
        }

        void socket.join(`ride_${rideId}`);
        logger.info(`User ${user.userId} joined ride room ride_${rideId}`);
      } catch (err) {
        logger.error(`Error in join_ride handler: ${String(err)}`);
        socket.emit('error', { message: 'Failed to join ride.' });
      }
    });

    socket.on('send_message', async (data: { rideId: string, receiverId?: string, content: string }) => {
      try {
        if (!checkRateLimit(socket.id)) {
          socket.emit('message_error', { message: 'Rate limit exceeded. Please slow down.' });
          return;
        }

        if (!data.content || data.content.length > MESSAGE.CONTENT_MAX_LENGTH) {
          socket.emit('message_error', { message: `Message must be between 1 and ${MESSAGE.CONTENT_MAX_LENGTH} characters.` });
          return;
        }

        // Verify sender is still authorized (token not revoked)
        const dbUser = await UserModel.findById(user.userId).select('tokenVersion').lean();
        if (!dbUser || dbUser.tokenVersion !== user.tokenVersion) {
          socket.emit('message_error', { message: 'Session expired. Please reconnect.' });
          return;
        }

        // Verify sender is a participant of this ride (poster or accepted passenger)
        const [ride, isSenderPassenger] = await Promise.all([
          ridesRepository.findById(data.rideId),
          requestsRepository.isAcceptedPassenger(data.rideId, user.userId),
        ]);
        const isPoster = ride?.posterId?.toString() === user.userId;
        if (!isPoster && !isSenderPassenger) {
          socket.emit('message_error', { message: 'Not authorized to send messages for this ride.' });
          return;
        }

        const isGroupMessage = !data.receiverId;

        if (!isGroupMessage) {
          // Verify receiver is also a participant of this ride
          const isReceiverPassenger = await requestsRepository.isAcceptedPassenger(data.rideId, data.receiverId as string);
          const isReceiverPoster = ride?.posterId?.toString() === data.receiverId;
          if (!isReceiverPoster && !isReceiverPassenger) {
            socket.emit('message_error', { message: 'Recipient is not a participant of this ride.' });
            return;
          }

          // Check if either user has blocked the other
          const [isSenderBlocked, isReceiverBlocked] = await Promise.all([
            safetyService.checkIfBlocked(data.receiverId as string, user.userId),
            safetyService.checkIfBlocked(user.userId, data.receiverId as string)
          ]);

          if (isSenderBlocked || isReceiverBlocked) {
            socket.emit('message_error', { message: 'Cannot send message to this user.' });
            return;
          }
        }

        // Sanitize message content: strip control characters
        // eslint-disable-next-line no-control-regex
        const sanitizedContent = data.content.replace(/[\x00-\x1F\x7F]/g, '').trim();
        if (!sanitizedContent) {
          socket.emit('message_error', { message: 'Message cannot be empty after sanitization.' });
          return;
        }

        const message = await MessageModel.create({
          rideId: data.rideId,
          senderId: user.userId,
          receiverId: data.receiverId,
          isGroupMessage,
          content: sanitizedContent,
        });

        const messageDTO = {
          id: message._id.toString(),
          rideId: message.rideId.toString(),
          senderId: message.senderId.toString(),
          receiverId: message.receiverId?.toString(),
          isGroupMessage: message.isGroupMessage,
          content: message.content,
          readStatus: message.readStatus,
          createdAt: message.createdAt.toISOString(),
        };

        if (isGroupMessage) {
          io.to(`ride_${data.rideId}`).emit('receive_message', messageDTO);
        } else {
          io.to(data.receiverId as string).emit('receive_message', messageDTO);
          io.to(user.userId).emit('receive_message', messageDTO);
        }

        try {
          const sender = await usersRepository.findById(user.userId);
          if (sender) {
            if (isGroupMessage) {
              // Group message: notify all passengers and poster EXCEPT sender
              const passengers = await requestsRepository.getAcceptedPassengers(data.rideId);
              const rideDoc = await ridesRepository.findById(data.rideId);
              
              const usersToNotify = new Set<string>();
              if (rideDoc && rideDoc.posterId.toString() !== user.userId) {
                usersToNotify.add(rideDoc.posterId.toString());
              }
              passengers.forEach((p: any) => {
                const pUserId = (p.requesterId || p.userId)?.toString();
                if (pUserId && pUserId !== user.userId) {
                  usersToNotify.add(pUserId);
                }
              });

              for (const uid of usersToNotify) {
                const u = await usersRepository.findById(uid);
                if (u?.expoPushToken) {
                  notificationsService.notifyNewMessage(u.expoPushToken, `${sender.name} (Group)`, data.rideId, 'group');
                }
              }

            } else {
              // 1:1 message
              const receiver = await usersRepository.findById(data.receiverId as string);
              if (receiver?.expoPushToken) {
                notificationsService.notifyNewMessage(receiver.expoPushToken, sender.name, data.rideId, user.userId);
              }
            }
          }
        } catch (pushErr) {
          logger.error(`Error sending push notification: ${String(pushErr)}`);
        }

      } catch (error) {
        logger.error(`Error saving message: ${String(error)}`);
        return;
      }
    });

    socket.on('send_location', async (data: { rideId: string, latitude: number, longitude: number, heading?: number }) => {
      try {
        if (!checkRateLimit(socket.id)) {
          return;
        }

        // Verify sender is participant
        const [ride, isPassenger] = await Promise.all([
          ridesRepository.findById(data.rideId),
          requestsRepository.isAcceptedPassenger(data.rideId, user.userId)
        ]);
        
        const isPoster = ride?.posterId?.toString() === user.userId;
        if (!isPoster && !isPassenger) {
          return; // Unauthorised
        }

        const locationData = {
          userId: user.userId,
          latitude: data.latitude,
          longitude: data.longitude,
          heading: data.heading,
          timestamp: new Date().toISOString()
        };

        // Broadcast to ride group
        io.to(`ride_${data.rideId}`).emit('receive_location', locationData);

      } catch (error) {
        logger.error(`Error sharing location: ${String(error)}`);
      }
    });

    socket.on('mark_read', async (messageId: string) => {
      try {
        if (!checkRateLimit(socket.id)) {
          return;
        }

        const msg = await MessageModel.findById(messageId);
        if (!msg) {
          return;
        }

        // Only the intended receiver can mark a message as read
        if (msg.receiverId && msg.receiverId.toString() !== user.userId) {
          logger.warn(`Unauthorized mark_read attempt by ${user.userId} for message ${messageId}`);
          return;
        }

        await MessageModel.findByIdAndUpdate(messageId, { readStatus: true });
        io.to(msg.senderId.toString()).emit('message_read', { messageId, rideId: msg.rideId });
      } catch (error) {
        logger.error(`Error marking message read: ${String(error)}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User ${user.userId} disconnected`);
      cleanupRateLimit(socket.id);
    });
  });
}
