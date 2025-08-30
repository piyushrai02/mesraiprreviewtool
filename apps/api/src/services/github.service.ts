import { App } from 'octokit';
import crypto from 'crypto';
import { 
  GitHubInstallation, 
  GitHubRepository, 
  GitHubPullRequest,
  ConnectedRepository,
  GitHubWebhookEvent,
  GITHUB_WEBHOOK_EVENTS,
  GITHUB_PR_ACTIONS,
  GITHUB_INSTALLATION_ACTIONS,
  GITHUB_ERROR_MESSAGES,
  REVIEW_COMMENT_TEMPLATES
} from '@shared/index';

export class GitHubService {
  private app: App;
  
  constructor() {
    if (!process.env.GITHUB_APP_ID || !process.env.GITHUB_PRIVATE_KEY) {
      throw new Error('GitHub App configuration missing');
    }
    
    this.app = new App({
      appId: process.env.GITHUB_APP_ID,
      privateKey: process.env.GITHUB_PRIVATE_KEY,
      webhooks: {
        secret: process.env.GITHUB_WEBHOOK_SECRET || 'development-secret'
      }
    });
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!process.env.GITHUB_WEBHOOK_SECRET) {
      console.warn('GitHub webhook secret not configured');
      return true; // Allow in development
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
      .update(payload, 'utf8')
      .digest('hex');

    const receivedSignature = signature.replace('sha256=', '');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(receivedSignature, 'hex')
    );
  }

  /**
   * Handle GitHub app installation
   */
  async handleInstallation(installationId: number): Promise<{
    installation: GitHubInstallation;
    repositories: GitHubRepository[];
  }> {
    try {
      const octokit = await this.app.getInstallationOctokit(installationId);
      
      // Get installation details
      const { data: installation } = await octokit.rest.apps.getInstallation({
        installation_id: installationId
      });

      // Get accessible repositories
      const { data: reposData } = await octokit.rest.apps.listReposAccessibleToInstallation();
      
      return {
        installation: installation as GitHubInstallation,
        repositories: reposData.repositories as GitHubRepository[]
      };
    } catch (error) {
      console.error('GitHub installation error:', error);
      throw new Error(GITHUB_ERROR_MESSAGES.INSTALLATION_NOT_FOUND);
    }
  }

  /**
   * Get pull request details
   */
  async getPullRequest(
    installationId: number, 
    owner: string, 
    repo: string, 
    pullNumber: number
  ): Promise<GitHubPullRequest> {
    try {
      const octokit = await this.app.getInstallationOctokit(installationId);
      
      const { data } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber
      });

      return data as GitHubPullRequest;
    } catch (error) {
      console.error('Error fetching pull request:', error);
      throw new Error(GITHUB_ERROR_MESSAGES.PULL_REQUEST_NOT_FOUND);
    }
  }

  /**
   * Get pull request diff
   */
  async getPullRequestDiff(
    installationId: number,
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<string> {
    try {
      const octokit = await this.app.getInstallationOctokit(installationId);
      
      const { data } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number: pullNumber,
        mediaType: {
          format: 'diff'
        }
      });

      return data as unknown as string;
    } catch (error) {
      console.error('Error fetching pull request diff:', error);
      throw new Error('Failed to fetch pull request diff');
    }
  }

  /**
   * Get file contents at specific commit
   */
  async getFileContent(
    installationId: number,
    owner: string,
    repo: string,
    path: string,
    ref: string
  ): Promise<string> {
    try {
      const octokit = await this.app.getInstallationOctokit(installationId);
      
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref
      });

      if ('content' in data) {
        return Buffer.from(data.content, 'base64').toString('utf8');
      }
      
      throw new Error('File content not available');
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw new Error('Failed to fetch file content');
    }
  }

  /**
   * Create a pull request comment
   */
  async createPullRequestComment(
    installationId: number,
    owner: string,
    repo: string,
    pullNumber: number,
    body: string
  ): Promise<void> {
    try {
      const octokit = await this.app.getInstallationOctokit(installationId);
      
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: pullNumber,
        body
      });
    } catch (error) {
      console.error('Error creating pull request comment:', error);
      throw new Error('Failed to create pull request comment');
    }
  }

  /**
   * Create a review comment on specific line
   */
  async createReviewComment(
    installationId: number,
    owner: string,
    repo: string,
    pullNumber: number,
    body: string,
    path: string,
    line: number,
    side: 'LEFT' | 'RIGHT' = 'RIGHT'
  ): Promise<void> {
    try {
      const octokit = await this.app.getInstallationOctokit(installationId);
      
      await octokit.rest.pulls.createReviewComment({
        owner,
        repo,
        pull_number: pullNumber,
        body,
        path,
        line,
        side
      });
    } catch (error) {
      console.error('Error creating review comment:', error);
      throw new Error('Failed to create review comment');
    }
  }

  /**
   * Create a pull request review
   */
  async createPullRequestReview(
    installationId: number,
    owner: string,
    repo: string,
    pullNumber: number,
    comments: Array<{
      path: string;
      line: number;
      body: string;
    }>,
    body: string,
    event: 'COMMENT' | 'APPROVE' | 'REQUEST_CHANGES' = 'COMMENT'
  ): Promise<void> {
    try {
      const octokit = await this.app.getInstallationOctokit(installationId);
      
      await octokit.rest.pulls.createReview({
        owner,
        repo,
        pull_number: pullNumber,
        body,
        event,
        comments
      });
    } catch (error) {
      console.error('Error creating pull request review:', error);
      throw new Error('Failed to create pull request review');
    }
  }

  /**
   * Check if repository has required permissions
   */
  async validateRepositoryPermissions(
    installationId: number,
    owner: string,
    repo: string
  ): Promise<boolean> {
    try {
      const octokit = await this.app.getInstallationOctokit(installationId);
      
      // Try to access the repository
      await octokit.rest.repos.get({ owner, repo });
      
      // Check if we can write to pull requests
      const { data: installation } = await octokit.rest.apps.getInstallation({
        installation_id: installationId
      });
      
      return installation.permissions?.pull_requests === 'write';
    } catch (error) {
      console.error('Permission validation error:', error);
      return false;
    }
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: string, payload: GitHubWebhookEvent): Promise<{
    processed: boolean;
    action?: string;
    message: string;
  }> {
    try {
      switch (event) {
        case GITHUB_WEBHOOK_EVENTS.INSTALLATION:
          return await this.handleInstallationEvent(payload);
          
        case GITHUB_WEBHOOK_EVENTS.INSTALLATION_REPOSITORIES:
          return await this.handleInstallationRepositoriesEvent(payload);
          
        case GITHUB_WEBHOOK_EVENTS.PULL_REQUEST:
          return await this.handlePullRequestEvent(payload);
          
        case GITHUB_WEBHOOK_EVENTS.PING:
          return {
            processed: true,
            action: 'ping',
            message: 'Webhook ping received successfully'
          };
          
        default:
          return {
            processed: false,
            message: `Unhandled webhook event: ${event}`
          };
      }
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  private async handleInstallationEvent(payload: GitHubWebhookEvent): Promise<{
    processed: boolean;
    action?: string;
    message: string;
  }> {
    const { action, installation } = payload;
    
    if (!installation) {
      throw new Error('Installation data missing from webhook');
    }

    switch (action) {
      case GITHUB_INSTALLATION_ACTIONS.CREATED:
        // Handle new installation
        // Here you would save installation to database
        return {
          processed: true,
          action: 'installation_created',
          message: 'GitHub app installed successfully'
        };
        
      case GITHUB_INSTALLATION_ACTIONS.DELETED:
        // Handle installation deletion
        // Here you would clean up installation from database
        return {
          processed: true,
          action: 'installation_deleted',
          message: 'GitHub app uninstalled'
        };
        
      default:
        return {
          processed: false,
          message: `Unhandled installation action: ${action}`
        };
    }
  }

  private async handleInstallationRepositoriesEvent(payload: GitHubWebhookEvent): Promise<{
    processed: boolean;
    action?: string;
    message: string;
  }> {
    // Handle repository additions/removals
    return {
      processed: true,
      action: 'repositories_updated',
      message: 'Installation repositories updated'
    };
  }

  private async handlePullRequestEvent(payload: GitHubWebhookEvent): Promise<{
    processed: boolean;
    action?: string;
    message: string;
  }> {
    const { action, pull_request, repository } = payload;
    
    if (!pull_request || !repository) {
      throw new Error('Pull request or repository data missing from webhook');
    }

    switch (action) {
      case GITHUB_PR_ACTIONS.OPENED:
      case GITHUB_PR_ACTIONS.REOPENED:
      case GITHUB_PR_ACTIONS.SYNCHRONIZE:
        // Trigger AI review
        await this.triggerAIReview(payload);
        return {
          processed: true,
          action: 'review_triggered',
          message: 'AI review triggered for pull request'
        };
        
      default:
        return {
          processed: false,
          message: `Unhandled pull request action: ${action}`
        };
    }
  }

  private async triggerAIReview(payload: GitHubWebhookEvent): Promise<void> {
    // This would integrate with your AI review service
    // For now, we'll just post a comment that review is starting
    
    const { pull_request, repository, installation } = payload;
    
    if (!pull_request || !repository || !installation) {
      return;
    }

    try {
      await this.createPullRequestComment(
        installation.id,
        repository.owner.login,
        repository.name,
        pull_request.number,
        REVIEW_COMMENT_TEMPLATES.REVIEW_STARTED
      );
    } catch (error) {
      console.error('Error posting review started comment:', error);
    }
  }
}