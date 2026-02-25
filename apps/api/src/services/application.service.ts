import mongoose from 'mongoose';
import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { SavedJob } from '../models/SavedJob.js';
import { AppError } from '../middleware/errorHandler.js';
import { ApplicationStatus, NotificationType, JobStatus } from '@job-platform/shared-types';
import * as notificationService from './notification.service.js';
import {
  getPaginationOptions,
  getPaginationResult,
  getSkip,
} from '../utils/pagination.js';
import type {
  ApplyJobInput,
  UpdateApplicationStatusInput,
  AddEmployerNotesInput,
} from '@job-platform/shared-validators';

// ─── Apply to Job ─────────────────────────────────────────────────────────────

export async function applyToJob(input: ApplyJobInput, applicantId: string) {
  const job = await Job.findById(input.jobId);
  if (!job) throw new AppError('Job not found', 404);

  if (job.status !== JobStatus.ACTIVE) {
    throw new AppError('This job is no longer accepting applications', 400);
  }

  if (job.deadline && new Date(job.deadline) < new Date()) {
    throw new AppError('Application deadline has passed', 400);
  }

  // Check if user is the job poster
  if (job.postedBy?.toString() === applicantId) {
    throw new AppError('You cannot apply to your own job', 400);
  }

  // Check for duplicate application (handled by unique index, but give friendly message)
  const existing = await Application.findOne({
    job: input.jobId,
    applicant: applicantId,
  });
  if (existing) {
    throw new AppError('You have already applied to this job', 409);
  }

  const application = await Application.create({
    job: input.jobId,
    applicant: applicantId,
    resume: input.resume,
    coverLetter: input.coverLetter,
    answers: input.answers,
    status: ApplicationStatus.APPLIED,
    statusHistory: [
      {
        status: ApplicationStatus.APPLIED,
        changedAt: new Date(),
        changedBy: new mongoose.Types.ObjectId(applicantId),
      },
    ],
  });

  // Increment application count on the job
  await Job.findByIdAndUpdate(input.jobId, { $inc: { applicationCount: 1 } });

  // Notify employer
  if (job.postedBy) {
    notificationService.createNotification({
      user: job.postedBy.toString(),
      type: NotificationType.NEW_APPLICATION,
      title: 'New Application Received',
      message: `Someone applied to your "${job.title}" position.`,
      link: `/dashboard/employer/applications/${application._id}`,
    });
  }

  return application;
}

// ─── Get My Applications (Jobseeker) ──────────────────────────────────────────

export async function getMyApplications(
  applicantId: string,
  page?: number,
  limit?: number,
  status?: string,
) {
  const pagination = getPaginationOptions(page, limit);
  const filter: Record<string, unknown> = { applicant: applicantId };
  if (status) filter.status = status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .sort({ createdAt: -1 })
      .skip(getSkip(pagination))
      .limit(pagination.limit)
      .populate({
        path: 'job',
        select: 'title slug companyName companyLogo location jobType salary status deadline',
      })
      .lean(),
    Application.countDocuments(filter),
  ]);

  return {
    applications,
    ...getPaginationResult(total, pagination),
  };
}

// ─── Get Applications for Job (Employer) ──────────────────────────────────────

export async function getJobApplications(
  jobId: string,
  employerId: string,
  page?: number,
  limit?: number,
  status?: string,
) {
  // Verify job ownership
  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found', 404);
  if (job.postedBy?.toString() !== employerId) {
    throw new AppError('You can only view applications for your own jobs', 403);
  }

  const pagination = getPaginationOptions(page, limit);
  const filter: Record<string, unknown> = { job: jobId };
  if (status) filter.status = status;

  const [applications, total] = await Promise.all([
    Application.find(filter)
      .sort({ createdAt: -1 })
      .skip(getSkip(pagination))
      .limit(pagination.limit)
      .populate({
        path: 'applicant',
        select: 'profile.firstName profile.lastName profile.avatar email',
      })
      .lean(),
    Application.countDocuments(filter),
  ]);

  return {
    applications,
    ...getPaginationResult(total, pagination),
  };
}

// ─── Get Single Application ───────────────────────────────────────────────────

export async function getApplication(applicationId: string, userId: string) {
  const application = await Application.findById(applicationId)
    .populate({
      path: 'job',
      select: 'title slug companyName companyLogo location jobType salary status postedBy',
    })
    .populate({
      path: 'applicant',
      select: 'profile.firstName profile.lastName profile.avatar email',
    });

  if (!application) throw new AppError('Application not found', 404);

  // Only applicant or job owner can view
  const isApplicant = application.applicant._id.toString() === userId;
  const isEmployer = (application.job as any).postedBy?.toString() === userId;

  if (!isApplicant && !isEmployer) {
    throw new AppError('You do not have permission to view this application', 403);
  }

  return application;
}

// ─── Update Application Status (Employer) ─────────────────────────────────────

export async function updateApplicationStatus(
  applicationId: string,
  input: UpdateApplicationStatusInput,
  employerId: string,
) {
  const application = await Application.findById(applicationId).populate('job', 'postedBy title');
  if (!application) throw new AppError('Application not found', 404);

  const job = application.job as any;
  if (job.postedBy?.toString() !== employerId) {
    throw new AppError('You can only update applications for your own jobs', 403);
  }

  application.status = input.status as ApplicationStatus;
  application.statusHistory.push({
    status: input.status as ApplicationStatus,
    changedAt: new Date(),
    changedBy: new mongoose.Types.ObjectId(employerId),
    note: input.note,
  });

  await application.save();

  // Notify applicant about status change
  const statusLabels: Record<string, string> = {
    viewed: 'viewed by employer',
    shortlisted: 'shortlisted',
    interview: 'selected for interview',
    offered: 'received an offer',
    hired: 'been hired',
    rejected: 'not been selected',
  };

  const statusLabel = statusLabels[input.status];
  if (statusLabel) {
    notificationService.createNotification({
      user: application.applicant.toString(),
      type: NotificationType.APPLICATION_STATUS,
      title: 'Application Status Updated',
      message: `Your application for "${job.title}" has ${statusLabel}.`,
      link: `/dashboard/jobseeker/applications/${applicationId}`,
    });
  }

  return application;
}

// ─── Add Employer Notes ───────────────────────────────────────────────────────

export async function addEmployerNotes(
  applicationId: string,
  input: AddEmployerNotesInput,
  employerId: string,
) {
  const application = await Application.findById(applicationId).populate('job', 'postedBy');
  if (!application) throw new AppError('Application not found', 404);

  const job = application.job as any;
  if (job.postedBy?.toString() !== employerId) {
    throw new AppError('You can only add notes to applications for your own jobs', 403);
  }

  application.employerNotes = input.notes;
  if (input.rating !== undefined) {
    application.rating = input.rating;
  }
  await application.save();

  return application;
}

// ─── Withdraw Application (Jobseeker) ─────────────────────────────────────────

export async function withdrawApplication(
  applicationId: string,
  applicantId: string,
) {
  const application = await Application.findById(applicationId);
  if (!application) throw new AppError('Application not found', 404);
  if (application.applicant.toString() !== applicantId) {
    throw new AppError('You can only withdraw your own applications', 403);
  }

  if (application.status === ApplicationStatus.WITHDRAWN) {
    throw new AppError('Application is already withdrawn', 400);
  }

  if (
    application.status === ApplicationStatus.HIRED ||
    application.status === ApplicationStatus.REJECTED
  ) {
    throw new AppError('Cannot withdraw a finalized application', 400);
  }

  application.status = ApplicationStatus.WITHDRAWN;
  application.statusHistory.push({
    status: ApplicationStatus.WITHDRAWN,
    changedAt: new Date(),
    changedBy: new mongoose.Types.ObjectId(applicantId),
  });
  await application.save();

  // Decrement application count
  await Job.findByIdAndUpdate(application.job, {
    $inc: { applicationCount: -1 },
  });

  return application;
}

// ─── Save Job ─────────────────────────────────────────────────────────────────

export async function saveJob(jobId: string, userId: string) {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found', 404);

  const existing = await SavedJob.findOne({ user: userId, job: jobId });
  if (existing) {
    throw new AppError('Job is already saved', 409);
  }

  await SavedJob.create({ user: userId, job: jobId });
  await Job.findByIdAndUpdate(jobId, { $inc: { saveCount: 1 } });

  return { message: 'Job saved successfully' };
}

// ─── Unsave Job ───────────────────────────────────────────────────────────────

export async function unsaveJob(jobId: string, userId: string) {
  const result = await SavedJob.findOneAndDelete({
    user: userId,
    job: jobId,
  });

  if (!result) throw new AppError('Saved job not found', 404);

  await Job.findByIdAndUpdate(jobId, { $inc: { saveCount: -1 } });

  return { message: 'Job unsaved successfully' };
}

// ─── Get Saved Jobs ───────────────────────────────────────────────────────────

export async function getSavedJobs(
  userId: string,
  page?: number,
  limit?: number,
) {
  const pagination = getPaginationOptions(page, limit);

  const [savedJobs, total] = await Promise.all([
    SavedJob.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(getSkip(pagination))
      .limit(pagination.limit)
      .populate({
        path: 'job',
        select: 'title slug companyName companyLogo location jobType salary status deadline',
      })
      .lean(),
    SavedJob.countDocuments({ user: userId }),
  ]);

  return {
    savedJobs,
    ...getPaginationResult(total, pagination),
  };
}

// ─── Check if Job is Saved ────────────────────────────────────────────────────

export async function isJobSaved(jobId: string, userId: string) {
  const saved = await SavedJob.findOne({ user: userId, job: jobId });
  return { isSaved: !!saved };
}

// ─── Get Application Stats (Employer Dashboard) ──────────────────────────────

export async function getEmployerApplicationStats(employerId: string) {
  const jobs = await Job.find({ postedBy: employerId }).select('_id');
  const jobIds = jobs.map((j) => j._id);

  const stats = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = stats.reduce((sum, s) => sum + s.count, 0);
  const statusCounts: Record<string, number> = {};
  stats.forEach((s) => {
    statusCounts[s._id] = s.count;
  });

  return { total, statusCounts };
}

// ─── Get Application Stats (Jobseeker Dashboard) ─────────────────────────────

export async function getJobseekerApplicationStats(applicantId: string) {
  const stats = await Application.aggregate([
    { $match: { applicant: new mongoose.Types.ObjectId(applicantId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = stats.reduce((sum, s) => sum + s.count, 0);
  const statusCounts: Record<string, number> = {};
  stats.forEach((s) => {
    statusCounts[s._id] = s.count;
  });

  const savedCount = await SavedJob.countDocuments({ user: applicantId });

  return { total, statusCounts, savedCount };
}
