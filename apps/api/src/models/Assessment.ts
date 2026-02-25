import mongoose, { Schema, Document } from 'mongoose';
import { AssessmentDifficulty, QuestionType } from '@job-platform/shared-types';

export interface IAssessmentOption {
  text: string;
  isCorrect: boolean;
}

export interface IAssessmentQuestion {
  questionText: string;
  questionType: QuestionType;
  options: IAssessmentOption[];
  explanation?: string;
  points: number;
  codeSnippet?: string;
}

export interface IAssessmentDocument extends Document {
  title: string;
  slug: string;
  description?: string;
  skill: mongoose.Types.ObjectId;
  skillName: string;
  difficulty: AssessmentDifficulty;
  duration: number; // minutes
  passingScore: number; // percentage
  questions: IAssessmentQuestion[];
  totalPoints: number;
  isActive: boolean;
  attemptCount: number;
  avgScore: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assessmentSchema = new Schema<IAssessmentDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    skill: {
      type: Schema.Types.ObjectId,
      ref: 'Skill',
    },
    skillName: {
      type: String,
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(AssessmentDifficulty),
      required: true,
      index: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
      max: 180,
    },
    passingScore: {
      type: Number,
      required: true,
      min: 1,
      max: 100,
      default: 70,
    },
    questions: [
      {
        questionText: { type: String, required: true },
        questionType: {
          type: String,
          enum: Object.values(QuestionType),
          required: true,
        },
        options: [
          {
            text: { type: String, required: true },
            isCorrect: { type: Boolean, required: true },
          },
        ],
        explanation: String,
        points: { type: Number, required: true, min: 1 },
        codeSnippet: String,
      },
    ],
    totalPoints: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    attemptCount: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
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

assessmentSchema.index({ skillName: 1, difficulty: 1 });
assessmentSchema.index({ isActive: 1, difficulty: 1 });

export const Assessment = mongoose.model<IAssessmentDocument>(
  'Assessment',
  assessmentSchema,
);
