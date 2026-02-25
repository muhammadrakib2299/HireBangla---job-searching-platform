import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { logger } from './utils/logger.js';
import { initializeScheduledJobs } from './jobs/queues.js';
import { startScraperWorker, stopScraperWorker } from './jobs/scraper.job.js';
import { startCleanupWorker, stopCleanupWorker } from './jobs/cleanup.job.js';
import { startEmailWorker, stopEmailWorker } from './jobs/email.job.js';

async function start() {
  await connectDB();

  // Start HTTP server first so API is available immediately
  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });

  // Start BullMQ workers in background (non-blocking)
  try {
    startScraperWorker();
    startCleanupWorker();
    startEmailWorker();
    initializeScheduledJobs()
      .then(() => logger.info('BullMQ scheduled jobs initialized'))
      .catch((err) => logger.warn({ err }, 'BullMQ scheduled jobs failed (Redis may not be running)'));
  } catch (error) {
    logger.warn({ err: error }, 'BullMQ initialization failed (Redis may not be running). Scrapers will be unavailable.');
  }

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received. Shutting down gracefully...`);
    server.close(async () => {
      await stopScraperWorker();
      await stopCleanupWorker();
      await stopEmailWorker();
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
