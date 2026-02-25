import { Job, IJobDocument } from '../models/Job.js';
import { User, IUserDocument } from '../models/User.js';
import { AssessmentAttempt } from '../models/AssessmentAttempt.js';
import { JobStatus } from '@job-platform/shared-types';
import {
  getPaginationOptions,
  getPaginationResult,
  getSkip,
} from '../utils/pagination.js';
import { logger } from '../utils/logger.js';

/**
 * Weighted scoring algorithm (0-100):
 * - 40%: Verified skills (passed assessments matching job skills)
 * - 20%: Self-declared skills overlap
 * - 15%: Experience level match
 * - 15%: Location preference match
 * - 10%: Salary expectation overlap
 */

interface MatchResult {
  job: any;
  matchScore: number;
  matchBreakdown: {
    verifiedSkills: number;
    declaredSkills: number;
    experience: number;
    location: number;
    salary: number;
  };
}

// ─── Calculate Match Score ────────────────────────────────────────────────────

export async function calculateMatchScore(
  user: IUserDocument,
  job: IJobDocument,
): Promise<{ score: number; breakdown: MatchResult['matchBreakdown'] }> {
  const jobSkills = (job.skillNames || []).map((s: string) => s.toLowerCase());

  // 1. Verified Skills (40%)
  let verifiedSkillScore = 0;
  if (jobSkills.length > 0) {
    const passedAttempts = await AssessmentAttempt.find({
      user: user._id,
      passed: true,
    }).populate('assessment', 'skillName');

    const verifiedSkills = new Set(
      passedAttempts.map((a) => (a.assessment as any)?.skillName?.toLowerCase()).filter(Boolean),
    );

    const matchedVerified = jobSkills.filter((s: string) =>
      verifiedSkills.has(s),
    ).length;
    verifiedSkillScore = (matchedVerified / jobSkills.length) * 100;
  }

  // 2. Self-declared Skills (20%)
  let declaredSkillScore = 0;
  if (jobSkills.length > 0 && user.skills?.length > 0) {
    const userSkills = user.skills.map((s) => s.name.toLowerCase());
    const matchedDeclared = jobSkills.filter((s: string) =>
      userSkills.includes(s),
    ).length;
    declaredSkillScore = (matchedDeclared / jobSkills.length) * 100;
  }

  // 3. Experience Level (15%)
  let experienceScore = 0;
  // Simple heuristic based on user's skill proficiency levels
  if (job.experienceLevel && user.skills?.length > 0) {
    const proficiencyMap: Record<string, number> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    };
    const levelMap: Record<string, number> = {
      entry: 1,
      mid: 2,
      senior: 3,
      executive: 4,
    };

    const avgProficiency =
      user.skills.reduce(
        (sum, s) => sum + (proficiencyMap[s.proficiency] || 1),
        0,
      ) / user.skills.length;

    const jobLevel = levelMap[job.experienceLevel] || 2;
    const diff = Math.abs(avgProficiency - jobLevel);
    experienceScore = Math.max(0, 100 - diff * 30);
  } else {
    experienceScore = 50; // Neutral if no data
  }

  // 4. Location (15%)
  let locationScore = 0;
  const userDivision = user.profile?.location?.division?.toLowerCase();
  const jobDivision = job.location?.division?.toLowerCase();
  const jobIsRemote = job.location?.isRemote;

  if (jobIsRemote) {
    locationScore = 100; // Remote jobs match everyone
  } else if (userDivision && jobDivision) {
    locationScore = userDivision === jobDivision ? 100 : 30;
  } else {
    locationScore = 50; // Neutral if no location data
  }

  // 5. Salary (10%)
  let salaryScore = 0;
  const userMin = user.expectedSalary?.min;
  const userMax = user.expectedSalary?.max;
  const jobMin = job.salary?.min;
  const jobMax = job.salary?.max;

  if (job.salary?.isNegotiable) {
    salaryScore = 80;
  } else if ((userMin || userMax) && (jobMin || jobMax)) {
    // Check if ranges overlap
    const effectiveUserMin = userMin || 0;
    const effectiveUserMax = userMax || Infinity;
    const effectiveJobMin = jobMin || 0;
    const effectiveJobMax = jobMax || Infinity;

    if (effectiveUserMin <= effectiveJobMax && effectiveJobMin <= effectiveUserMax) {
      salaryScore = 100;
    } else {
      // Partial credit based on how close the ranges are
      const gap = Math.min(
        Math.abs(effectiveUserMin - effectiveJobMax),
        Math.abs(effectiveJobMin - effectiveUserMax),
      );
      const maxGap = 50000;
      salaryScore = Math.max(0, 100 - (gap / maxGap) * 100);
    }
  } else {
    salaryScore = 50; // Neutral if no salary data
  }

  // Weighted total
  const score = Math.round(
    verifiedSkillScore * 0.4 +
      declaredSkillScore * 0.2 +
      experienceScore * 0.15 +
      locationScore * 0.15 +
      salaryScore * 0.1,
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    breakdown: {
      verifiedSkills: Math.round(verifiedSkillScore),
      declaredSkills: Math.round(declaredSkillScore),
      experience: Math.round(experienceScore),
      location: Math.round(locationScore),
      salary: Math.round(salaryScore),
    },
  };
}

// ─── Get Recommended Jobs ─────────────────────────────────────────────────────

export async function getRecommendedJobs(
  userId: string,
  page?: number,
  limit?: number,
) {
  const pagination = getPaginationOptions(page, limit);
  const user = await User.findById(userId);
  if (!user) return { jobs: [], page: 1, limit: 20, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false };

  // Build filter based on user preferences
  const filter: Record<string, any> = {
    status: JobStatus.ACTIVE,
    isApproved: true,
  };

  // Use user's skills and preferences to find relevant jobs
  const userSkills = user.skills.map((s) => s.name);
  const preferredCategories = user.preferredCategories || [];
  const preferredJobTypes = user.preferredJobTypes || [];

  const orConditions: any[] = [];
  if (userSkills.length > 0) {
    orConditions.push({ skillNames: { $in: userSkills } });
  }
  if (preferredCategories.length > 0) {
    orConditions.push({ category: { $in: preferredCategories } });
  }
  if (preferredJobTypes.length > 0) {
    orConditions.push({ jobType: { $in: preferredJobTypes } });
  }
  if (user.profile?.location?.division) {
    orConditions.push({
      $or: [
        { 'location.division': user.profile.location.division },
        { 'location.isRemote': true },
      ],
    });
  }

  if (orConditions.length > 0) {
    filter.$or = orConditions;
  }

  // Fetch candidate jobs
  const candidateJobs = await Job.find(filter)
    .sort({ publishedAt: -1 })
    .limit(100) // Get a larger pool to score and rank
    .populate('company', 'name slug logo')
    .lean();

  // Score each job
  const scoredJobs: MatchResult[] = [];
  for (const job of candidateJobs) {
    try {
      const { score, breakdown } = await calculateMatchScore(
        user,
        job as unknown as IJobDocument,
      );
      scoredJobs.push({ job, matchScore: score, matchBreakdown: breakdown });
    } catch (error) {
      logger.warn({ err: error }, `Failed to score job ${job._id}`);
    }
  }

  // Sort by match score descending
  scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

  // Paginate
  const start = getSkip(pagination);
  const paginated = scoredJobs.slice(start, start + pagination.limit);
  const total = scoredJobs.length;

  return {
    jobs: paginated.map((r) => ({
      ...r.job,
      matchScore: r.matchScore,
      matchBreakdown: r.matchBreakdown,
    })),
    ...getPaginationResult(total, pagination),
  };
}

// ─── Get Match Score for a Single Job ─────────────────────────────────────────

export async function getJobMatchScore(jobId: string, userId: string) {
  const [user, job] = await Promise.all([
    User.findById(userId),
    Job.findById(jobId),
  ]);

  if (!user || !job) return null;

  return calculateMatchScore(user, job);
}
