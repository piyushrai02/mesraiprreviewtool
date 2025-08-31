import { Router, Request, Response } from 'express';
import { Queue } from 'bullmq';
import { createRedisConnection, QUEUE_NAMES, QUEUE_CONFIG, verifyWebhookSignature, createRequestLogger } from '@mesrai/config';
import crypto from 'crypto';

const router = Router();

// Initialize the webhook queue
let webhookQueue: Queue | null = null;

function getWebhookQueue(): Queue {
  if (!webhookQueue) {
    const redisConnection = createRedisConnection('api-webhook');
    webhookQueue = new Queue(QUEUE_NAMES.GITHUB_WEBHOOKS, {
      connection: redisConnection,
      defaultJobOptions: QUEUE_CONFIG.webhookProcessing,
    });
  }
  return webhookQueue;
}

/**
 * GitHub webhook endpoint - MUST be extremely lightweight for GitHub compliance
 * GitHub expects webhooks to be acknowledged within 10 seconds
 */
router.post('/github', async (req: Request, res: Response) => {
  const requestId = crypto.randomBytes(16).toString('hex');
  const logger = createRequestLogger(requestId, '/webhooks/github', 'POST');
  
  const startTime = Date.now();
  
  try {
    logger.info('Webhook received', {
      headers: {
        'x-github-event': req.headers['x-github-event'],
        'x-github-delivery': req.headers['x-github-delivery'],
        'x-hub-signature-256': req.headers['x-hub-signature-256'] ? '[REDACTED]' : undefined,
      },
    });

    // 1. Extract required headers
    const githubEvent = req.headers['x-github-event'] as string;
    const githubDelivery = req.headers['x-github-delivery'] as string;
    const githubSignature = req.headers['x-hub-signature-256'] as string;

    // 2. Validate required headers
    if (!githubEvent || !githubDelivery || !githubSignature) {
      logger.warn('Missing required webhook headers', {
        hasEvent: !!githubEvent,
        hasDelivery: !!githubDelivery,
        hasSignature: !!githubSignature,
      });
      return res.status(400).json({ 
        error: 'Missing required webhook headers',
        code: 'MISSING_HEADERS'
      });
    }

    // 3. Verify webhook signature immediately
    const rawPayload = JSON.stringify(req.body);
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      logger.error('GITHUB_WEBHOOK_SECRET not configured');
      return res.status(500).json({ 
        error: 'Webhook secret not configured',
        code: 'MISSING_WEBHOOK_SECRET'
      });
    }

    const isValidSignature = verifyWebhookSignature(rawPayload, githubSignature, webhookSecret);
    
    if (!isValidSignature) {
      logger.warn('Invalid webhook signature', {
        deliveryId: githubDelivery,
        eventType: githubEvent,
      });
      return res.status(400).json({ 
        error: 'Invalid webhook signature',
        code: 'INVALID_SIGNATURE'
      });
    }

    // 4. Immediately acknowledge the webhook with 202 Accepted
    //    BEFORE doing any processing
    res.status(202).json({
      message: 'Webhook received and queued for processing',
      deliveryId: githubDelivery,
      eventType: githubEvent,
    });

    // 5. Asynchronously add job to queue (don't await this)
    setImmediate(async () => {
      try {
        const queue = getWebhookQueue();
        
        await queue.add(
          'process-webhook',
          {
            deliveryId: githubDelivery,
            eventType: githubEvent,
            action: req.body.action,
            payload: req.body,
          },
          {
            jobId: githubDelivery, // Use delivery ID as job ID for deduplication
            removeOnComplete: 100,
            removeOnFail: 50,
            attempts: 5,
            backoff: {
              type: 'exponential',
              delay: 1000,
            },
          }
        );

        logger.info('Webhook job queued successfully', {
          deliveryId: githubDelivery,
          eventType: githubEvent,
          processingTime: Date.now() - startTime,
        });
      } catch (queueError) {
        logger.error('Failed to queue webhook job', {
          deliveryId: githubDelivery,
          eventType: githubEvent,
          error: queueError instanceof Error ? queueError.message : 'Unknown error',
        });
        // Note: We don't fail the webhook here since we already responded to GitHub
        // The webhook will be retried by GitHub, giving us another chance
      }
    });

    logger.info('Webhook acknowledged', {
      deliveryId: githubDelivery,
      eventType: githubEvent,
      responseTime: Date.now() - startTime,
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    
    logger.error('Webhook processing error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      processingTime,
    });

    // Only send error response if we haven't already responded
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      });
    }
  }
});

/**
 * Health check endpoint for webhook service
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const queue = getWebhookQueue();
    
    // Get basic queue statistics
    const waiting = await queue.getWaiting();
    const active = await queue.getActive();
    const completed = await queue.getCompleted();
    const failed = await queue.getFailed();

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      queue: {
        name: QUEUE_NAMES.GITHUB_WEBHOOKS,
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;