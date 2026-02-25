import { Worker, Job } from 'bullmq';
import { bullMQConnection } from '../config/redis.js';
import { Job as JobModel } from '../models/Job.js';
import { JobStatus } from '@job-platform/shared-types';
import { logger } from '../utils/logger.js';

async function processCleanupJob(_job: Job) {
  logger.info('[CleanupJob] Starting daily cleanup...');
  const now = new Date();

  // 1. Mark expired jobs (deadline has passed)
  const expiredResult = await JobModel.updateMany(
    {
      status: JobStatus.ACTIVE,
      deadline: { $lt: now },
    },
    {
      $set: { status: JobStatus.EXPIRED },
    },
  );
  logger.info(`[CleanupJob] Marked ${expiredResult.modifiedCount} jobs as expired`);

  // 2. Remove very old scraped jobs (older than 90 days, non-active)
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  const removedResult = await JobModel.deleteMany({
    source: { $ne: 'original' },
    status: { $in: [JobStatus.EXPIRED, JobStatus.CLOSED] },
    updatedAt: { $lt: ninetyDaysAgo },
  });
  logger.info(
    `[CleanupJob] Removed ${removedResult.deletedCount} old scraped jobs`,
  );

  // 3. Clean up scraped jobs not refreshed in 30 days (they may have been removed from source)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const staleResult = await JobModel.updateMany(
    {
      source: { $ne: 'original' },
      status: JobStatus.ACTIVE,
      sourceScrapedAt: { $lt: thirtyDaysAgo },
    },
    {
      $set: { status: JobStatus.EXPIRED },
    },
  );
  logger.info(
    `[CleanupJob] Marked ${staleResult.modifiedCount} stale scraped jobs as expired`,
  );

  logger.info('[CleanupJob] Daily cleanup completed');

  return {
    expired: expiredResult.modifiedCount,
    removed: removedResult.deletedCount,
    stale: staleResult.modifiedCount,
  };
}

// ─── Worker Initialization ────────────────────────────────────────────────────

let cleanupWorker: Worker | null = null;

export function startCleanupWorker() {
  cleanupWorker = new Worker('cleanup', processCleanupJob, {
    connection: bullMQConnection,
    concurrency: 1,
  });

  cleanupWorker.on('completed', (job) => {
    logger.info(`[CleanupWorker] Job ${job.id} completed`);
  });

  cleanupWorker.on('failed', (job, err) => {
    logger.error({ err }, `[CleanupWorker] Job ${job?.id} failed`);
  });

  logger.info('Cleanup worker started');
  return cleanupWorker;
}

export function stopCleanupWorker() {
  if (cleanupWorker) {
    return cleanupWorker.close();
  }
}
