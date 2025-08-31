import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';
import { encrypt, decrypt, createLogger } from '@mesrai/config';
import { 
  installations, 
  repositories, 
  users,
  webhookEvents,
  type Installation,
  type Repository,
  type NewInstallation,
  type NewRepository,
  type NewWebhookEvent
} from '../../../../shared/schema';

const logger = createLogger({ service: 'installation' });

export class InstallationService {
  private db;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    const client = postgres(databaseUrl);
    this.db = drizzle(client);
  }

  /**
   * Create or update an installation
   */
  async upsertInstallation(installationData: {
    githubInstallationId: number;
    githubAccountId: number;
    githubAccountType: string;
    accessToken?: string;
    userId?: number;
  }): Promise<Installation> {
    try {
      logger.info('Upserting installation', {
        githubInstallationId: installationData.githubInstallationId,
        githubAccountId: installationData.githubAccountId,
        githubAccountType: installationData.githubAccountType,
      });

      // Encrypt access token if provided
      const encryptedAccessToken = installationData.accessToken 
        ? encrypt(installationData.accessToken)
        : undefined;

      const newInstallation: NewInstallation = {
        githubInstallationId: installationData.githubInstallationId,
        githubAccountId: installationData.githubAccountId,
        githubAccountType: installationData.githubAccountType,
        status: 'active',
        encryptedAccessToken,
        userId: installationData.userId || null,
      };

      // Try to update existing installation first
      const existingInstallation = await this.db
        .select()
        .from(installations)
        .where(eq(installations.githubInstallationId, installationData.githubInstallationId))
        .limit(1);

      let installation: Installation;

      if (existingInstallation.length > 0) {
        // Update existing installation
        const [updatedInstallation] = await this.db
          .update(installations)
          .set({
            ...newInstallation,
            updatedAt: new Date(),
          })
          .where(eq(installations.githubInstallationId, installationData.githubInstallationId))
          .returning();

        installation = updatedInstallation;
        logger.info('Installation updated', { 
          installationId: installation.id,
          githubInstallationId: installation.githubInstallationId,
        });
      } else {
        // Create new installation
        const [createdInstallation] = await this.db
          .insert(installations)
          .values(newInstallation)
          .returning();

        installation = createdInstallation;
        logger.info('Installation created', { 
          installationId: installation.id,
          githubInstallationId: installation.githubInstallationId,
        });
      }

      return installation;
    } catch (error) {
      logger.error('Failed to upsert installation', {
        githubInstallationId: installationData.githubInstallationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get installation by GitHub installation ID
   */
  async getInstallationByGitHubId(githubInstallationId: number): Promise<Installation | null> {
    try {
      const [installation] = await this.db
        .select()
        .from(installations)
        .where(eq(installations.githubInstallationId, githubInstallationId))
        .limit(1);

      return installation || null;
    } catch (error) {
      logger.error('Failed to get installation', {
        githubInstallationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Get decrypted access token for installation
   */
  async getInstallationAccessToken(installationId: number): Promise<string | null> {
    try {
      const [installation] = await this.db
        .select()
        .from(installations)
        .where(eq(installations.id, installationId))
        .limit(1);

      if (!installation?.encryptedAccessToken) {
        return null;
      }

      return decrypt(installation.encryptedAccessToken);
    } catch (error) {
      logger.error('Failed to get installation access token', {
        installationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Upsert repositories for an installation
   */
  async upsertRepositories(installationId: number, repositoriesData: Array<{
    githubId: number;
    name: string;
    fullName: string;
    isPrivate: boolean;
    language?: string;
    defaultBranch?: string;
  }>): Promise<Repository[]> {
    try {
      logger.info('Upserting repositories', {
        installationId,
        repositoryCount: repositoriesData.length,
      });

      const upsertedRepositories: Repository[] = [];

      for (const repoData of repositoriesData) {
        const newRepository: NewRepository = {
          githubId: repoData.githubId,
          name: repoData.name,
          fullName: repoData.fullName,
          isPrivate: repoData.isPrivate,
          language: repoData.language || null,
          defaultBranch: repoData.defaultBranch || 'main',
          status: 'active', // Mark as active once synced
          lastSyncAt: new Date(),
          installationId,
        };

        // Check if repository exists
        const existingRepo = await this.db
          .select()
          .from(repositories)
          .where(eq(repositories.githubId, repoData.githubId))
          .limit(1);

        let repository: Repository;

        if (existingRepo.length > 0) {
          // Update existing repository
          const [updatedRepo] = await this.db
            .update(repositories)
            .set({
              ...newRepository,
              updatedAt: new Date(),
            })
            .where(eq(repositories.githubId, repoData.githubId))
            .returning();

          repository = updatedRepo;
        } else {
          // Create new repository
          const [createdRepo] = await this.db
            .insert(repositories)
            .values(newRepository)
            .returning();

          repository = createdRepo;
        }

        upsertedRepositories.push(repository);
      }

      logger.info('Repositories upserted successfully', {
        installationId,
        repositoryCount: upsertedRepositories.length,
      });

      return upsertedRepositories;
    } catch (error) {
      logger.error('Failed to upsert repositories', {
        installationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Mark installation as deleted/suspended
   */
  async deactivateInstallation(githubInstallationId: number): Promise<void> {
    try {
      logger.info('Deactivating installation', { githubInstallationId });

      await this.db
        .update(installations)
        .set({
          status: 'suspended',
          updatedAt: new Date(),
        })
        .where(eq(installations.githubInstallationId, githubInstallationId));

      // Also mark all repositories as inactive
      const installation = await this.getInstallationByGitHubId(githubInstallationId);
      if (installation) {
        await this.db
          .update(repositories)
          .set({
            status: 'suspended',
            updatedAt: new Date(),
          })
          .where(eq(repositories.installationId, installation.id));
      }

      logger.info('Installation deactivated', { githubInstallationId });
    } catch (error) {
      logger.error('Failed to deactivate installation', {
        githubInstallationId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Record webhook event for deduplication
   */
  async recordWebhookEvent(eventData: {
    githubDeliveryId: string;
    eventType: string;
    action?: string;
    installationId?: number;
    repositoryId?: number;
    payload: any;
  }): Promise<boolean> {
    try {
      const newWebhookEvent: NewWebhookEvent = {
        githubDeliveryId: eventData.githubDeliveryId,
        eventType: eventData.eventType,
        action: eventData.action || null,
        installationId: eventData.installationId || null,
        repositoryId: eventData.repositoryId || null,
        processed: false,
        payload: JSON.stringify(eventData.payload),
      };

      // Try to insert the webhook event
      // If it already exists (duplicate delivery), this will fail due to unique constraint
      try {
        await this.db
          .insert(webhookEvents)
          .values(newWebhookEvent);

        logger.debug('Webhook event recorded', {
          githubDeliveryId: eventData.githubDeliveryId,
          eventType: eventData.eventType,
        });

        return true; // Event is new, should be processed
      } catch (insertError) {
        // Check if it's a duplicate key error
        if (insertError instanceof Error && insertError.message.includes('duplicate key')) {
          logger.debug('Webhook event already exists, skipping', {
            githubDeliveryId: eventData.githubDeliveryId,
            eventType: eventData.eventType,
          });
          return false; // Event already exists, skip processing
        }
        throw insertError; // Re-throw other errors
      }
    } catch (error) {
      logger.error('Failed to record webhook event', {
        githubDeliveryId: eventData.githubDeliveryId,
        eventType: eventData.eventType,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Mark webhook event as processed
   */
  async markWebhookEventProcessed(githubDeliveryId: string): Promise<void> {
    try {
      await this.db
        .update(webhookEvents)
        .set({
          processed: true,
          processedAt: new Date(),
        })
        .where(eq(webhookEvents.githubDeliveryId, githubDeliveryId));

      logger.debug('Webhook event marked as processed', { githubDeliveryId });
    } catch (error) {
      logger.error('Failed to mark webhook event as processed', {
        githubDeliveryId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}