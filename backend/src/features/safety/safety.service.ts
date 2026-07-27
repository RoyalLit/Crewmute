import { ValidationError } from '../../shared/errors';

import { safetyRepository } from './safety.repository';
import type { ReportRequestDTO, BlockRequestDTO, ReportResponseDTO } from './safety.types';

export class SafetyService {
  async reportUser(reporterId: string, dto: ReportRequestDTO): Promise<ReportResponseDTO> {
    if (reporterId === dto.reportedUserId) {
      throw new ValidationError('Cannot report yourself');
    }

    const report = await safetyRepository.createReport(reporterId, dto);
    
    return {
      id: report._id.toString(),
      reporterId: report.reporterId,
      reportedUserId: report.reportedUserId,
      reason: report.reason,
      status: report.status,
      createdAt: report.createdAt.toISOString(),
    };
  }

  async blockUser(userId: string, dto: BlockRequestDTO): Promise<void> {
    if (userId === dto.userIdToBlock) {
      throw new ValidationError('Cannot block yourself');
    }

    await safetyRepository.blockUser(userId, dto.userIdToBlock);
  }

  async checkIfBlocked(userId: string, targetUserId: string): Promise<boolean> {
    return safetyRepository.isUserBlocked(userId, targetUserId);
  }

  async triggerSos(userId: string, latitude?: number, longitude?: number, rideId?: string): Promise<void> {
    const { usersRepository } = await import('../users/users.repository');
    const { emailService } = await import('../../shared/mailer');
    const logger = (await import('../../shared/logger')).default;

    const user = await usersRepository.findById(userId);
    if (!user) return;

    const locationLink = (latitude && longitude) ? `https://maps.google.com/?q=${latitude},${longitude}` : 'Unknown Location';

    const messageBody = `EMERGENCY SOS: ${user.name} has triggered an SOS alert.\nLocation: ${locationLink}\nRide ID: ${rideId || 'Unknown'}`;

    if (user.emergencyContacts && user.emergencyContacts.length > 0) {
      for (const contact of user.emergencyContacts) {
        // Send email to emergency contact (assuming phone might be email for MVP or we just log it)
        // For the sake of the MVP, if the contact phone has an '@', we treat it as an email.
        const target = contact.phone; 
        if (target.includes('@')) {
          await emailService.sendEmail(
            target,
            `SOS Alert from ${user.name}`,
            messageBody
          ).catch((e: any) => logger.error(`Failed to send SOS email to ${target}`, e));
        }
      }
    }

    // In a real production app, we would also hit Twilio SMS API here.
    logger.info(`[SOS TRIGGERED] User: ${userId}, Location: ${locationLink}, Ride: ${rideId}`);
  }
}

export const safetyService = new SafetyService();
