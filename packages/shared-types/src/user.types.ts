import { UserRole, Gender, JobType, SkillProficiency } from './enums';

export interface UserProfile {
  firstName?: string;
  lastName?: string;
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
}

export interface ExpectedSalary {
  min?: number;
  max?: number;
  currency: string;
}

export interface IUser {
  _id: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
  isActive: boolean;
  profile: UserProfile;
  skills: string[];
  preferredJobTypes: JobType[];
  preferredCategories: string[];
  expectedSalary: ExpectedSalary;
  company?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublicProfile {
  _id: string;
  profile: UserProfile;
  skills: Array<{ name: string; proficiency: SkillProficiency }>;
  headline?: string;
  createdAt: Date;
}
