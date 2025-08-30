import { Request, Response } from 'express';
import { GitHubService } from '../services/github.service.js';
import { AIReviewService } from '../services/ai-review.service.js';
import {
  GitHubAppInstallationRequest,
  GitHubAppInstallationResponse,
  WebhookProcessingRequest,
  WebhookProcessingResponse,
  StartReviewRequest,
  StartReviewResponse,
  GITHUB_ERROR_MESSAGES,
  GITHUB_SUCCESS_MESSAGES
} from '@shared/index';

export class GitHubController {
  private githubService: GitHubService;
  private aiReviewService: AIReviewService;

  constructor() {
    this.githubService = new GitHubService();
    this.aiReviewService = new AIReviewService(this.githubService);
  }

  /**
   * Handle GitHub App installation callback
   */
  handleInstallation = async (req: Request, res: Response): Promise<void> => {
    try {
      const { installation_id, setup_action } = req.query;

      if (!installation_id) {
        res.status(400).json({
          success: false,
          message: 'Installation ID is required'
        });
        return;
      }

      const installationId = parseInt(installation_id as string);
      
      // Get installation details and repositories
      const { installation, repositories } = await this.githubService.handleInstallation(installationId);

      // Here you would save the installation and repositories to your database
      // For now, we'll just return the data

      const response: GitHubAppInstallationResponse = {
        success: true,
        installation,
        repositories: repositories.map(repo => ({
          id: crypto.randomUUID(),
          githubId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          owner: repo.owner.login,
          isPrivate: repo.private,
          installationId,
          language: repo.language || undefined,
          defaultBranch: repo.default_branch,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })),
        message: GITHUB_SUCCESS_MESSAGES.INSTALLATION_COMPLETED
      };

      res.json(response);
    } catch (error) {
      console.error('Installation error:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Installation failed'
      });
    }
  };

  /**
   * Handle GitHub webhooks
   */
  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const signature = req.headers['x-hub-signature-256'] as string;
      const event = req.headers['x-github-event'] as string;
      const deliveryId = req.headers['x-github-delivery'] as string;
      const payload = req.body;

      if (!signature || !event || !deliveryId) {
        res.status(400).json({
          success: false,
          message: 'Missing required webhook headers'
        });
        return;
      }

      // Verify webhook signature
      const rawBody = JSON.stringify(payload);
      const isValid = this.githubService.verifyWebhookSignature(rawBody, signature);
      
      if (!isValid) {
        res.status(401).json({
          success: false,
          message: GITHUB_ERROR_MESSAGES.WEBHOOK_VERIFICATION_FAILED
        });
        return;
      }

      // Process the webhook event
      const result = await this.githubService.processWebhookEvent(event, payload);

      const response: WebhookProcessingResponse = {
        success: true,
        processed: result.processed,
        action: result.action,
        message: result.message
      };

      res.json(response);
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({
        success: false,
        processed: false,
        message: error instanceof Error ? error.message : 'Webhook processing failed'
      });
    }
  };

  /**
   * Get connected repositories
   */
  getRepositories = async (req: Request, res: Response): Promise<void> => {
    try {
      // Here you would fetch repositories from your database
      // For now, we'll return mock repositories with real-looking data
      
      const mockRepositories = [
        {
          id: '1',
          githubId: 123456789,
          name: 'awesome-project',
          fullName: 'myorg/awesome-project',
          owner: 'myorg',
          isPrivate: false,
          installationId: 12345,
          language: 'TypeScript',
          defaultBranch: 'main',
          isActive: true,
          lastSyncAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          githubId: 987654321,
          name: 'api-service',
          fullName: 'myorg/api-service',
          owner: 'myorg',
          isPrivate: true,
          installationId: 12345,
          language: 'Python',
          defaultBranch: 'main',
          isActive: true,
          lastSyncAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          githubId: 456789123,
          name: 'frontend-app',
          fullName: 'myorg/frontend-app',
          owner: 'myorg',
          isPrivate: false,
          installationId: 12345,
          language: 'JavaScript',
          defaultBranch: 'develop',
          isActive: false,
          lastSyncAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      res.json({
        success: true,
        data: mockRepositories,
        message: 'Repositories fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching repositories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch repositories'
      });
    }
  };

  /**
   * Get repository details
   */
  getRepository = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Repository ID is required'
        });
        return;
      }

      // Here you would fetch the repository from your database
      // For now, we'll return a mock response

      res.json({
        success: true,
        data: null,
        message: 'Repository not found'
      });
    } catch (error) {
      console.error('Error fetching repository:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch repository'
      });
    }
  };

  /**
   * Get all review sessions
   */
  getReviews = async (req: Request, res: Response): Promise<void> => {
    try {
      // Here you would fetch reviews from your database
      // For now, we'll return mock reviews
      
      const mockReviews = [
        {
          id: 'review-1',
          repositoryId: '1',
          pullRequestNumber: 42,
          githubPrId: 123456,
          status: 'reviewed',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'review-2',
          repositoryId: '2',
          pullRequestNumber: 18,
          githubPrId: 789012,
          status: 'analyzing',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'review-3',
          repositoryId: '1',
          pullRequestNumber: 87,
          githubPrId: 345678,
          status: 'commented',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString()
        }
      ];

      res.json({
        success: true,
        data: mockReviews,
        message: 'Reviews fetched successfully'
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch reviews'
      });
    }
  };

  /**
   * Start AI review for a pull request
   */
  startReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { repositoryId, pullRequestNumber, forceReview } = req.body as StartReviewRequest;

      if (!repositoryId || !pullRequestNumber) {
        res.status(400).json({
          success: false,
          message: 'Repository ID and pull request number are required'
        });
        return;
      }

      // Here you would:
      // 1. Fetch repository details from database to get installation ID
      // 2. Check if review is already in progress (unless forceReview is true)
      // 3. Create a review session record
      // 4. Queue the review job

      // For demo purposes, we'll create a mock review session
      const reviewSession = {
        id: crypto.randomUUID(),
        repositoryId,
        pullRequestNumber,
        githubPrId: 0, // Would be fetched from GitHub
        status: 'queued' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const response: StartReviewResponse = {
        success: true,
        reviewSession,
        message: GITHUB_SUCCESS_MESSAGES.REVIEW_STARTED
      };

      res.json(response);

      // In the background, you would start the actual review process
      // this.startReviewProcess(reviewSession);
      
    } catch (error) {
      console.error('Error starting review:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to start review'
      });
    }
  };

  /**
   * Get review status
   */
  getReviewStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Review ID is required'
        });
        return;
      }

      // Here you would fetch the review status from your database
      // For now, we'll return a mock response

      res.json({
        success: true,
        data: {
          id,
          status: 'completed',
          progress: 100,
          message: 'Review completed successfully'
        }
      });
    } catch (error) {
      console.error('Error fetching review status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch review status'
      });
    }
  };

  /**
   * Trigger manual review (for testing)
   */
  triggerManualReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const { installationId, owner, repo, pullNumber } = req.body;

      if (!installationId || !owner || !repo || !pullNumber) {
        res.status(400).json({
          success: false,
          message: 'Installation ID, owner, repo, and pull number are required'
        });
        return;
      }

      // Start the AI review process
      const review = await this.aiReviewService.reviewPullRequest(
        installationId,
        owner,
        repo,
        pullNumber
      );

      res.json({
        success: true,
        data: review,
        message: 'Manual review completed successfully'
      });
    } catch (error) {
      console.error('Error triggering manual review:', error);
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Manual review failed'
      });
    }
  };

  /**
   * Validate repository permissions
   */
  validatePermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { installationId, owner, repo } = req.body;

      if (!installationId || !owner || !repo) {
        res.status(400).json({
          success: false,
          message: 'Installation ID, owner, and repo are required'
        });
        return;
      }

      const isValid = await this.githubService.validateRepositoryPermissions(
        installationId,
        owner,
        repo
      );

      res.json({
        success: true,
        data: { isValid },
        message: isValid ? 'Permissions valid' : 'Insufficient permissions'
      });
    } catch (error) {
      console.error('Error validating permissions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate permissions'
      });
    }
  };
}