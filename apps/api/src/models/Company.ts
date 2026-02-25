import mongoose, { Schema, Document } from 'mongoose';
import { CompanySize } from '@job-platform/shared-types';

export interface ICompanyDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  industry: string;
  companySize?: CompanySize;
  founded?: number;
  website?: string;
  logo?: string;
  coverImage?: string;

  location: {
    address?: string;
    district?: string;
    division?: string;
    country: string;
  };

  contactEmail?: string;
  contactPhone?: string;

  socialLinks?: {
    linkedin?: string;
    facebook?: string;
    twitter?: string;
  };

  isVerified: boolean;
  verifiedAt?: Date;
  owners: mongoose.Types.ObjectId[];

  totalJobs: number;
  activeJobs: number;

  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompanyDocument>(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: 200,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      maxlength: 5000,
    },
    industry: {
      type: String,
      required: [true, 'Industry is required'],
      trim: true,
      index: true,
    },
    companySize: {
      type: String,
      enum: Object.values(CompanySize),
    },
    founded: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear(),
    },
    website: { type: String, trim: true },
    logo: String,
    coverImage: String,

    location: {
      address: String,
      district: { type: String, index: true },
      division: { type: String, index: true },
      country: { type: String, default: 'Bangladesh' },
    },

    contactEmail: { type: String, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },

    socialLinks: {
      linkedin: String,
      facebook: String,
      twitter: String,
    },

    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verifiedAt: Date,

    owners: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],

    totalJobs: { type: Number, default: 0 },
    activeJobs: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Text index for company search
companySchema.index({ name: 'text', description: 'text' });

export const Company = mongoose.model<ICompanyDocument>(
  'Company',
  companySchema,
);
