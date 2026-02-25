import { Company, ICompanyDocument } from '../models/Company.js';
import { User } from '../models/User.js';
import { generateSlug, generateBaseSlug } from '../utils/slug.js';
import {
  getPaginationOptions,
  getPaginationResult,
  getSkip,
} from '../utils/pagination.js';
import { AppError } from '../middleware/errorHandler.js';

// ─── Create Company ──────────────────────────────────────────────────────────

export async function createCompany(
  input: {
    name: string;
    industry: string;
    description?: string;
    companySize?: string;
    founded?: number;
    website?: string;
    location?: { address?: string; district?: string; division?: string };
    contactEmail?: string;
    contactPhone?: string;
  },
  userId: string,
) {
  // Check if user already has a company
  const existingUser = await User.findById(userId);
  if (existingUser?.company) {
    throw new AppError('You already have a company profile', 400);
  }

  const slug = generateSlug(input.name);

  const company = await Company.create({
    ...input,
    slug,
    location: {
      ...input.location,
      country: 'Bangladesh',
    },
    owners: [userId],
  });

  // Link company to user
  await User.findByIdAndUpdate(userId, { company: company._id });

  return company;
}

// ─── Update Company ──────────────────────────────────────────────────────────

export async function updateCompany(
  companyId: string,
  updates: Partial<ICompanyDocument>,
  userId: string,
) {
  const company = await Company.findById(companyId);
  if (!company) throw new AppError('Company not found', 404);

  if (!company.owners.some((owner) => owner.toString() === userId)) {
    throw new AppError('You can only update your own company', 403);
  }

  const updated = await Company.findByIdAndUpdate(
    companyId,
    { $set: updates },
    { new: true, runValidators: true },
  );

  return updated;
}

// ─── Get Company by Slug ─────────────────────────────────────────────────────

export async function getCompanyBySlug(slug: string) {
  const company = await Company.findOne({ slug });
  if (!company) throw new AppError('Company not found', 404);
  return company;
}

// ─── List Companies ──────────────────────────────────────────────────────────

export async function listCompanies(page?: number, limit?: number, industry?: string) {
  const pagination = getPaginationOptions(page, limit);

  const filter: Record<string, unknown> = {};
  if (industry) filter.industry = industry;

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .sort({ activeJobs: -1, name: 1 })
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

// ─── Get Company's Jobs ──────────────────────────────────────────────────────

export async function getMyCompany(userId: string) {
  const user = await User.findById(userId).populate('company');
  if (!user?.company) throw new AppError('No company profile found', 404);
  return user.company;
}
