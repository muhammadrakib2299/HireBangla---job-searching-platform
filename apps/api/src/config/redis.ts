import IORedis from 'ioredis';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

export const redisConnection = new IORedis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on('connect', () => {
  logger.info('Redis connected');
});

redisConnection.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

// Shared connection config for BullMQ (uses separate connections internally)
export const bullMQConnection = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
};
