import { Resume } from '../models/Resume.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  getPaginationOptions,
  getPaginationResult,
  getSkip,
} from '../utils/pagination.js';
import type { CreateResumeInput, UpdateResumeInput } from '@job-platform/shared-validators';

export async function createResume(userId: string, input: CreateResumeInput) {
  // If this is the first resume, make it default
  const count = await Resume.countDocuments({ userId });
  const isDefault = count === 0;

  const resume = await Resume.create({
    userId,
    ...input,
    isDefault,
  });

  return resume;
}

export async function listResumes(userId: string, page?: number, limit?: number) {
  const pagination = getPaginationOptions(page, limit);

  const [resumes, total] = await Promise.all([
    Resume.find({ userId })
      .sort({ isDefault: -1, updatedAt: -1 })
      .skip(getSkip(pagination))
      .limit(pagination.limit)
      .lean(),
    Resume.countDocuments({ userId }),
  ]);

  return {
    resumes,
    ...getPaginationResult(total, pagination),
  };
}

export async function getResume(resumeId: string, userId: string) {
  const resume = await Resume.findById(resumeId).lean();
  if (!resume) throw new AppError('Resume not found', 404);
  if (resume.userId.toString() !== userId) {
    throw new AppError('Not authorized to access this resume', 403);
  }
  return resume;
}

export async function updateResume(
  resumeId: string,
  userId: string,
  input: UpdateResumeInput,
) {
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new AppError('Resume not found', 404);
  if (resume.userId.toString() !== userId) {
    throw new AppError('Not authorized to update this resume', 403);
  }

  Object.assign(resume, input);
  await resume.save();

  return resume;
}

export async function deleteResume(resumeId: string, userId: string) {
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new AppError('Resume not found', 404);
  if (resume.userId.toString() !== userId) {
    throw new AppError('Not authorized to delete this resume', 403);
  }

  const wasDefault = resume.isDefault;
  await resume.deleteOne();

  // If deleted resume was default, make the most recent one default
  if (wasDefault) {
    const nextResume = await Resume.findOne({ userId }).sort({ updatedAt: -1 });
    if (nextResume) {
      nextResume.isDefault = true;
      await nextResume.save();
    }
  }

  return { message: 'Resume deleted successfully' };
}

export async function setDefaultResume(resumeId: string, userId: string) {
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new AppError('Resume not found', 404);
  if (resume.userId.toString() !== userId) {
    throw new AppError('Not authorized to update this resume', 403);
  }

  // Unset all other defaults for this user
  await Resume.updateMany(
    { userId, _id: { $ne: resumeId } },
    { isDefault: false },
  );

  resume.isDefault = true;
  await resume.save();

  return resume;
}
