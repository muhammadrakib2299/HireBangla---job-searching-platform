import mongoose, { Schema, Document } from 'mongoose';
import {
  JobType,
  JobSource,
  JobStatus,
  ExperienceLevel,
  ApplicationMethod,
  SalaryPeriod,
} from '@job-platform/shared-types';

export interface IJobDocument extends Document {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;

  source: JobSource;
  sourceUrl?: string;
  sourceJobId?: string;
  sourceScrapedAt?: Date;

  company?: mongoose.Types.ObjectId;
  companyName: string;
  companyLogo?: string;

  category: string;
  subcategory?: string;
  jobType: JobType;
  experienceLevel?: ExperienceLevel;
  experienceYears?: { min?: number; max?: number };

  location: {
    district?: string;
    division?: string;
    address?: string;
    isRemote: boolean;
    country: string;
  };

  salary: {
    min?: number;
    max?: number;
    currency: string;
    isNegotiable: boolean;
    period: SalaryPeriod;
  };

  skills: mongoose.Types.ObjectId[];
  skillNames: string[];
  education?: { degree?: string; field?: string };
  requirements: string[];
  responsibilities: string[];
  benefits: string[];

  applicationMethod: ApplicationMethod;
  applicationUrl?: string;
  applicationEmail?: string;

  status: JobStatus;
  postedBy?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  deadline?: Date;
  vacancies: number;

  viewCount: number;
  applicationCount: number;
  saveCount: number;
  isFeatured: boolean;
  isApproved: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJobDocument>(
  {
    title: {
      type: String,
      required: [true, 'Job title is required'],
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
      required: [true, 'Job description is required'],
    },
    shortDescription: {
      type: String,
      maxlength: 500,
    },

    // Source tracking (for aggregated jobs)
    source: {
      type: String,
      enum: Object.values(JobSource),
      default: JobSource.ORIGINAL,
      index: true,
    },
    sourceUrl: String,
    sourceJobId: { type: String, sparse: true },
    sourceScrapedAt: Date,

    // Company (ref for original, denormalized for all)
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    companyLogo: String,

    // Classification
    category: {
      type: String,
      required: [true, 'Category is required'],
      index: true,
    },
    subcategory: String,
    jobType: {
      type: String,
      enum: Object.values(JobType),
      required: [true, 'Job type is required'],
      index: true,
    },
    experienceLevel: {
      type: String,
      enum: Object.values(ExperienceLevel),
      index: true,
    },
    experienceYears: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
    },

    // Location
    location: {
      district: { type: String, index: true },
      division: { type: String, index: true },
      address: String,
      isRemote: { type: Boolean, default: false, index: true },
      country: { type: String, default: 'Bangladesh' },
    },

    // Salary
    salary: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: 'BDT' },
      isNegotiable: { type: Boolean, default: false },
      period: {
        type: String,
        enum: Object.values(SalaryPeriod),
        default: SalaryPeriod.MONTHLY,
      },
    },

    // Skills
    skills: [{ type: Schema.Types.ObjectId, ref: 'Skill' }],
    skillNames: [String],

    // Requirements
    education: {
      degree: String,
      field: String,
    },
    requirements: [String],
    responsibilities: [String],
    benefits: [String],

    // Application
    applicationMethod: {
      type: String,
      enum: Object.values(ApplicationMethod),
      default: ApplicationMethod.INTERNAL,
    },
    applicationUrl: String,
    applicationEmail: String,

    // Status & metadata
    status: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.ACTIVE,
      index: true,
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    publishedAt: { type: Date, default: Date.now },
    deadline: { type: Date, index: true },
    vacancies: { type: Number, default: 1, min: 1 },

    // Counters
    viewCount: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
    saveCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false, index: true },
    isApproved: { type: Boolean, default: true },
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

// Weighted text index for search
jobSchema.index(
  {
    title: 'text',
    skillNames: 'text',
    companyName: 'text',
    description: 'text',
  },
  {
    weights: {
      title: 10,
      skillNames: 5,
      companyName: 3,
      description: 1,
    },
    name: 'job_text_search',
  },
);

// Compound indexes for common filter combinations
jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ status: 1, category: 1, publishedAt: -1 });
jobSchema.index({ status: 1, 'location.division': 1, publishedAt: -1 });
jobSchema.index({ source: 1, sourceJobId: 1 }, { unique: true, sparse: true });
jobSchema.index({ postedBy: 1, status: 1, createdAt: -1 });
jobSchema.index({ isApproved: 1, status: 1, publishedAt: -1 });
jobSchema.index({ 'location.isRemote': 1, status: 1, publishedAt: -1 });

export const Job = mongoose.model<IJobDocument>('Job', jobSchema);
