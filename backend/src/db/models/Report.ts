import { Schema, model, Document } from 'mongoose';

export interface IReport extends Document {
  reporterId: string;
  reportedUserId: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    reporterId: { 
      type: String, 
      required: true, 
      index: true 
    },
    reportedUserId: { 
      type: String, 
      required: true, 
      index: true 
    },
    reason: { 
      type: String, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'reviewed', 'resolved'], 
      default: 'pending' 
    }
  },
  { 
    timestamps: true 
  }
);

// Supports: ReportRepository.findByStatus()
ReportSchema.index({ status: 1 });

export const ReportModel = model<IReport>('Report', ReportSchema);
