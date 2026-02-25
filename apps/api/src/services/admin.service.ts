import { User } from '../models/User.js';
import { Job } from '../models/Job.js';
import { Company } from '../models/Company.js';
import { Application } from '../models/Application.js';
import { Assessment } from '../models/Assessment.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { ScraperLog } from '../models/ScraperLog.js';
import { AppError } from '../middleware/errorHandler.js';
import { UserRole, JobStatus, JobSource } from '@job-platform/shared-types';
import {
  getPaginationOptions,
  getPaginationResult,
  getSkip,
} from '../utils/pagination.js';

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalJobs,
    totalCompanies,
    totalApplications,
    activeJobs,
    pendingApprovalJobs,
    newUsersThisMonth,
    newUsersThisWeek,
    newJobsThisMonth,
    newApplicationsThisMonth,
    usersByRole,
    jobsBySource,
    recentSignups,
    applicationsByStatus,
  ] = await Promise.all([
    User.countDocuments(),
    Job.countDocuments(),
    Company.countDocuments(),
    Application.countDocuments(),
    Job.countDocuments({ status: JobStatus.ACTIVE }),
    Job.countDocuments({ isApproved: false, status: JobStatus.ACTIVE }),
    User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    Job.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Application.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
    Job.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
    ]),
    User.find()
      .sort({ createdAt: -1 })
      .limit(7)
      .select('profile.firstName profile.lastName email role createdAt')
      .lean(),
    Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  // Build daily signups for chart (last 30 days)
  const dailySignups = await User.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Daily job postings for chart (last 30 days)
  const dailyJobs = await Job.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return {
    totals: {
      users: totalUsers,
      jobs: totalJobs,
      companies: totalCompanies,
      applications: totalApplications,
      activeJobs,
      pendingApprovalJobs,
    },
    trends: {
      newUsersThisMonth,
      newUsersThisWeek,
      newJobsThisMonth,
      newApplicationsThisMonth,
    },
    breakdowns: {
      usersByRole: usersByRole.map((r) => ({ role: r._id, count: r.count })),
      jobsBySource: jobsBySource.map((s) => ({ source: s._id, count: s.count })),
      applicationsByStatus: applicationsByStatus.map((a) => ({
        status: a._id,
        count: a.count,
      })),
    },
    charts: {
      dailySignups: dailySignups.map((d) => ({ date: d._id, count: d.count })),
      dailyJobs: dailyJobs.map((d) => ({ date: d._id, count: d.count })),
    },
    recentSignups,
  };
}

// ─── User Management ─────────────────────────────────────────────────────────

export async function listUsers(
  page?: number,
  limit?: number,
  filters?: {
    role?: string;
    search?: string;
    isActive?: string;
  },
) {
  const pagination = getPaginationOptions(page, limit);
  const filter: Record<string, any> = {};

  if (filters?.role) filter.role = filters.role;
  if (filters?.isActive === 'true') filter.isActive = true;
  if (filters?.isActive === 'false') filter.isActive = false;
  if (filters?.search) {
    filter.$or = [
      { email: { $regex: filters.search, $options: 'i' } },
      { 'profile.firstName': { $regex: filters.search, $options: 'i' } },
      { 'profile.lastName': { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('email role isActive isEmailVerified profile.firstName profile.lastName profile.avatar lastLoginAt createdAt')
      .sort({ createdAt: -1 })
      .skip(getSkip(pagination))
      .limit(pagination.limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    users,
    ...getPaginationResult(total, pagination),
  };
}

export async function getUserDetail(userId: string) {
  const user = await User.findById(userId)
    .select('-password -refreshTokens -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires')
    .populate('company', 'name slug isVerified')
    .lean();

  if (!user) throw new AppError('User not found', 404);
  return user;
}

export async function toggleUserActive(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  if (user.role === UserRole.ADMIN) {
    throw new AppError('Cannot deactivate admin accounts', 403);
  }

  user.isActive = !user.isActive;
  await user.save();

  return { isActive: user.isActive };
}

export async function changeUserRole(userId: string, newRole: UserRole) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  if (newRole === UserRole.ADMIN) {
    throw new AppError('Cannot promote users to admin via this endpoint', 403);
  }

  user.role = newRole;
  await user.save();

  return { role: user.role };
}

// ─── Job Management / Moderation ─────────────────────────────────────────────

export async function listJobsAdmin(
  page?: number,
  limit?: number,
  filters?: {
    status?: string;
    source?: string;
    isApproved?: string;
    search?: string;
  },
) {
  const pagination = getPaginationOptions(page, limit);
  const filter: Record<string, any> = {};

  if (filters?.status) filter.status = filters.status;
  if (filters?.source) filter.source = filters.source;
  if (filters?.isApproved === 'true') filter.isApproved = true;
  if (filters?.isApproved === 'false') filter.isApproved = false;
  if (filters?.search) {
    filter.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { companyName: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter)
      .select('title slug companyName source status isApproved isFeatured publishedAt applicationCount viewCount createdAt')
      .sort({ createdAt: -1 })
      .skip(getSkip(pagination))
      .limit(pagination.limit)
      .lean(),
    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    ...getPaginationResult(total, pagination),
  };
}

export async function approveJob(jobId: string) {
  const job = await Job.findByIdAndUpdate(
    jobId,
    { isApproved: true },
    { new: true },
  );
  if (!job) throw new AppError('Job not found', 404);
  return job;
}

export async function rejectJob(jobId: string) {
  const job = await Job.findByIdAndUpdate(
    jobId,
    { isApproved: false, status: JobStatus.CLOSED },
    { new: true },
  );
  if (!job) throw new AppError('Job not found', 404);
  return job;
}

export async function bulkApproveJobs(jobIds: string[]) {
  const result = await Job.updateMany(
    { _id: { $in: jobIds } },
    { isApproved: true },
  );
  return { modifiedCount: result.modifiedCount };
}

export async function bulkRejectJobs(jobIds: string[]) {
  const result = await Job.updateMany(
    { _id: { $in: jobIds } },
    { isApproved: false, status: JobStatus.CLOSED },
  );
  return { modifiedCount: result.modifiedCount };
}

export async function toggleJobFeatured(jobId: string) {
  const job = await Job.findById(jobId);
  if (!job) throw new AppError('Job not found', 404);

  job.isFeatured = !job.isFeatured;
  await job.save();

  return { isFeatured: job.isFeatured };
}

export async function deleteJobAdmin(jobId: string) {
  const job = await Job.findByIdAndDelete(jobId);
  if (!job) throw new AppError('Job not found', 404);
  // Clean up related applications
  await Application.deleteMany({ job: jobId });
  return { deleted: true };
}

// ─── Company Management ──────────────────────────────────────────────────────

export async function listCompaniesAdmin(
  page?: number,
  limit?: number,
  filters?: {
    isVerified?: string;
    search?: string;
  },
) {
  const pagination = getPaginationOptions(page, limit);
  const filter: Record<string, any> = {};

  if (filters?.isVerified === 'true') filter.isVerified = true;
  if (filters?.isVerified === 'false') filter.isVerified = false;
  if (filters?.search) {
    filter.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { industry: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .select('name slug industry isVerified verifiedAt totalJobs activeJobs logo createdAt')
      .sort({ createdAt: -1 })
      .skip(getSkip(pagination))
      .limit(pagination.limit)
      .lean(),
    Company.countDocuments(filter),
  ]);

  return {
    companies,
    ...getPaginationResult(total, pagination),
  };
}

export async function verifyCompany(companyId: string) {
  const company = await Company.findByIdAndUpdate(
    companyId,
    { isVerified: true, verifiedAt: new Date() },
    { new: true },
  );
  if (!company) throw new AppError('Company not found', 404);
  return company;
}

export async function unverifyCompany(companyId: string) {
  const company = await Company.findByIdAndUpdate(
    companyId,
    { isVerified: false, $unset: { verifiedAt: '' } },
    { new: true },
  );
  if (!company) throw new AppError('Company not found', 404);
  return company;
}

// ─── Platform Settings ───────────────────────────────────────────────────────
// Using a simple in-memory + env approach for settings since this is a demo.
// In production, this would be stored in a Settings collection.

let platformSettings = {
  siteName: 'HireBangla',
  siteDescription: 'Bangladesh\'s premier job searching platform',
  maintenanceMode: false,
  requireJobApproval: false,
  maxJobsPerEmployer: 50,
  maxApplicationsPerDay: 20,
  defaultCurrency: 'BDT',
  enableScrapers: true,
  enableAssessments: true,
};

export function getPlatformSettings() {
  return { ...platformSettings };
}

export function updatePlatformSettings(updates: Partial<typeof platformSettings>) {
  platformSettings = { ...platformSettings, ...updates };
  return { ...platformSettings };
}
