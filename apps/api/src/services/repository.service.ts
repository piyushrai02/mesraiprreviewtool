import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and, desc } from 'drizzle-orm';
import { 
  installations, 
  repositories, 
  users,
  reviewSessions,
  type Repository,
  type Installation,
  type User
} from '../../../../shared/schema.js';

export class RepositoryService {
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
   * Get all repositories for authenticated user based on their GitHub App installations
   */
  async getUserRepositories(userId: number): Promise<Repository[]> {
    try {
      // Get user's GitHub installations and their repositories
      const userRepositories = await this.db
        .select({
          id: repositories.id,
          githubId: repositories.githubId,
          name: repositories.name,
          fullName: repositories.fullName,
          isPrivate: repositories.isPrivate,
          language: repositories.language,
          defaultBranch: repositories.defaultBranch,
          status: repositories.status,
          lastSyncAt: repositories.lastSyncAt,
          installationId: repositories.installationId,
          createdAt: repositories.createdAt,
          updatedAt: repositories.updatedAt,
        })
        .from(repositories)
        .innerJoin(installations, eq(repositories.installationId, installations.id))
        .where(
          and(
            eq(installations.userId, userId),
            eq(installations.status, 'active'),
            eq(repositories.status, 'active')
          )
        )
        .orderBy(desc(repositories.updatedAt));

      return userRepositories;
    } catch (error) {
      console.error('Error fetching user repositories:', error);
      throw new Error('Failed to fetch repositories');
    }
  }

  /**
   * Get repository by ID for authenticated user
   */
  async getRepositoryById(repositoryId: number, userId: number): Promise<Repository | null> {
    try {
      const [repository] = await this.db
        .select()
        .from(repositories)
        .innerJoin(installations, eq(repositories.installationId, installations.id))
        .where(
          and(
            eq(repositories.id, repositoryId),
            eq(installations.userId, userId),
            eq(installations.status, 'active')
          )
        )
        .limit(1);

      return repository?.repositories || null;
    } catch (error) {
      console.error('Error fetching repository by ID:', error);
      throw new Error('Failed to fetch repository');
    }
  }

  /**
   * Check if user has any active GitHub App installations
   */
  async hasActiveInstallations(userId: number): Promise<boolean> {
    try {
      const [installation] = await this.db
        .select({ id: installations.id })
        .from(installations)
        .where(
          and(
            eq(installations.userId, userId),
            eq(installations.status, 'active')
          )
        )
        .limit(1);

      return !!installation;
    } catch (error) {
      console.error('Error checking user installations:', error);
      return false;
    }
  }

  /**
   * Get repository statistics for dashboard
   */
  async getRepositoryStats(userId: number) {
    try {
      // Get repositories count
      const repositories = await this.getUserRepositories(userId);
      const totalRepositories = repositories.length;

      // Get review sessions statistics
      const userInstallations = await this.db
        .select({ id: installations.id })
        .from(installations)
        .where(
          and(
            eq(installations.userId, userId),
            eq(installations.status, 'active')
          )
        );

      if (userInstallations.length === 0) {
        return {
          totalRepositories: 0,
          activeReviews: 0,
          completedReviews: 0,
          totalReviews: 0,
          recentActivity: [],
        };
      }

      const installationIds = userInstallations.map(i => i.id);

      // Get review sessions for user's repositories
      const userRepositoryIds = repositories.map(r => r.id);
      
      let allReviews: any[] = [];
      if (userRepositoryIds.length > 0) {
        allReviews = await this.db
          .select({
            id: reviewSessions.id,
            status: reviewSessions.status,
            title: reviewSessions.title,
            author: reviewSessions.author,
            createdAt: reviewSessions.createdAt,
            completedAt: reviewSessions.completedAt,
            repositoryId: reviewSessions.repositoryId,
            pullRequestNumber: reviewSessions.pullRequestNumber,
            repositoryName: repositories.name,
          })
          .from(reviewSessions)
          .innerJoin(repositories, eq(reviewSessions.repositoryId, repositories.id))
          .where(eq(repositories.installationId, installationIds[0])) // Simplified for demo
          .orderBy(desc(reviewSessions.createdAt))
          .limit(50);
      }

      const activeReviews = allReviews.filter(r => 
        ['queued', 'analyzing'].includes(r.status)
      ).length;

      const completedReviews = allReviews.filter(r => 
        ['reviewed', 'commented'].includes(r.status)
      ).length;

      // Generate recent activity from repositories and reviews
      const recentActivity = [
        ...repositories.slice(0, 3).map(repo => ({
          id: `repo-${repo.id}`,
          type: 'repo_connected' as const,
          repository: repo.name,
          timestamp: repo.createdAt?.toISOString() || new Date().toISOString(),
          message: `Repository ${repo.name} connected to Mesrai AI`,
        })),
        ...allReviews.slice(0, 7).map(review => ({
          id: `review-${review.id}`,
          type: ['reviewed', 'commented'].includes(review.status) 
            ? 'review_completed' as const 
            : 'review_started' as const,
          repository: review.repositoryName,
          timestamp: review.completedAt?.toISOString() || review.createdAt?.toISOString() || new Date().toISOString(),
          message: ['reviewed', 'commented'].includes(review.status)
            ? `AI review completed for PR #${review.pullRequestNumber}`
            : `AI review started for PR #${review.pullRequestNumber}`,
        })),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      return {
        totalRepositories,
        activeReviews,
        completedReviews,
        totalReviews: allReviews.length,
        recentActivity,
      };
    } catch (error) {
      console.error('Error fetching repository stats:', error);
      throw new Error('Failed to fetch repository statistics');
    }
  }

  /**
   * Get all review sessions for user's repositories
   */
  async getUserReviews(userId: number) {
    try {
      const userRepositories = await this.getUserRepositories(userId);
      
      if (userRepositories.length === 0) {
        return [];
      }

      const repositoryIds = userRepositories.map(r => r.id);

      const reviews = await this.db
        .select({
          id: reviewSessions.id,
          repositoryId: reviewSessions.repositoryId,
          pullRequestNumber: reviewSessions.pullRequestNumber,
          githubPrId: reviewSessions.githubPrId,
          status: reviewSessions.status,
          title: reviewSessions.title,
          author: reviewSessions.author,
          createdAt: reviewSessions.createdAt,
          updatedAt: reviewSessions.updatedAt,
          completedAt: reviewSessions.completedAt,
          repositoryName: repositories.name,
          repositoryFullName: repositories.fullName,
        })
        .from(reviewSessions)
        .innerJoin(repositories, eq(reviewSessions.repositoryId, repositories.id))
        .where(eq(repositories.installationId, userRepositories[0].installationId))
        .orderBy(desc(reviewSessions.createdAt));

      return reviews;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  }
}