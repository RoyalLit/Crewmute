import { RideRequestModel, IRideRequest } from '../../db/models/RideRequest';

export class RequestsRepository {
  async createRequest(rideId: string, requesterId: string, posterId: string): Promise<IRideRequest> {
    const request = await RideRequestModel.create({
      rideId,
      requesterId,
      posterId,
      status: 'pending',
    });
    return request.toObject() as unknown as IRideRequest;
  }

  async findById(id: string): Promise<IRideRequest | null> {
    const request = await RideRequestModel.findById(id).lean();
    return request ? (request as unknown as IRideRequest) : null;
  }

  async findByRequester(requesterId: string): Promise<IRideRequest[]> {
    const requests = await RideRequestModel.find({ requesterId }).sort({ createdAt: -1 }).lean();
    return requests as unknown as IRideRequest[];
  }

  async findByPoster(posterId: string): Promise<IRideRequest[]> {
    const requests = await RideRequestModel.find({ posterId }).sort({ createdAt: -1 }).lean();
    return requests as unknown as IRideRequest[];
  }

  async updateStatus(id: string, status: 'accepted' | 'rejected' | 'withdrawn'): Promise<IRideRequest | null> {
    const request = await RideRequestModel.findByIdAndUpdate(id, { status }, { new: true }).lean();
    return request ? (request as unknown as IRideRequest) : null;
  }
}

export const requestsRepository = new RequestsRepository();
