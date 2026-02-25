import { CompanySize } from './enums';

export interface ICompany {
  _id: string;
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
  owners: string[];

  totalJobs: number;
  activeJobs: number;

  createdAt: Date;
  updatedAt: Date;
}
