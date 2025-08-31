import { Job } from 'bullmq';
import { createJobLogger } from '@mesrai/config';
import { GitHubAppService } from '../services/github-app.service';
import { InstallationService } from '../services/installation.service';

interface WebhookJobData {
  deliveryId: string;
  eventType: string;
  action?: string;
  payload: any;
}

export class WebhookProcessor {
  private githubAppService: GitHubAppService;
  private installationService: InstallationService;

  constructor() {
    this.githubAppService = new GitHubAppService();
    this.installationService = new InstallationService();
  }

  /**
   * Process webhook jobs from the queue
   */
  async processWebhookJob(job: Job<WebhookJobData>): Promise<void> {
    const logger = createJobLogger(job.id!, job.queueName, 'webhook');
    const { deliveryId, eventType, action, payload } = job.data;

    logger.info('Processing webhook job', {
      deliveryId,
      eventType,
      action,
    });

    try {
      // Check if this webhook has already been processed (idempotency)
      const shouldProcess = await this.installationService.recordWebhookEvent({
        githubDeliveryId: deliveryId,
        eventType,
        action,
        installationId: payload.installation?.id,
        repositoryId: payload.repository?.id,
        payload,
      });

      if (!shouldProcess) {
        logger.info('Webhook already processed, skipping', { deliveryId, eventType });
        return;
      }

      // Route to appropriate handler based on event type
      await this.routeWebhookEvent(eventType, action, payload, logger);

      // Mark webhook as processed
      await this.installationService.markWebhookEventProcessed(deliveryId);

      logger.info('Webhook job completed successfully', {
        deliveryId,
        eventType,
        action,
      });
    } catch (error) {
      logger.error('Webhook job failed', {
        deliveryId,
        eventType,
        action,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error; // Re-throw to trigger retry mechanism
    }
  }

  /**
   * Route webhook events to appropriate handlers
   */
  private async routeWebhookEvent(
    eventType: string, 
    action: string | undefined, 
    payload: any, 
    logger: any
  ): Promise<void> {
    switch (eventType) {
      case 'installation':
        await this.handleInstallationEvent(action, payload, logger);
        break;
      
      case 'installation_repositories':
        await this.handleInstallationRepositoriesEvent(action, payload, logger);
        break;
      
      case 'pull_request':
        await this.handlePullRequestEvent(action, payload, logger);
        break;
      
      case 'push':
        await this.handlePushEvent(payload, logger);
        break;
      
      default:
        logger.debug('Unhandled webhook event type', { eventType, action });
    }
  }

  /**
   * Handle installation events (created, deleted, suspend, unsuspend)
   */
  private async handleInstallationEvent(action: string | undefined, payload: any, logger: any): Promise<void> {
    const installation = payload.installation;
    
    logger.info('Processing installation event', {
      action,
      installationId: installation.id,
      accountId: installation.account.id,
    });

    switch (action) {
      case 'created':
        await this.installationService.upsertInstallation({
          githubInstallationId: installation.id,
          githubAccountId: installation.account.id,
          githubAccountType: installation.account.type,
        });

        // Sync repositories immediately after installation
        await this.syncInstallationRepositories(installation.id, logger);
        break;
      
      case 'deleted':
      case 'suspend':
        await this.installationService.deactivateInstallation(installation.id);
        break;
      
      case 'unsuspend':
        await this.installationService.upsertInstallation({
          githubInstallationId: installation.id,
          githubAccountId: installation.account.id,
          githubAccountType: installation.account.type,
        });
        break;
      
      default:
        logger.debug('Unhandled installation action', { action });
    }
  }

  /**
   * Handle installation repositories events (added, removed)
   */
  private async handleInstallationRepositoriesEvent(action: string | undefined, payload: any, logger: any): Promise<void> {
    const installation = payload.installation;
    
    logger.info('Processing installation repositories event', {
      action,
      installationId: installation.id,
      repositoriesCount: payload.repositories_added?.length || payload.repositories_removed?.length || 0,
    });

    switch (action) {
      case 'added':
        // Re-sync all repositories to ensure we have the latest list
        await this.syncInstallationRepositories(installation.id, logger);
        break;
      
      case 'removed':
        // Mark removed repositories as inactive
        if (payload.repositories_removed) {
          for (const repo of payload.repositories_removed) {
            logger.debug('Repository removed from installation', {
              installationId: installation.id,
              repositoryId: repo.id,
              repositoryName: repo.full_name,
            });
            // TODO: Implement repository deactivation
          }
        }
        break;
      
      default:
        logger.debug('Unhandled installation repositories action', { action });
    }
  }

  /**
   * Handle pull request events (opened, closed, etc.)
   */
  private async handlePullRequestEvent(action: string | undefined, payload: any, logger: any): Promise<void> {
    const pullRequest = payload.pull_request;
    const repository = payload.repository;
    
    logger.info('Processing pull request event', {
      action,
      repositoryId: repository.id,
      repositoryName: repository.full_name,
      pullRequestNumber: pullRequest.number,
      pullRequestId: pullRequest.id,
    });

    // TODO: Implement pull request review triggering logic
    // This would create a review session and potentially trigger AI analysis
    
    switch (action) {
      case 'opened':
      case 'synchronize': // New commits pushed
        logger.info('Pull request opened/updated, potential review trigger', {
          repositoryName: repository.full_name,
          pullRequestNumber: pullRequest.number,
        });
        // TODO: Create review session or add to review queue
        break;
      
      case 'closed':
        logger.info('Pull request closed', {
          repositoryName: repository.full_name,
          pullRequestNumber: pullRequest.number,
          merged: pullRequest.merged,
        });
        // TODO: Update review session status
        break;
      
      default:
        logger.debug('Unhandled pull request action', { action });
    }
  }

  /**
   * Handle push events
   */
  private async handlePushEvent(payload: any, logger: any): Promise<void> {
    const repository = payload.repository;
    
    logger.info('Processing push event', {
      repositoryId: repository.id,
      repositoryName: repository.full_name,
      ref: payload.ref,
      commits: payload.commits?.length || 0,
    });

    // TODO: Implement push-based review triggers if needed
    // This could trigger reviews for direct pushes to main branch
  }

  /**
   * Sync repositories for an installation
   */
  private async syncInstallationRepositories(githubInstallationId: number, logger: any): Promise<void> {
    try {
      logger.info('Syncing repositories for installation', { githubInstallationId });

      // Get repositories from GitHub API
      const githubRepositories = await this.githubAppService.getInstallationRepositories(githubInstallationId);

      // Get local installation record
      const installation = await this.installationService.getInstallationByGitHubId(githubInstallationId);
      if (!installation) {
        throw new Error(`Installation not found: ${githubInstallationId}`);
      }

      // Upsert repositories
      const repositoriesData = githubRepositories.map(repo => ({
        githubId: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        isPrivate: repo.private,
        language: repo.language,
        defaultBranch: repo.default_branch,
      }));

      await this.installationService.upsertRepositories(installation.id, repositoriesData);

      logger.info('Repositories synced successfully', {
        githubInstallationId,
        repositoriesCount: repositoriesData.length,
      });
    } catch (error) {
      logger.error('Failed to sync installation repositories', {
        githubInstallationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}