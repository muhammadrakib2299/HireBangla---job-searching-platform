import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  UserRole,
  Gender,
  JobType,
  SkillProficiency,
} from '@job-platform/shared-types';

export interface IRefreshToken {
  token: string;
  expiresAt: Date;
  device?: string;
}

export interface IUserSkill {
  name: string;
  proficiency: SkillProficiency;
}

export interface IUserDocument extends Document {
  email: string;
  password?: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  googleId?: string;

  profile: {
    firstName: string;
    lastName: string;
    phone?: string;
    avatar?: string;
    dateOfBirth?: Date;
    gender?: Gender;
    location?: {
      district?: string;
      division?: string;
      address?: string;
    };
    headline?: string;
    bio?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  };

  skills: IUserSkill[];
  preferredJobTypes: JobType[];
  preferredCategories: string[];
  expectedSalary: {
    min?: number;
    max?: number;
    currency: string;
  };

  company?: mongoose.Types.ObjectId;
  refreshTokens: IRefreshToken[];

  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.JOBSEEKER,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    profile: {
      firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: 50,
      },
      lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: 50,
      },
      phone: { type: String, trim: true },
      avatar: String,
      dateOfBirth: Date,
      gender: {
        type: String,
        enum: Object.values(Gender),
      },
      location: {
        district: String,
        division: String,
        address: String,
      },
      headline: { type: String, maxlength: 200 },
      bio: { type: String, maxlength: 2000 },
      website: String,
      linkedin: String,
      github: String,
    },

    skills: [
      {
        name: { type: String, required: true },
        proficiency: {
          type: String,
          enum: Object.values(SkillProficiency),
          default: SkillProficiency.BEGINNER,
        },
      },
    ],

    preferredJobTypes: [
      {
        type: String,
        enum: Object.values(JobType),
      },
    ],

    preferredCategories: [String],

    expectedSalary: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 },
      currency: { type: String, default: 'BDT' },
    },

    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
    },

    refreshTokens: [
      {
        token: { type: String, required: true },
        expiresAt: { type: Date, required: true },
        device: String,
      },
    ],

    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    lastLoginAt: Date,
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.__v;
        return ret;
      },
    },
  },
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Clean up expired refresh tokens on save
userSchema.pre('save', function (next) {
  if (this.isModified('refreshTokens')) {
    this.refreshTokens = this.refreshTokens.filter(
      (rt) => rt.expiresAt > new Date(),
    );
  }
  next();
});

export const User = mongoose.model<IUserDocument>('User', userSchema);
