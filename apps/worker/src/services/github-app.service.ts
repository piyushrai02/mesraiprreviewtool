import { App } from '@octokit/app';
import { Octokit } from '@octokit/rest';
import { decrypt } from '@mesrai/config';
import { createLogger } from '@mesrai/config';
import type { Installation } from '../../../../shared/schema';

const logger = createLogger({ service: 'github-app' });

export class GitHubAppService {
  private app: App;

  constructor() {
    const appId = process.env.GITHUB_APP_ID;
    const privateKey = process.env.GITHUB_PRIVATE_KEY;

    if (!appId || !privateKey) {
      throw new Error('GITHUB_APP_ID and GITHUB_PRIVATE_KEY environment variables are required');
    }

    this.app = new App({
      appId: parseInt(appId),
      privateKey: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
    });

    logger.info('GitHub App service initialized', { appId });
  }

  /**
   * Get an authenticated Octokit instance for a specific installation
   */
  async getInstallationOctokit(installationId: number): Promise<Octokit> {
    try {
      logger.debug('Creating installation Octokit', { installationId });
      
      const octokit = await this.app.getInstallationOctokit(installationId);
      
      logger.debug('Installation Octokit created successfully', { installationId });
      return octokit;
    } catch (error) {
      logger.error('Failed to create installation Octokit', {
        installationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(`Failed to authenticate GitHub App for installation ${installationId}`);
    }
  }

  /**
   * Get installation access token (for manual API calls)
   */
  async getInstallationAccessToken(installationId: number): Promise<string> {
    try {
      logger.debug('Getting installation access token', { installationId });
      
      const { token } = await this.app.getInstallationAccessToken({
        installationId,
      });
      
      logger.debug('Installation access token obtained', { installationId });
      return token;
    } catch (error) {
      logger.error('Failed to get installation access token', {
        installationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new Error(`Failed to get access token for installation ${installationId}`);
    }
  }

  /**
   * Verify webhook payload signature
   */
  verifyWebhookPayload(payload: string, signature: string): boolean {
    try {
      const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET;
      if (!webhookSecret) {
        logger.error('GITHUB_WEBHOOK_SECRET not configured');
        return false;
      }

      return this.app.webhooks.verify(payload, signature);
    } catch (error) {
      logger.error('Webhook verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return false;
    }
  }

  /**
   * Get repositories for an installation
   */
  async getInstallationRepositories(installationId: number) {
    try {
      const octokit = await this.getInstallationOctokit(installationId);
      
      logger.debug('Fetching installation repositories', { installationId });
      
      const response = await octokit.rest.apps.listReposAccessibleToInstallation({
        per_page: 100,
      });

      logger.info('Fetched installation repositories', {
        installationId,
        repositoryCount: response.data.repositories.length,
      });

      return response.data.repositories;
    } catch (error) {
      logger.error('Failed to fetch installation repositories', {
        installationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get repository details
   */
  async getRepository(installationId: number, owner: string, repo: string) {
    try {
      const octokit = await this.getInstallationOctokit(installationId);
      
      logger.debug('Fetching repository details', { installationId, owner, repo });
      
      const response = await octokit.rest.repos.get({
        owner,
        repo,
      });

      logger.debug('Repository details fetched', { installationId, owner, repo });
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch repository details', {
        installationId,
        owner,
        repo,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get pull requests for a repository
   */
  async getPullRequests(installationId: number, owner: string, repo: string, state: 'open' | 'closed' | 'all' = 'open') {
    try {
      const octokit = await this.getInstallationOctokit(installationId);
      
      logger.debug('Fetching pull requests', { installationId, owner, repo, state });
      
      const response = await octokit.rest.pulls.list({
        owner,
        repo,
        state,
        per_page: 50,
        sort: 'updated',
        direction: 'desc',
      });

      logger.debug('Pull requests fetched', {
        installationId,
        owner,
        repo,
        state,
        pullRequestCount: response.data.length,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to fetch pull requests', {
        installationId,
        owner,
        repo,
        state,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}