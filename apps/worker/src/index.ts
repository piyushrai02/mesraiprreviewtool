import { Worker } from 'bullmq';
import { createRedisConnection, QUEUE_NAMES, QUEUE_CONFIG, createLogger } from '@mesrai/config';
import { WebhookProcessor } from './processors/webhook.processor';

const logger = createLogger({ service: 'worker' });

class MesraiWorker {
  private webhookWorker: Worker;
  private webhookProcessor: WebhookProcessor;

  constructor() {
    logger.info('Initializing Mesrai Worker...');

    // Initialize services
    this.webhookProcessor = new WebhookProcessor();

    // Create Redis connection
    const redisConnection = createRedisConnection('worker');

    // Initialize webhook processor worker
    this.webhookWorker = new Worker(
      QUEUE_NAMES.GITHUB_WEBHOOKS,
      async (job) => {
        return await this.webhookProcessor.processWebhookJob(job);
      },
      {
        connection: redisConnection,
        ...QUEUE_CONFIG.webhookProcessing,
        concurrency: 5, // Process up to 5 webhooks concurrently
      }
    );

    this.setupEventHandlers();

    logger.info('Mesrai Worker initialized successfully', {
      queues: Object.values(QUEUE_NAMES),
      concurrency: 5,
    });
  }

  private setupEventHandlers(): void {
    // Webhook worker events
    this.webhookWorker.on('completed', (job) => {
      logger.info('Webhook job completed', {
        jobId: job.id,
        queueName: job.queueName,
        duration: Date.now() - job.processedOn!,
      });
    });

    this.webhookWorker.on('failed', (job, err) => {
      logger.error('Webhook job failed', {
        jobId: job?.id,
        queueName: job?.queueName,
        error: err.message,
        stack: err.stack,
        attemptsMade: job?.attemptsMade,
        data: job?.data,
      });
    });

    this.webhookWorker.on('error', (err) => {
      logger.error('Webhook worker error', {
        error: err.message,
        stack: err.stack,
      });
    });

    this.webhookWorker.on('ready', () => {
      logger.info('Webhook worker ready');
    });

    this.webhookWorker.on('active', (job) => {
      logger.debug('Webhook job started', {
        jobId: job.id,
        queueName: job.queueName,
        data: job.data,
      });
    });

    // Graceful shutdown handling
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('uncaughtException', (error) => {
      logger.fatal('Uncaught exception', { error: error.message, stack: error.stack });
      this.shutdown('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.fatal('Unhandled rejection', { reason, promise });
      this.shutdown('unhandledRejection');
    });
  }

  private async shutdown(signal: string): Promise<void> {
    logger.info(`Shutting down worker due to ${signal}...`);

    try {
      // Close workers gracefully
      await Promise.all([
        this.webhookWorker.close(),
      ]);

      logger.info('Worker shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during worker shutdown', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      process.exit(1);
    }
  }

  async start(): Promise<void> {
    logger.info('Starting Mesrai Worker...');
    
    // Workers start automatically when instantiated
    // Just log that we're ready
    logger.info('Mesrai Worker is running and waiting for jobs', {
      queues: Object.values(QUEUE_NAMES),
    });
  }
}

// Start the worker
async function main() {
  try {
    const worker = new MesraiWorker();
    await worker.start();
  } catch (error) {
    logger.fatal('Failed to start worker', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    process.exit(1);
  }
}

main().catch((error) => {
  logger.fatal('Worker main process error', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});