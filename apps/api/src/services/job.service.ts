import { FilterQuery, SortOrder } from 'mongoose';
import { Job, IJobDocument } from '../models/Job.js';
import { Company } from '../models/Company.js';
import { generateSlug } from '../utils/slug.js';
import {
  getPaginationOptions,
  getPaginationResult,
  getSkip,
} from '../utils/pagination.js';
import { AppError } from '../middleware/errorHandler.js';
import { JobStatus } from '@job-platform/shared-types';
import type { CreateJobInput, JobSearchInput } from '@job-platform/shared-validators';

// ─── Create Job ──────────────────────────────────────────────────────────────

export async function createJob(
  input: CreateJobInput,
  userId: string,
  companyId?: string,
) {
  const slug = generateSlug(input.title);

  // Get company info if employer has one
  let companyName = 'Unknown Company';
  let companyLogo: string | undefined;

  if (companyId) {
    const company = await Company.findById(companyId);
    if (company) {
      companyName = company.name;
      companyLogo = company.logo;
    }
  }

  const job = await Job.create({
    ...input,
    slug,
    companyName,
    companyLogo,
    company: companyId,
    postedBy: userId,
    status: JobStatus.ACTIVE,
    publishedAt: new Date(),
    deadline: input.deadline ? new Date(input.deadline) : undefined,
    salary: input.salary || {
      currency: 'BDT',
      isNegotiable: false,
      period: 'monthly',
    },
    location: input.location || { isRemote: false, country: 'Bangladesh' },
  });

  // Increment company job counters
  if (companyId) {
    await Company.findByIdAndUpdate(companyId, {
      $inc: { totalJobs: 1, activeJobs: 1 },
    });
  }

  return job;
}

// ─── Update Job ──────────────────────────────────────────────────────────────

export async function updateJob(
  jobId: string,
  updates: Partial<CreateJobInput>,
  userId: string,
) {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found', 404);
  if (job.postedBy?.toString() !== userId) {
    throw new AppError('You can only update your own jobs', 403);
  }

  // Handle deadline string -> Date conversion
  const processedUpdates: Record<string, unknown> = { ...updates };
  if (updates.deadline) {
    processedUpdates.deadline = new Date(updates.deadline);
  }

  const updated = await Job.findByIdAndUpdate(
    jobId,
    { $set: processedUpdates },
    { new: true, runValidators: true },
  );

  return updated;
}

// ─── Delete Job ──────────────────────────────────────────────────────────────

export async function deleteJob(jobId: string, userId: string) {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found', 404);
  if (job.postedBy?.toString() !== userId) {
    throw new AppError('You can only delete your own jobs', 403);
  }

  await job.deleteOne();

  // Decrement company counters
  if (job.company) {
    const decrements: Record<string, number> = { totalJobs: -1 };
    if (job.status === JobStatus.ACTIVE) {
      decrements.activeJobs = -1;
    }
    await Company.findByIdAndUpdate(job.company, { $inc: decrements });
  }

  return { message: 'Job deleted successfully' };
}

// ─── Get Job by Slug ─────────────────────────────────────────────────────────

export async function getJobBySlug(slug: string) {
  const job = await Job.findOne({ slug })
    .populate('company', 'name slug logo location industry companySize website')
    .populate('postedBy', 'profile.firstName profile.lastName');

  if (!job) throw new AppError('Job not found', 404);
  return job;
}

// ─── Increment View Count ────────────────────────────────────────────────────

export async function incrementViewCount(jobId: string) {
  await Job.findByIdAndUpdate(jobId, { $inc: { viewCount: 1 } });
}

// ─── Search Jobs ─────────────────────────────────────────────────────────────

export async function searchJobs(params: JobSearchInput) {
  const pagination = getPaginationOptions(params.page, params.limit);
  const filter: FilterQuery<IJobDocument> = {
    status: JobStatus.ACTIVE,
    isApproved: true,
  };

  // Text search
  if (params.q) {
    filter.$text = { $search: params.q };
  }

  // Category filter
  if (params.category) {
    filter.category = params.category;
  }

  // Location filters
  if (params.division) {
    filter['location.division'] = params.division;
  }
  if (params.district) {
    filter['location.district'] = params.district;
  }
  if (params.isRemote) {
    filter['location.isRemote'] = true;
  }

  // Job type filter
  if (params.jobType) {
    filter.jobType = params.jobType;
  }

  // Experience level filter
  if (params.experienceLevel) {
    filter.experienceLevel = params.experienceLevel;
  }

  // Salary range filter
  if (params.salaryMin || params.salaryMax) {
    filter['salary.min'] = filter['salary.min'] || {};
    if (params.salaryMin) {
      filter['salary.max'] = { $gte: params.salaryMin };
    }
    if (params.salaryMax) {
      filter['salary.min'] = { $lte: params.salaryMax };
    }
  }

  // Source filter
  if (params.source) {
    filter.source = params.source;
  }

  // Posted after filter
  if (params.postedAfter) {
    filter.publishedAt = { $gte: new Date(params.postedAfter) };
  }

  // Sorting
  let sort: Record<string, SortOrder> = {};
  switch (params.sort) {
    case 'relevance':
      if (params.q) {
        sort = { score: { $meta: 'textScore' } as unknown as SortOrder };
      } else {
        sort = { publishedAt: -1 };
      }
      break;
    case 'salary':
      sort = { 'salary.max': -1, publishedAt: -1 };
      break;
    case 'date':
    default:
      sort = { publishedAt: -1 };
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .sort(sort)
      .skip(getSkip(pagination))
      .limit(pagination.limit)
      .populate('company', 'name slug logo')
      .lean(),
    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    ...getPaginationResult(total, pagination),
  };
}

// ─── Featured Jobs ───────────────────────────────────────────────────────────

export async function getFeaturedJobs(limit = 6) {
  return Job.find({
    status: JobStatus.ACTIVE,
    isApproved: true,
    isFeatured: true,
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate('company', 'name slug logo')
    .lean();
}

// ─── Recent Jobs ─────────────────────────────────────────────────────────────

export async function getRecentJobs(limit = 10) {
  return Job.find({
    status: JobStatus.ACTIVE,
    isApproved: true,
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate('company', 'name slug logo')
    .lean();
}

// ─── Categories with Counts ─────────────────────────────────────────────────

export async function getCategoriesWithCounts() {
  return Job.aggregate([
    { $match: { status: JobStatus.ACTIVE, isApproved: true } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { category: '$_id', count: 1, _id: 0 } },
  ]);
}

// ─── Similar Jobs ────────────────────────────────────────────────────────────

export async function getSimilarJobs(jobId: string, limit = 5) {
  const job = await Job.findById(jobId);
  if (!job) return [];

  return Job.find({
    _id: { $ne: jobId },
    status: JobStatus.ACTIVE,
    isApproved: true,
    $or: [
      { category: job.category },
      { skillNames: { $in: job.skillNames } },
      { 'location.division': job.location.division },
    ],
  })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .populate('company', 'name slug logo')
    .lean();
}

// ─── Get Jobs by Employer ────────────────────────────────────────────────────

export async function getEmployerJobs(userId: string, page?: number, limit?: number) {
  const pagination = getPaginationOptions(page, limit);

  const [jobs, total] = await Promise.all([
    Job.find({ postedBy: userId })
      .sort({ createdAt: -1 })
      .skip(getSkip(pagination))
      .limit(pagination.limit)
      .lean(),
    Job.countDocuments({ postedBy: userId }),
  ]);

  return {
    jobs,
    ...getPaginationResult(total, pagination),
  };
}
