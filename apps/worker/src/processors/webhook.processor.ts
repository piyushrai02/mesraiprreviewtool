import { Job } from 'bullmq';
import { createJobLogger } from '@mesrai/config';
import { GitHubAppService } from '../services/github-app.service';
import { InstallationService } from '../services/installation.service';
import { AIReviewService } from '../services/ai-review.service';
import { PrismaClient } from '@prisma/client';

interface WebhookJobData {
  deliveryId: string;
  eventType: string;
  action?: string;
  payload: any;
}

export class WebhookProcessor {
  private githubAppService: GitHubAppService;
  private installationService: InstallationService;
  private aiReviewService: AIReviewService;
  private prisma: PrismaClient;

  constructor() {
    this.githubAppService = new GitHubAppService();
    this.installationService = new InstallationService();
    this.aiReviewService = new AIReviewService();
    this.prisma = new PrismaClient();
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
    const installation = payload.installation;
    
    logger.info('Processing pull request event', {
      action,
      repositoryId: repository.id,
      repositoryName: repository.full_name,
      pullRequestNumber: pullRequest.number,
      pullRequestId: pullRequest.id,
    });

    switch (action) {
      case 'opened':
      case 'synchronize': // New commits pushed
        logger.info('Pull request opened/updated, triggering AI review', {
          repositoryName: repository.full_name,
          pullRequestNumber: pullRequest.number,
        });
        
        // Trigger AI review in background
        await this.triggerAIReview({
          installationId: installation.id,
          repositoryId: repository.id,
          repositoryName: repository.full_name,
          owner: repository.owner.login,
          repo: repository.name,
          pullRequestNumber: pullRequest.number,
          pullRequestId: pullRequest.id,
          title: pullRequest.title,
          author: pullRequest.user.login,
          logger
        });
        break;
      
      case 'closed':
        logger.info('Pull request closed', {
          repositoryName: repository.full_name,
          pullRequestNumber: pullRequest.number,
          merged: pullRequest.merged,
        });
        
        // Update any active review sessions
        await this.handlePullRequestClosed({
          repositoryId: repository.id,
          pullRequestNumber: pullRequest.number,
          merged: pullRequest.merged,
          logger
        });
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

  /**
   * Trigger AI review for a pull request
   */
  private async triggerAIReview(params: {
    installationId: number;
    repositoryId: number;
    repositoryName: string;
    owner: string;
    repo: string;
    pullRequestNumber: number;
    pullRequestId: number;
    title: string;
    author: string;
    logger: any;
  }): Promise<void> {
    const { installationId, repositoryId, owner, repo, pullRequestNumber, pullRequestId, title, author, logger } = params;

    try {
      // Find or create repository in our database
      const repository = await this.prisma.repository.findFirst({
        where: {
          githubId: repositoryId
        },
        include: {
          installation: true
        }
      });

      if (!repository) {
        logger.warn('Repository not found in database', { repositoryId });
        return;
      }

      // Check if review session already exists
      const existingSession = await this.prisma.reviewSession.findFirst({
        where: {
          repositoryId: repository.id,
          pullRequestNumber: pullRequestNumber
        }
      });

      let reviewSession;
      if (existingSession) {
        // Update existing session
        reviewSession = await this.prisma.reviewSession.update({
          where: { id: existingSession.id },
          data: {
            status: 'analyzing',
            title: title,
            author: author,
            updatedAt: new Date()
          }
        });
        logger.info('Updated existing review session', { reviewSessionId: reviewSession.id });
      } else {
        // Create new review session
        reviewSession = await this.prisma.reviewSession.create({
          data: {
            repositoryId: repository.id,
            pullRequestNumber: pullRequestNumber,
            githubPrId: pullRequestId,
            title: title,
            author: author,
            userId: repository.installation.userId,
            status: 'analyzing'
          }
        });
        logger.info('Created new review session', { reviewSessionId: reviewSession.id });
      }

      // Perform AI analysis
      const analysisResults = await this.aiReviewService.analyzePullRequest(
        installationId,
        owner,
        repo,
        pullRequestNumber
      );

      // Save analysis results as review comments
      const commentPromises = analysisResults.map(result => 
        this.prisma.reviewComment.create({
          data: {
            reviewSessionId: reviewSession.id,
            type: result.type,
            severity: result.severity,
            title: result.title,
            description: result.description,
            filePath: result.filePath,
            lineNumber: result.lineNumber,
            suggestion: result.suggestion,
            isCommittable: result.isCommittable || false,
            status: 'pending'
          }
        })
      );

      await Promise.all(commentPromises);

      // Update review session with final stats
      const stats = this.calculateReviewStats(analysisResults);
      await this.prisma.reviewSession.update({
        where: { id: reviewSession.id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          totalIssues: stats.totalIssues,
          criticalIssues: stats.criticalIssues,
          suggestions: stats.suggestions
        }
      });

      logger.info('AI review completed successfully', {
        reviewSessionId: reviewSession.id,
        totalFindings: analysisResults.length,
        ...stats
      });

      // Post review comments to GitHub (optional)
      await this.postReviewCommentsToGitHub(installationId, owner, repo, pullRequestNumber, analysisResults, logger);

    } catch (error) {
      logger.error('Failed to trigger AI review', {
        repositoryId,
        pullRequestNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Handle pull request closed event
   */
  private async handlePullRequestClosed(params: {
    repositoryId: number;
    pullRequestNumber: number;
    merged: boolean;
    logger: any;
  }): Promise<void> {
    const { repositoryId, pullRequestNumber, merged, logger } = params;

    try {
      const repository = await this.prisma.repository.findFirst({
        where: { githubId: repositoryId }
      });

      if (!repository) {
        logger.warn('Repository not found for closed PR', { repositoryId });
        return;
      }

      // Update review session if exists
      const reviewSession = await this.prisma.reviewSession.findFirst({
        where: {
          repositoryId: repository.id,
          pullRequestNumber: pullRequestNumber
        }
      });

      if (reviewSession && reviewSession.status !== 'completed') {
        await this.prisma.reviewSession.update({
          where: { id: reviewSession.id },
          data: {
            status: merged ? 'completed' : 'cancelled',
            completedAt: new Date()
          }
        });

        logger.info('Updated review session for closed PR', {
          reviewSessionId: reviewSession.id,
          merged
        });
      }
    } catch (error) {
      logger.error('Failed to handle PR closed event', {
        repositoryId,
        pullRequestNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Calculate review statistics from analysis results
   */
  private calculateReviewStats(results: any[]) {
    return {
      totalIssues: results.filter(r => r.type === 'issue' || r.type === 'security').length,
      criticalIssues: results.filter(r => r.severity === 'critical').length,
      suggestions: results.filter(r => r.type === 'suggestion').length
    };
  }

  /**
   * Post review comments to GitHub (simplified version)
   */
  private async postReviewCommentsToGitHub(
    installationId: number,
    owner: string,
    repo: string,
    pullRequestNumber: number,
    analysisResults: any[],
    logger: any
  ): Promise<void> {
    try {
      const octokit = await this.githubAppService.getInstallationOctokit(installationId);

      // Group critical and high-priority findings for summary comment
      const criticalFindings = analysisResults.filter(r => 
        r.severity === 'critical' || r.severity === 'error'
      );

      if (criticalFindings.length > 0) {
        const summaryComment = this.generateSummaryComment(analysisResults);
        
        await octokit.rest.issues.createComment({
          owner,
          repo,
          issue_number: pullRequestNumber,
          body: summaryComment
        });

        logger.info('Posted AI review summary to GitHub', {
          owner,
          repo,
          pullRequestNumber,
          findingsCount: analysisResults.length
        });
      }
    } catch (error) {
      logger.error('Failed to post review comments to GitHub', {
        owner,
        repo,
        pullRequestNumber,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Don't throw - this is optional functionality
    }
  }

  /**
   * Generate summary comment for GitHub
   */
  private generateSummaryComment(results: any[]): string {
    const critical = results.filter(r => r.severity === 'critical').length;
    const errors = results.filter(r => r.severity === 'error').length;
    const warnings = results.filter(r => r.severity === 'warning').length;
    const suggestions = results.filter(r => r.type === 'suggestion').length;
    const security = results.filter(r => r.type === 'security').length;

    let comment = '## 🤖 AI Code Review Summary\n\n';
    
    if (critical > 0) {
      comment += `🚨 **${critical} Critical Issues** found that require immediate attention\n`;
    }
    if (security > 0) {
      comment += `🔒 **${security} Security Issues** detected\n`;
    }
    if (errors > 0) {
      comment += `❌ **${errors} Errors** found\n`;
    }
    if (warnings > 0) {
      comment += `⚠️ **${warnings} Warnings** identified\n`;
    }
    if (suggestions > 0) {
      comment += `💡 **${suggestions} Suggestions** for improvement\n`;
    }

    comment += '\n### Key Findings:\n';
    
    const topFindings = results
      .filter(r => r.severity === 'critical' || r.severity === 'error')
      .slice(0, 5);

    for (const finding of topFindings) {
      const icon = finding.type === 'security' ? '🔒' : finding.severity === 'critical' ? '🚨' : '❌';
      comment += `${icon} **${finding.title}** - ${finding.description}\n`;
    }

    comment += '\n> 📝 View detailed analysis and suggestions in the Mesrai AI dashboard.';
    
    return comment;
  }
}