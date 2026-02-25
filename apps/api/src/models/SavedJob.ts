import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedJobDocument extends Document {
  user: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  createdAt: Date;
}

const savedJobSchema = new Schema<ISavedJobDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
  },
  { timestamps: true },
);

// One save per user per job
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

export const SavedJob = mongoose.model<ISavedJobDocument>(
  'SavedJob',
  savedJobSchema,
);
