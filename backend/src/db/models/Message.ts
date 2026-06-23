import type { Document, Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface IMessage extends Document {
  rideId: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  content: string;
  readStatus: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiverId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true },
    readStatus: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ rideId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, receiverId: 1 });

export const MessageModel = model<IMessage>('Message', messageSchema);
