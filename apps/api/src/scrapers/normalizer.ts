import { JobSource, JobType, ExperienceLevel, ApplicationMethod, SalaryPeriod } from '@job-platform/shared-types';
import { generateSlug } from '../utils/slug.js';
import type { RawJob } from './base.scraper.js';

export interface NormalizedJob {
  title: string;
  slug: string;
  description: string;
  source: JobSource;
  sourceUrl: string;
  sourceJobId?: string;
  sourceScrapedAt: Date;

  companyName: string;
  companyLogo?: string;
  category: string;
  jobType: JobType;
  experienceLevel?: ExperienceLevel;

  location: {
    district?: string;
    division?: string;
    isRemote: boolean;
    country: string;
  };

  salary?: {
    min?: number;
    max?: number;
    currency: string;
    isNegotiable: boolean;
    period: SalaryPeriod;
  };

  skillNames: string[];
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  education?: { degree?: string; field?: string };

  applicationMethod: ApplicationMethod;
  applicationUrl?: string;
  deadline?: Date;
  publishedAt?: Date;

  status: 'active';
  isApproved: boolean;
}

// ─── Job Type Detection ───────────────────────────────────────────────────────

const jobTypePatterns: Record<JobType, RegExp> = {
  [JobType.FULL_TIME]: /full[\s-]?time/i,
  [JobType.PART_TIME]: /part[\s-]?time/i,
  [JobType.CONTRACT]: /contract|contractual/i,
  [JobType.INTERNSHIP]: /intern(ship)?/i,
  [JobType.FREELANCE]: /freelanc/i,
  [JobType.REMOTE]: /remote\s*only/i,
};

function detectJobType(rawType?: string, description?: string): JobType {
  const text = `${rawType || ''} ${description || ''}`;
  for (const [type, pattern] of Object.entries(jobTypePatterns)) {
    if (pattern.test(text)) return type as JobType;
  }
  return JobType.FULL_TIME;
}

// ─── Experience Level Detection ───────────────────────────────────────────────

function detectExperienceLevel(
  rawLevel?: string,
  description?: string,
): ExperienceLevel | undefined {
  const text = `${rawLevel || ''} ${description || ''}`.toLowerCase();
  if (/entry[\s-]?level|fresh|junior|0[\s-]?[12]\s*year/i.test(text))
    return ExperienceLevel.ENTRY;
  if (/mid[\s-]?level|[23]-[56]\s*year/i.test(text))
    return ExperienceLevel.MID;
  if (/senior|lead|[5-9]\+?\s*year|10\+?\s*year/i.test(text))
    return ExperienceLevel.SENIOR;
  if (/executive|director|cxo|head\s+of/i.test(text))
    return ExperienceLevel.EXECUTIVE;
  return undefined;
}

// ─── Category Detection ───────────────────────────────────────────────────────

const categoryPatterns: Record<string, RegExp> = {
  'IT/Software': /software|developer|engineer|programming|web\s*dev|frontend|backend|fullstack|devops|IT\b/i,
  'Marketing': /marketing|digital\s*marketing|seo|sem|brand|advertising/i,
  'Finance/Accounting': /finance|account|banking|audit|tax|treasury/i,
  'Sales': /sales|business\s*development|bd\b/i,
  'Design': /design|ui\/ux|graphic|creative|art\s*director/i,
  'HR/Admin': /human\s*resource|hr\b|admin|recruitment|talent/i,
  'Education': /teach|education|tutor|trainer|instructor|professor/i,
  'Healthcare': /medical|health|doctor|nurse|pharma|hospital/i,
  'Engineering': /civil|mechanical|electrical|engineer(?!.*software)/i,
  'NGO/Development': /ngo|development\s*sector|humanitarian|non[\s-]?profit|un\b/i,
  'Data Science': /data\s*(scien|analy|engineer)|machine\s*learning|ai\b|ml\b/i,
  'Customer Service': /customer\s*(service|support)|call\s*center|helpdesk/i,
  'Content/Writing': /content|writer|editor|copywrite|journal/i,
  'Supply Chain': /supply\s*chain|logistics|procurement|warehouse/i,
  'Legal': /legal|lawyer|advocate|law\b/i,
  'Telecom': /telecom|network|communication/i,
  'Garments/Textile': /garment|textile|apparel|fashion/i,
  'Other': /.*/,
};

function detectCategory(
  rawCategory?: string,
  title?: string,
  description?: string,
): string {
  if (rawCategory) {
    for (const [cat, pattern] of Object.entries(categoryPatterns)) {
      if (pattern.test(rawCategory)) return cat;
    }
  }

  const text = `${title || ''} ${description?.slice(0, 500) || ''}`;
  for (const [cat, pattern] of Object.entries(categoryPatterns)) {
    if (cat !== 'Other' && pattern.test(text)) return cat;
  }
  return 'Other';
}

// ─── Location Detection ───────────────────────────────────────────────────────

const BD_DIVISIONS = [
  'Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barisal',
  'Sylhet', 'Rangpur', 'Mymensingh',
];

function detectLocation(rawLocation?: string): {
  district?: string;
  division?: string;
  isRemote: boolean;
  country: string;
} {
  const text = (rawLocation || '').toLowerCase();
  const isRemote = /remote|work\s*from\s*home|wfh/i.test(text);

  for (const div of BD_DIVISIONS) {
    if (text.includes(div.toLowerCase())) {
      return { division: div, isRemote, country: 'Bangladesh' };
    }
  }

  if (/bangladesh|dhaka|chittagong|chattogram/i.test(text)) {
    return {
      division: text.includes('dhaka') ? 'Dhaka' : text.includes('chit') || text.includes('chatt') ? 'Chattogram' : undefined,
      isRemote,
      country: 'Bangladesh',
    };
  }

  return { isRemote, country: 'Bangladesh' };
}

// ─── Main Normalizer ──────────────────────────────────────────────────────────

export function normalizeJob(
  raw: RawJob,
  source: JobSource,
): NormalizedJob {
  const title = raw.title.trim();
  const slug = generateSlug(title);
  const location = detectLocation(raw.location);

  const normalized: NormalizedJob = {
    title,
    slug,
    description: raw.description || '',
    source,
    sourceUrl: raw.url,
    sourceJobId: raw.sourceJobId,
    sourceScrapedAt: new Date(),

    companyName: raw.company?.trim() || 'Unknown Company',
    companyLogo: raw.companyLogo,
    category: detectCategory(raw.category, title, raw.description),
    jobType: detectJobType(raw.jobType, raw.description),
    experienceLevel: detectExperienceLevel(
      raw.experienceLevel,
      raw.description,
    ),

    location,

    skillNames: raw.skills || [],
    requirements: raw.requirements || [],
    responsibilities: raw.responsibilities || [],
    benefits: raw.benefits || [],

    applicationMethod: ApplicationMethod.EXTERNAL,
    applicationUrl: raw.url,
    deadline: raw.deadline ? new Date(raw.deadline) : undefined,
    publishedAt: raw.postedDate ? new Date(raw.postedDate) : new Date(),

    status: 'active',
    isApproved: true,
  };

  // Parse salary
  if (raw.salary) {
    const salaryStr = raw.salary.replace(/,/g, '');
    const rangeMatch = salaryStr.match(/(\d+)\s*[-–to]+\s*(\d+)/i);
    if (rangeMatch) {
      normalized.salary = {
        min: parseInt(rangeMatch[1]),
        max: parseInt(rangeMatch[2]),
        currency: salaryStr.match(/[A-Z]{3}/)?.[0] || 'BDT',
        isNegotiable: /negotiable/i.test(salaryStr),
        period: SalaryPeriod.MONTHLY,
      };
    } else if (/negotiable/i.test(salaryStr)) {
      normalized.salary = {
        currency: 'BDT',
        isNegotiable: true,
        period: SalaryPeriod.MONTHLY,
      };
    }
  }

  // Parse education
  if (raw.education) {
    const degreeMatch = raw.education.match(
      /(bachelor|master|phd|diploma|hsc|ssc|mba|bba|bsc|msc)/i,
    );
    normalized.education = {
      degree: degreeMatch ? degreeMatch[1] : undefined,
      field: raw.education,
    };
  }

  return normalized;
}
