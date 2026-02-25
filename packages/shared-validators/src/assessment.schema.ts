import { z } from 'zod';

export const createAssessmentSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  skillName: z.string().min(1),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().int().min(1).max(180),
  passingScore: z.number().int().min(1).max(100).default(70),
  questions: z
    .array(
      z.object({
        questionText: z.string().min(1),
        questionType: z.enum(['multiple-choice', 'true-false', 'code-snippet']),
        options: z
          .array(
            z.object({
              text: z.string().min(1),
              isCorrect: z.boolean(),
            }),
          )
          .min(2)
          .max(6),
        explanation: z.string().optional(),
        points: z.number().int().min(1).default(1),
        codeSnippet: z.string().optional(),
      }),
    )
    .min(1)
    .max(100),
});

export const submitAssessmentSchema = z.object({
  answers: z.array(
    z.object({
      questionIndex: z.number().int().min(0),
      selectedOption: z.number().int().min(0),
    }),
  ),
  timeTaken: z.number().int().min(0),
  startedAt: z.string().datetime(),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type SubmitAssessmentInput = z.infer<typeof submitAssessmentSchema>;
