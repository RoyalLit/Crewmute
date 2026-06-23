import type { UserResponseDTO } from '../auth/auth.types';

export interface UpdateProfileRequestDTO {
  name?: string;
  college?: string;
  homeCity?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

// Reuse UserResponseDTO for sending user profiles out
export type PublicProfileResponseDTO = Pick<UserResponseDTO, 'id' | 'name' | 'college' | 'homeCity' | 'profilePhotoUrl' | 'gender' | 'isCollegeVerified' | 'averageRating' | 'totalReviews'>;

export interface CreateReviewRequestDTO {
  rideId: string;
  rating: number; // 1-5
  comment?: string;
}

export interface ReviewResponseDTO {
  id: string;
  reviewerId: string;
  reviewer?: PublicProfileResponseDTO; // populated when returning
  revieweeId: string;
  rideId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

