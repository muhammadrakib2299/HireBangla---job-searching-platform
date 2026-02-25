import {
  JobType,
  JobSource,
  JobStatus,
  ExperienceLevel,
  ApplicationMethod,
  SalaryPeriod,
} from './enums.js';

export interface JobLocation {
  district?: string;
  division?: string;
  address?: string;
  isRemote: boolean;
  country: string;
}

export interface JobSalary {
  min?: number;
  max?: number;
  currency: string;
  isNegotiable: boolean;
  period: SalaryPeriod;
}

export interface JobEducation {
  degree?: string;
  field?: string;
}

export interface IJob {
  _id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;

  source: JobSource;
  sourceUrl?: string;
  sourceJobId?: string;
  sourceScrapedAt?: Date;

  company?: string;
  companyName: string;
  companyLogo?: string;

  category: string;
  subcategory?: string;
  jobType: JobType;
  experienceLevel?: ExperienceLevel;
  experienceYears?: { min?: number; max?: number };

  location: JobLocation;
  salary: JobSalary;

  skills: string[];
  skillNames: string[];
  education?: JobEducation;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];

  applicationMethod: ApplicationMethod;
  applicationUrl?: string;
  applicationEmail?: string;

  status: JobStatus;
  postedBy?: string;
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

export interface JobSearchParams {
  q?: string;
  category?: string;
  division?: string;
  district?: string;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  source?: JobSource;
  isRemote?: boolean;
  postedAfter?: string;
  sort?: 'relevance' | 'date' | 'salary';
  page?: number;
  limit?: number;
}

export interface JobListResponse {
  jobs: IJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
