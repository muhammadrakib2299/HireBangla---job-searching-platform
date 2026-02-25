import { Job } from '../models/Job.js';
import type { NormalizedJob } from './normalizer.js';
import { logger } from '../utils/logger.js';

export interface DeduplicationResult {
  newJobs: NormalizedJob[];
  updatedJobs: NormalizedJob[];
  duplicates: number;
}

/**
 * Deduplicate scraped jobs against existing DB entries.
 * Uses sourceJobId for exact matching and fuzzy title+company matching as fallback.
 */
export async function deduplicateJobs(
  jobs: NormalizedJob[],
): Promise<DeduplicationResult> {
  const newJobs: NormalizedJob[] = [];
  const updatedJobs: NormalizedJob[] = [];
  let duplicates = 0;

  for (const job of jobs) {
    try {
      // 1. Exact match by source + sourceJobId
      if (job.sourceJobId) {
        const existing = await Job.findOne({
          source: job.source,
          sourceJobId: job.sourceJobId,
        });

        if (existing) {
          // Update if the job data has changed (re-scraped)
          const daysSinceUpdate =
            (Date.now() - existing.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceUpdate > 1) {
            updatedJobs.push(job);
          } else {
            duplicates++;
          }
          continue;
        }
      }

      // 2. Fuzzy match: same title + company + source within last 30 days
      const normalizedTitle = normalizeForComparison(job.title);
      const normalizedCompany = normalizeForComparison(job.companyName);

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const fuzzyMatch = await Job.findOne({
        source: job.source,
        createdAt: { $gte: thirtyDaysAgo },
        $expr: {
          $and: [
            { $eq: [{ $toLower: '$title' }, normalizedTitle.toLowerCase()] },
            { $eq: [{ $toLower: '$companyName' }, normalizedCompany.toLowerCase()] },
          ],
        },
      });

      if (fuzzyMatch) {
        duplicates++;
        continue;
      }

      // 3. Cross-source dedup: similar title + company from ANY source
      const crossMatch = await Job.findOne({
        createdAt: { $gte: thirtyDaysAgo },
        $expr: {
          $and: [
            { $eq: [{ $toLower: '$title' }, normalizedTitle.toLowerCase()] },
            { $eq: [{ $toLower: '$companyName' }, normalizedCompany.toLowerCase()] },
          ],
        },
      });

      if (crossMatch) {
        duplicates++;
        continue;
      }

      newJobs.push(job);
    } catch (error) {
      logger.error({ err: error }, `Dedup error for: ${job.title}`);
      // On error, treat as new job to avoid losing data
      newJobs.push(job);
    }
  }

  return { newJobs, updatedJobs, duplicates };
}

/**
 * Normalize text for comparison - lowercase, remove extra spaces,
 * remove common suffixes/prefixes.
 */
function normalizeForComparison(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Save new jobs and update existing ones.
 */
export async function saveDeduplicatedJobs(
  result: DeduplicationResult,
): Promise<{ inserted: number; updated: number }> {
  let inserted = 0;
  let updated = 0;

  // Insert new jobs
  if (result.newJobs.length > 0) {
    try {
      const docs = await Job.insertMany(
        result.newJobs.map((j) => ({
          ...j,
          viewCount: 0,
          applicationCount: 0,
          saveCount: 0,
          isFeatured: false,
          vacancies: 1,
        })),
        { ordered: false },
      );
      inserted = docs.length;
    } catch (error: any) {
      // Handle partial success with ordered: false (some may be duplicate key)
      if (error.insertedDocs) {
        inserted = error.insertedDocs.length;
      }
      logger.warn({ err: error }, `Partial insert: ${inserted} of ${result.newJobs.length}`);
    }
  }

  // Update existing jobs
  for (const job of result.updatedJobs) {
    try {
      await Job.findOneAndUpdate(
        { source: job.source, sourceJobId: job.sourceJobId },
        {
          $set: {
            title: job.title,
            description: job.description,
            sourceScrapedAt: new Date(),
            companyName: job.companyName,
            salary: job.salary,
            skillNames: job.skillNames,
            deadline: job.deadline,
          },
        },
      );
      updated++;
    } catch (error) {
      logger.error({ err: error }, `Failed to update job: ${job.sourceJobId}`);
    }
  }

  return { inserted, updated };
}
