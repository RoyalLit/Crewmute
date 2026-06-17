import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import * as jwt from 'jsonwebtoken';
import env from '../../config/env';
import { JwtPayload } from '../auth/auth.types';
import { MessageModel } from '../../db/models/Message';
import logger from '../../shared/logger';

export function initializeSockets(server: HttpServer): void {
  const io = new SocketIOServer(server, {
    cors: {
      origin: env.clientUrl,
      methods: ['GET', 'POST'],
    },
  });

  // Authentication Middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication token missing'));
    }

    try {
      const decoded = jwt.verify(token, env.accessTokenSecret) as JwtPayload;
      // Attach user info to socket
      (socket as any).user = decoded;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as JwtPayload;
    logger.info(`User ${user.userId} connected to sockets`);

    // Users join a room representing their own ID to receive direct messages
    void socket.join(user.userId);

    // Join a specific ride chat room
    socket.on('join_ride', (rideId: string) => {
      void socket.join(`ride_${rideId}`);
      logger.info(`User ${user.userId} joined ride room ride_${rideId}`);
    });

    socket.on('send_message', async (data: { rideId: string, receiverId: string, content: string }) => {
      try {
        // Check if either user has blocked the other
        const { safetyService } = await import('../safety/safety.service');
        const [isSenderBlocked, isReceiverBlocked] = await Promise.all([
          safetyService.checkIfBlocked(data.receiverId, user.userId), // Has the receiver blocked the sender?
          safetyService.checkIfBlocked(user.userId, data.receiverId)  // Has the sender blocked the receiver?
        ]);

        if (isSenderBlocked || isReceiverBlocked) {
          // Send an error event back to the sender
          socket.emit('message_error', { message: 'Cannot send message to this user.' });
          return;
        }

        const message = await MessageModel.create({
          rideId: data.rideId,
          senderId: user.userId,
          receiverId: data.receiverId,
          content: data.content,
        });

        const messageDTO = {
          id: message._id.toString(),
          rideId: message.rideId.toString(),
          senderId: message.senderId.toString(),
          receiverId: message.receiverId.toString(),
          content: message.content,
          readStatus: message.readStatus,
          createdAt: message.createdAt.toISOString(),
        };

        // Emit to the specific receiver
        io.to(data.receiverId).emit('receive_message', messageDTO);
        
        // Also emit back to the sender so they can update their UI if they are on multiple devices
        io.to(user.userId).emit('receive_message', messageDTO);

        // Notify receiver
        try {
          const { usersRepository } = await import('../users/users.repository');
          const { notificationsService } = await import('../notifications/notifications.service');
          
          const [receiver, sender] = await Promise.all([
            usersRepository.findById(data.receiverId),
            usersRepository.findById(user.userId)
          ]);
          
          if (receiver?.expoPushToken && sender) {
            notificationsService.notifyNewMessage(receiver.expoPushToken, sender.name);
          }
        } catch (pushErr) {
          logger.error(`Error sending push notification: ${String(pushErr)}`);
        }

      } catch (error) {
        logger.error(`Error saving message: ${String(error)}`);
        return;
      }
    });

    socket.on('mark_read', async (messageId: string) => {
      try {
        await MessageModel.findByIdAndUpdate(messageId, { readStatus: true });
        // Emit read receipt back to the sender
        // To do this properly, we need the message document to know the sender
        const msg = await MessageModel.findById(messageId);
        if (msg) {
          io.to(msg.senderId.toString()).emit('message_read', { messageId, rideId: msg.rideId });
        }
      } catch (error) {
        logger.error(`Error marking message read: ${String(error)}`);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User ${user.userId} disconnected`);
    });
  });
}
