import { z } from 'zod';

export const createJobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  shortDescription: z.string().max(500).optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance', 'remote']),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
  experienceYears: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
    })
    .optional(),
  location: z.object({
    district: z.string().optional(),
    division: z.string().optional(),
    address: z.string().optional(),
    isRemote: z.boolean().default(false),
  }),
  salary: z
    .object({
      min: z.number().min(0).optional(),
      max: z.number().min(0).optional(),
      currency: z.string().default('BDT'),
      isNegotiable: z.boolean().default(false),
      period: z.enum(['monthly', 'yearly', 'hourly']).default('monthly'),
    })
    .optional(),
  skillNames: z.array(z.string()).optional(),
  education: z
    .object({
      degree: z.string().optional(),
      field: z.string().optional(),
    })
    .optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  applicationMethod: z.enum(['internal', 'external', 'email']).default('internal'),
  applicationUrl: z.string().url().optional(),
  applicationEmail: z.string().email().optional(),
  deadline: z.string().datetime().optional(),
  vacancies: z.number().int().min(1).default(1),
});

export const jobSearchSchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  jobType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'freelance', 'remote']).optional(),
  experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
  salaryMin: z.coerce.number().min(0).optional(),
  salaryMax: z.coerce.number().min(0).optional(),
  source: z.enum(['original', 'bdjobs', 'shomvob', 'impactpool', 'careerjet', 'nextjobz', 'skilljobs', 'unjobs']).optional(),
  isRemote: z.coerce.boolean().optional(),
  postedAfter: z.string().optional(),
  sort: z.enum(['relevance', 'date', 'salary']).default('date'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type JobSearchInput = z.infer<typeof jobSearchSchema>;
