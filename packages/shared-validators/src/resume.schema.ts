import { z } from 'zod';

const personalInfoSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Invalid email'),
  phone: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  headline: z.string().max(200).optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  github: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
});

const experienceSchema = z.object({
  company: z.string().min(1).max(100),
  position: z.string().min(1).max(100),
  startDate: z.string().min(1),
  endDate: z.string().optional().or(z.literal('')),
  current: z.boolean().default(false),
  description: z.string().max(2000).optional(),
});

const educationSchema = z.object({
  institution: z.string().min(1).max(200),
  degree: z.string().min(1).max(100),
  fieldOfStudy: z.string().max(100).optional(),
  startDate: z.string().min(1),
  endDate: z.string().optional().or(z.literal('')),
  grade: z.string().max(20).optional(),
});

const skillSchema = z.object({
  name: z.string().min(1).max(50),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
});

const languageSchema = z.object({
  name: z.string().min(1).max(50),
  proficiency: z.string().min(1).max(50),
});

const certificationSchema = z.object({
  name: z.string().min(1).max(200),
  issuer: z.string().max(200).optional(),
  date: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
});

const projectSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  url: z.string().url().optional().or(z.literal('')),
  technologies: z.array(z.string().max(50)).optional(),
});

export const createResumeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  template: z.enum(['classic', 'modern', 'minimal']).default('classic'),
  personalInfo: personalInfoSchema,
  summary: z.string().max(2000).optional(),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(skillSchema).default([]),
  languages: z.array(languageSchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  projects: z.array(projectSchema).default([]),
});

export const updateResumeSchema = createResumeSchema.partial();

export type CreateResumeInput = z.infer<typeof createResumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
