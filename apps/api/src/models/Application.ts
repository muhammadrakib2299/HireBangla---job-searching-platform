import mongoose, { Schema, Document } from 'mongoose';
import { ApplicationStatus } from '@job-platform/shared-types';

export interface IStatusHistoryEntry {
  status: ApplicationStatus;
  changedAt: Date;
  changedBy?: mongoose.Types.ObjectId;
  note?: string;
}

export interface IApplicationDocument extends Document {
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  resume?: string;

  coverLetter?: string;
  answers?: Array<{ question: string; answer: string }>;

  status: ApplicationStatus;
  employerNotes?: string;
  rating?: number;
  statusHistory: IStatusHistoryEntry[];
  matchScore?: number;

  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplicationDocument>(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job is required'],
      index: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant is required'],
      index: true,
    },
    resume: String,

    coverLetter: { type: String, maxlength: 5000 },
    answers: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],

    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.APPLIED,
      index: true,
    },
    employerNotes: { type: String, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5 },
    statusHistory: [
      {
        status: {
          type: String,
          enum: Object.values(ApplicationStatus),
          required: true,
        },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],
    matchScore: { type: Number, min: 0, max: 100 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Unique compound index: one application per job per applicant
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

// Index for employer queries
applicationSchema.index({ job: 1, status: 1 });

export const Application = mongoose.model<IApplicationDocument>(
  'Application',
  applicationSchema,
);
