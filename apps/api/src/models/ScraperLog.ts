import mongoose, { Schema, Document } from 'mongoose';
import { JobSource } from '@job-platform/shared-types';

export interface IScraperLogDocument extends Document {
  source: JobSource;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  duration?: number; // milliseconds
  stats: {
    fetched: number;
    new: number;
    updated: number;
    duplicates: number;
    errors: number;
  };
  errorMessages: string[];
  triggeredBy: 'cron' | 'manual';
  createdAt: Date;
}

const scraperLogSchema = new Schema<IScraperLogDocument>(
  {
    source: {
      type: String,
      enum: Object.values(JobSource),
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['running', 'completed', 'failed'],
      required: true,
      index: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completedAt: Date,
    duration: Number,
    stats: {
      fetched: { type: Number, default: 0 },
      new: { type: Number, default: 0 },
      updated: { type: Number, default: 0 },
      duplicates: { type: Number, default: 0 },
      errors: { type: Number, default: 0 },
    },
    errorMessages: [String],
    triggeredBy: {
      type: String,
      enum: ['cron', 'manual'],
      default: 'cron',
    },
  },
  { timestamps: true },
);

// 90-day TTL
scraperLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

// Index for querying latest log per source
scraperLogSchema.index({ source: 1, startedAt: -1 });

export const ScraperLog = mongoose.model<IScraperLogDocument>(
  'ScraperLog',
  scraperLogSchema,
);
