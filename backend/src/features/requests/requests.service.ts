import { requestsRepository } from './requests.repository';
import { ridesRepository } from '../rides/rides.repository';
import { usersService } from '../users/users.service';
import { ridesService } from '../rides/rides.service';
import { CreateRequestDTO, RideRequestResponseDTO } from './requests.types';
import { NotFoundError, ForbiddenError, AppError, ConflictError } from '../../shared/errors';

export class RequestsService {
  private formatRequest(req: any): RideRequestResponseDTO {
    return {
      id: req._id.toString(),
      rideId: req.rideId.toString(),
      requesterId: req.requesterId.toString(),
      posterId: req.posterId.toString(),
      status: req.status,
      createdAt: req.createdAt,
    };
  }

  async createRequest(userId: string, data: CreateRequestDTO): Promise<RideRequestResponseDTO> {
    const ride = await ridesRepository.findById(data.rideId);
    if (!ride) {
      throw new NotFoundError('Ride', data.rideId);
    }

    if (ride.posterId.toString() === userId) {
      throw new ForbiddenError('request a seat on your own ride');
    }

    if (ride.status !== 'active' || ride.availableSeats <= 0) {
      throw new ConflictError('This ride is no longer available.');
    }

    try {
      const request = await requestsRepository.createRequest(data.rideId, userId, ride.posterId.toString());
      return this.formatRequest(request);
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError('You have already requested a seat on this ride.');
      }
      throw new AppError('INTERNAL_ERROR', 'Failed to create request', 500);
    }
  }

  async getMyRequests(userId: string): Promise<RideRequestResponseDTO[]> {
    const requests = await requestsRepository.findByRequester(userId);
    
    return Promise.all(
      requests.map(async (req) => {
        const formatted = this.formatRequest(req);
        try {
          formatted.ride = await ridesService.getRideDetails(formatted.rideId);
        } catch (e) {}
        return formatted;
      })
    );
  }

  async getIncomingRequests(userId: string): Promise<RideRequestResponseDTO[]> {
    const requests = await requestsRepository.findByPoster(userId);
    
    return Promise.all(
      requests.map(async (req) => {
        const formatted = this.formatRequest(req);
        try {
          formatted.requester = await usersService.getPublicProfile(formatted.requesterId);
          formatted.ride = await ridesService.getRideDetails(formatted.rideId);
        } catch (e) {}
        return formatted;
      })
    );
  }

  async acceptRequest(id: string, userId: string): Promise<RideRequestResponseDTO> {
    const request = await requestsRepository.findById(id);
    if (!request) throw new NotFoundError('RideRequest', id);
    if (request.posterId.toString() !== userId) throw new ForbiddenError('accept this request');
    if (request.status !== 'pending') throw new ConflictError(`Cannot accept a ${request.status} request.`);

    const ride = await ridesRepository.findById(request.rideId.toString());
    if (!ride || ride.availableSeats <= 0) {
      throw new ConflictError('No available seats left on this ride.');
    }

    const updatedRide = await ridesRepository.updateRide((ride as any)._id.toString(), { availableSeats: ride.availableSeats - 1 });
    if (!updatedRide) throw new AppError('INTERNAL_ERROR', 'Failed to update ride seats', 500);

    const updatedRequest = await requestsRepository.updateStatus(id, 'accepted');
    return this.formatRequest(updatedRequest);
  }

  async rejectRequest(id: string, userId: string): Promise<RideRequestResponseDTO> {
    const request = await requestsRepository.findById(id);
    if (!request) throw new NotFoundError('RideRequest', id);
    if (request.posterId.toString() !== userId) throw new ForbiddenError('reject this request');
    if (request.status !== 'pending') throw new ConflictError(`Cannot reject a ${request.status} request.`);

    const updatedRequest = await requestsRepository.updateStatus(id, 'rejected');
    return this.formatRequest(updatedRequest);
  }

  async withdrawRequest(id: string, userId: string): Promise<RideRequestResponseDTO> {
    const request = await requestsRepository.findById(id);
    if (!request) throw new NotFoundError('RideRequest', id);
    if (request.requesterId.toString() !== userId) throw new ForbiddenError('withdraw this request');
    
    if (request.status === 'accepted') {
      // Re-increment ride available seats
      const ride = await ridesRepository.findById(request.rideId.toString());
      if (ride) {
        await ridesRepository.updateRide((ride as any)._id.toString(), { availableSeats: ride.availableSeats + 1 });
      }
    }

    const updatedRequest = await requestsRepository.updateStatus(id, 'withdrawn');
    return this.formatRequest(updatedRequest);
  }
}

export const requestsService = new RequestsService();
