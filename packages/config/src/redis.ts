import Redis from 'ioredis';
import { logger } from './logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const REDIS_MAX_RETRIES = 3;
const REDIS_RETRY_DELAY = 1000;

let redisInstance: Redis | null = null;

export function createRedisConnection(name = 'default'): Redis {
  if (redisInstance) {
    return redisInstance;
  }

  logger.info(`Creating Redis connection: ${name}`, { 
    redisUrl: REDIS_URL.replace(/\/\/.*@/, '//***@'), // Hide credentials in logs
    name 
  });

  redisInstance = new Redis(REDIS_URL, {
    maxRetriesPerRequest: REDIS_MAX_RETRIES,
    retryDelayOnFailover: REDIS_RETRY_DELAY,
    enableReadyCheck: true,
    maxLoadingTimeout: 5000,
    lazyConnect: true,
    
    // Connection events
    connectTimeout: 10000,
    commandTimeout: 5000,
    
    // Retry configuration
    retryDelayOnClusterDown: 300,
    retryDelayOnFailover: 100,
  });

  redisInstance.on('connect', () => {
    logger.info(`Redis connected: ${name}`);
  });

  redisInstance.on('ready', () => {
    logger.info(`Redis ready: ${name}`);
  });

  redisInstance.on('error', (error) => {
    logger.error(`Redis error: ${name}`, { error: error.message, stack: error.stack });
  });

  redisInstance.on('close', () => {
    logger.warn(`Redis connection closed: ${name}`);
  });

  redisInstance.on('reconnecting', (ms) => {
    logger.info(`Redis reconnecting in ${ms}ms: ${name}`);
  });

  return redisInstance;
}

export function getRedisInstance(): Redis {
  if (!redisInstance) {
    throw new Error('Redis instance not initialized. Call createRedisConnection() first.');
  }
  return redisInstance;
}

export async function closeRedisConnection(): Promise<void> {
  if (redisInstance) {
    logger.info('Closing Redis connection...');
    await redisInstance.quit();
    redisInstance = null;
  }
}

// Queue configuration
export const QUEUE_NAMES = {
  GITHUB_WEBHOOKS: 'github-webhook-events',
  REPOSITORY_SYNC: 'repository-sync',
  REVIEW_PROCESSING: 'review-processing',
} as const;

export const QUEUE_CONFIG = {
  defaultJobOptions: {
    removeOnComplete: 100, // Keep last 100 completed jobs
    removeOnFail: 50, // Keep last 50 failed jobs
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 2000,
    },
  },
  
  // High priority for webhook processing to maintain GitHub compliance
  webhookProcessing: {
    attempts: 5,
    backoff: {
      type: 'exponential' as const,
      delay: 1000,
    },
    removeOnComplete: 200,
    removeOnFail: 100,
  },
  
  // Lower priority for bulk operations
  repositorySync: {
    attempts: 3,
    backoff: {
      type: 'exponential' as const,
      delay: 5000,
    },
    removeOnComplete: 50,
    removeOnFail: 25,
  },
} as const;