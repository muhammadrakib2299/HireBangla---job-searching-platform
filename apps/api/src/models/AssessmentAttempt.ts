import mongoose, { Schema, Document } from 'mongoose';

export interface IAttemptAnswer {
  questionIndex: number;
  selectedOption: number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface IAssessmentAttemptDocument extends Document {
  user: mongoose.Types.ObjectId;
  assessment: mongoose.Types.ObjectId;
  answers: IAttemptAnswer[];
  score: number; // percentage
  pointsEarned: number;
  totalPoints: number;
  passed: boolean;
  timeTaken: number; // seconds
  startedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentAttemptSchema = new Schema<IAssessmentAttemptDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assessment: {
      type: Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    answers: [
      {
        questionIndex: { type: Number, required: true },
        selectedOption: { type: Number, required: true },
        isCorrect: { type: Boolean, required: true },
        pointsEarned: { type: Number, required: true, default: 0 },
      },
    ],
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    pointsEarned: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    passed: {
      type: Boolean,
      required: true,
      index: true,
    },
    timeTaken: {
      type: Number,
      required: true,
      min: 0,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    completedAt: Date,
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

// One attempt per user per assessment (can retake after cooldown via service logic)
assessmentAttemptSchema.index({ user: 1, assessment: 1 });
// Leaderboard queries
assessmentAttemptSchema.index({ assessment: 1, score: -1 });
// User's passed assessments
assessmentAttemptSchema.index({ user: 1, passed: 1 });

export const AssessmentAttempt = mongoose.model<IAssessmentAttemptDocument>(
  'AssessmentAttempt',
  assessmentAttemptSchema,
);
