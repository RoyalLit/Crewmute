import type { Document, Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface IReview extends Document {
  reviewerId: Types.ObjectId;
  revieweeId: Types.ObjectId;
  rideId: Types.ObjectId;
  rating: number; // 1 to 5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    revieweeId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  {
    timestamps: true,
  }
);

// A user can only review another user once per ride
reviewSchema.index({ reviewerId: 1, revieweeId: 1, rideId: 1 }, { unique: true });

export const ReviewModel = model<IReview>('Review', reviewSchema);
