import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { initializeScheduledJobs } from './jobs/queues.js';
import { startScraperWorker, stopScraperWorker } from './jobs/scraper.job.js';
import { startCleanupWorker, stopCleanupWorker } from './jobs/cleanup.job.js';

async function start() {
  await connectDB();

  // Start BullMQ workers
  try {
    startScraperWorker();
    startCleanupWorker();
    await initializeScheduledJobs();
    logger.info('BullMQ workers and scheduled jobs initialized');
  } catch (error) {
    logger.warn({ err: error }, 'BullMQ initialization failed (Redis may not be running). Scrapers will be unavailable.');
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await stopScraperWorker();
      await stopCleanupWorker();
      logger.info('Workers stopped. Server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});
