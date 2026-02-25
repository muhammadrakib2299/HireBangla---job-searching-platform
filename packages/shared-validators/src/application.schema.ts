import { z } from 'zod';

export const applyJobSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  resume: z.string().optional(),
  coverLetter: z
    .string()
    .max(5000, 'Cover letter must be under 5000 characters')
    .optional(),
  answers: z
    .array(
      z.object({
        question: z.string().min(1),
        answer: z.string().min(1),
      }),
    )
    .optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum([
    'applied',
    'viewed',
    'shortlisted',
    'interview',
    'offered',
    'hired',
    'rejected',
    'withdrawn',
  ]),
  note: z.string().max(500).optional(),
});

export const addEmployerNotesSchema = z.object({
  notes: z.string().max(2000, 'Notes must be under 2000 characters'),
  rating: z.number().int().min(1).max(5).optional(),
});

export type ApplyJobInput = z.infer<typeof applyJobSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type AddEmployerNotesInput = z.infer<typeof addEmployerNotesSchema>;
