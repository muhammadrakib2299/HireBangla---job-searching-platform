import mongoose, { Schema, Document } from 'mongoose';
import { SkillProficiency } from '@job-platform/shared-types';

export interface IResumeDocument extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  template: 'classic' | 'modern' | 'minimal';
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    headline?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate?: string;
    grade?: string;
  }>;
  skills: Array<{
    name: string;
    proficiency?: SkillProficiency;
  }>;
  languages: Array<{
    name: string;
    proficiency: string;
  }>;
  certifications: Array<{
    name: string;
    issuer?: string;
    date?: string;
    url?: string;
  }>;
  projects: Array<{
    name: string;
    description?: string;
    url?: string;
    technologies?: string[];
  }>;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResumeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    template: {
      type: String,
      enum: ['classic', 'modern', 'minimal'],
      default: 'classic',
    },
    personalInfo: {
      fullName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true },
      phone: String,
      location: String,
      headline: String,
      linkedin: String,
      github: String,
      website: String,
    },
    summary: {
      type: String,
      maxlength: 2000,
    },
    experience: [
      {
        company: { type: String, required: true },
        position: { type: String, required: true },
        startDate: { type: String, required: true },
        endDate: String,
        current: { type: Boolean, default: false },
        description: String,
      },
    ],
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: String,
        startDate: { type: String, required: true },
        endDate: String,
        grade: String,
      },
    ],
    skills: [
      {
        name: { type: String, required: true },
        proficiency: {
          type: String,
          enum: Object.values(SkillProficiency),
        },
      },
    ],
    languages: [
      {
        name: { type: String, required: true },
        proficiency: { type: String, required: true },
      },
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: String,
        date: String,
        url: String,
      },
    ],
    projects: [
      {
        name: { type: String, required: true },
        description: String,
        url: String,
        technologies: [String],
      },
    ],
    isDefault: {
      type: Boolean,
      default: false,
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

resumeSchema.index({ userId: 1, isDefault: 1 });

export const Resume = mongoose.model<IResumeDocument>('Resume', resumeSchema);
