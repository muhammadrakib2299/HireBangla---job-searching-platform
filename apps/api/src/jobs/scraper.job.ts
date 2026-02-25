import { Worker, Job } from 'bullmq';
import { bullMQConnection } from '../config/redis.js';
import { getScraper } from '../scrapers/index.js';
import { normalizeJob } from '../scrapers/normalizer.js';
import { deduplicateJobs, saveDeduplicatedJobs } from '../scrapers/deduplicator.js';
import { ScraperLog } from '../models/ScraperLog.js';
import { logger } from '../utils/logger.js';

interface ScraperJobData {
  source: string;
}

async function processScraperJob(job: Job<ScraperJobData>) {
  const { source } = job.data;

  // Create scraper log entry
  const log = await ScraperLog.create({
    source,
    status: 'running',
    startedAt: new Date(),
    triggeredBy: job.id?.startsWith('manual') ? 'manual' : 'cron',
    stats: { fetched: 0, new: 0, updated: 0, duplicates: 0, errors: 0 },
  });

  const startTime = Date.now();

  try {
    // 1. Get the appropriate scraper
    const scraper = getScraper(source);
    if (!scraper) {
      throw new Error(`Unknown scraper source: ${source}`);
    }

    // 2. Run the scraper
    logger.info(`[ScraperJob] Running ${source} scraper...`);
    const result = await scraper.run();

    // 3. Normalize jobs
    const normalizedJobs = result.jobs
      .filter((raw) => raw.title && raw.url)
      .map((raw) => normalizeJob(raw, scraper.source));

    logger.info(
      `[ScraperJob] ${source}: ${result.jobs.length} fetched, ${normalizedJobs.length} normalized`,
    );

    // 4. Deduplicate
    const dedupResult = await deduplicateJobs(normalizedJobs);
    logger.info(
      `[ScraperJob] ${source}: ${dedupResult.newJobs.length} new, ${dedupResult.updatedJobs.length} updated, ${dedupResult.duplicates} duplicates`,
    );

    // 5. Save to database
    const saveResult = await saveDeduplicatedJobs(dedupResult);

    // 6. Update log
    const duration = Date.now() - startTime;
    await ScraperLog.findByIdAndUpdate(log._id, {
      status: 'completed',
      completedAt: new Date(),
      duration,
      stats: {
        fetched: result.jobs.length,
        new: saveResult.inserted,
        updated: saveResult.updated,
        duplicates: dedupResult.duplicates,
        errors: result.errors.length,
      },
      errorMessages: result.errors.slice(0, 20), // Cap at 20 error messages
    });

    logger.info(
      `[ScraperJob] ${source} completed in ${duration}ms: +${saveResult.inserted} new, ~${saveResult.updated} updated`,
    );

    return {
      source,
      fetched: result.jobs.length,
      new: saveResult.inserted,
      updated: saveResult.updated,
      duplicates: dedupResult.duplicates,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const message = error instanceof Error ? error.message : String(error);

    await ScraperLog.findByIdAndUpdate(log._id, {
      status: 'failed',
      completedAt: new Date(),
      duration,
      errorMessages: [message],
    });

    logger.error({ err: error }, `[ScraperJob] ${source} failed: ${message}`);
    throw error;
  }
}

// ─── Worker Initialization ────────────────────────────────────────────────────

let scraperWorker: Worker | null = null;

export function startScraperWorker() {
  scraperWorker = new Worker('scraper', processScraperJob, {
    connection: bullMQConnection,
    concurrency: 2, // Run at most 2 scrapers at a time
    limiter: {
      max: 5,
      duration: 60000, // Max 5 jobs per minute
    },
  });

  scraperWorker.on('completed', (job) => {
    logger.info(`[ScraperWorker] Job ${job.id} completed for ${job.data.source}`);
  });

  scraperWorker.on('failed', (job, err) => {
    logger.error(
      { err },
      `[ScraperWorker] Job ${job?.id} failed for ${job?.data.source}`,
    );
  });

  logger.info('Scraper worker started');
  return scraperWorker;
}

export function stopScraperWorker() {
  if (scraperWorker) {
    return scraperWorker.close();
  }
}
