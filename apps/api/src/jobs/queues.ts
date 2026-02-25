import { Queue } from 'bullmq';
import { bullMQConnection } from '../config/redis.js';
import { logger } from '../utils/logger.js';

// ─── Queue Definitions ────────────────────────────────────────────────────────

export const scraperQueue = new Queue('scraper', {
  connection: bullMQConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 60000, // 1 minute initial delay, exponential backoff
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 200 },
  },
});

export const cleanupQueue = new Queue('cleanup', {
  connection: bullMQConnection,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: { count: 50 },
    removeOnFail: { count: 50 },
  },
});

export const emailQueue = new Queue('email', {
  connection: bullMQConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 30000,
    },
    removeOnComplete: { count: 500 },
    removeOnFail: { count: 200 },
  },
});

// ─── Scraper Source Schedules ─────────────────────────────────────────────────

const scraperSchedules: Record<string, string> = {
  careerjet: '0 */4 * * *',   // Every 4 hours
  bdjobs: '0 */6 * * *',      // Every 6 hours
  unjobs: '0 */12 * * *',     // Every 12 hours
  impactpool: '0 */12 * * *', // Every 12 hours
  shomvob: '0 */8 * * *',     // Every 8 hours
  nextjobz: '0 */12 * * *',   // Every 12 hours
  skilljobs: '0 */12 * * *',  // Every 12 hours
};

// ─── Initialize Scheduled Jobs ────────────────────────────────────────────────

export async function initializeScheduledJobs() {
  try {
    // Schedule scraper jobs
    for (const [source, cron] of Object.entries(scraperSchedules)) {
      const jobId = `scraper-${source}`;

      // Remove existing repeatable job to avoid duplicates
      const repeatableJobs = await scraperQueue.getRepeatableJobs();
      const existing = repeatableJobs.find((j) => j.id === jobId);
      if (existing) {
        await scraperQueue.removeRepeatableByKey(existing.key);
      }

      await scraperQueue.add(
        'scrape',
        { source },
        {
          repeat: { pattern: cron },
          jobId,
        },
      );

      logger.info(`Scheduled scraper: ${source} (${cron})`);
    }

    // Schedule cleanup job - runs daily at 2 AM
    const cleanupRepeatableJobs = await cleanupQueue.getRepeatableJobs();
    const existingCleanup = cleanupRepeatableJobs.find(
      (j) => j.id === 'daily-cleanup',
    );
    if (existingCleanup) {
      await cleanupQueue.removeRepeatableByKey(existingCleanup.key);
    }

    await cleanupQueue.add(
      'cleanup',
      {},
      {
        repeat: { pattern: '0 2 * * *' },
        jobId: 'daily-cleanup',
      },
    );

    logger.info('Scheduled daily cleanup job (2:00 AM)');
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize scheduled jobs');
  }
}

// ─── Manual Trigger ───────────────────────────────────────────────────────────

export async function triggerScraper(source: string) {
  return scraperQueue.add('scrape', { source }, { jobId: `manual-${source}-${Date.now()}` });
}

export async function triggerAllScrapers() {
  const jobs = [];
  for (const source of Object.keys(scraperSchedules)) {
    jobs.push(
      scraperQueue.add('scrape', { source }, {
        jobId: `manual-${source}-${Date.now()}`,
      }),
    );
  }
  return Promise.all(jobs);
}

export const SCRAPER_SOURCES = Object.keys(scraperSchedules);
