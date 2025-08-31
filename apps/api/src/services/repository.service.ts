import { PrismaClient } from '@prisma/client';

export class RepositoryService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Check if user has any active GitHub App installations
   */
  async hasActiveInstallations(userId: number): Promise<boolean> {
    try {
      // Query installations table directly
      const result = await this.prisma.$queryRaw<Array<{count: bigint}>>`
        SELECT COUNT(*) as count 
        FROM installations 
        WHERE "userId" = ${userId} AND status = 'active'
      `;
      
      const count = Number(result[0]?.count || 0);
      console.log(`Checking installations for user ${userId}: found ${count} active installations`);
      return count > 0;
    } catch (error) {
      console.error('Error checking installations:', error);
      return false;
    }
  }

  /**
   * Get all repositories for authenticated user based on their GitHub App installations
   */
  async getUserRepositories(userId: number) {
    try {
      const repositories = await this.prisma.$queryRaw<Array<{
        id: number;
        githubId: number;
        name: string;
        fullName: string;
        isPrivate: boolean;
        language: string | null;
        defaultBranch: string;
        status: string;
        lastSyncAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
        installationId: number;
      }>>`
        SELECT r.* 
        FROM repositories r
        INNER JOIN installations i ON r."installationId" = i.id
        WHERE i."userId" = ${userId} AND i.status = 'active' AND r.status = 'active'
        ORDER BY r."updatedAt" DESC
      `;

      return repositories.map(repo => ({
        id: repo.id.toString(),
        githubId: repo.githubId,
        name: repo.name,
        fullName: repo.fullName,
        owner: repo.fullName.split('/')[0],
        isPrivate: repo.isPrivate,
        installationId: repo.installationId,
        language: repo.language,
        defaultBranch: repo.defaultBranch,
        isActive: repo.status === 'active',
        lastSyncAt: repo.lastSyncAt?.toISOString(),
        createdAt: repo.createdAt.toISOString(),
        updatedAt: repo.updatedAt.toISOString(),
        reviewCount: 0
      }));
    } catch (error) {
      console.error('Error fetching user repositories:', error);
      throw new Error('Failed to fetch repositories');
    }
  }

  /**
   * Get all review sessions for authenticated user
   */
  async getUserReviews(userId: number) {
    try {
      const reviews = await this.prisma.$queryRaw<Array<{
        id: number;
        repositoryId: number;
        pullRequestNumber: number;
        githubPrId: number;
        status: string;
        title: string | null;
        author: string | null;
        createdAt: Date;
        updatedAt: Date;
        completedAt: Date | null;
        repositoryName: string;
        repositoryFullName: string;
      }>>`
        SELECT rs.*, r.name as "repositoryName", r."fullName" as "repositoryFullName"
        FROM review_sessions rs
        INNER JOIN repositories r ON rs."repositoryId" = r.id
        INNER JOIN installations i ON r."installationId" = i.id
        WHERE i."userId" = ${userId} AND i.status = 'active'
        ORDER BY rs."createdAt" DESC
        LIMIT 50
      `;

      return reviews.map(review => ({
        id: review.id,
        repositoryId: review.repositoryId.toString(),
        pullRequestNumber: review.pullRequestNumber,
        githubPrId: review.githubPrId,
        status: review.status,
        title: review.title,
        author: review.author,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        completedAt: review.completedAt,
        repositoryName: review.repositoryName,
        repositoryFullName: review.repositoryFullName
      }));
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  }

  /**
   * Get repository statistics for dashboard
   */
  async getRepositoryStats(userId: number) {
    try {
      const stats = await this.prisma.$queryRaw<Array<{
        totalRepositories: bigint;
        totalInstallations: bigint;
        activeReviews: bigint;
        completedReviews: bigint;
      }>>`
        SELECT 
          COUNT(DISTINCT r.id) as "totalRepositories",
          COUNT(DISTINCT i.id) as "totalInstallations",
          COUNT(DISTINCT CASE WHEN rs.status IN ('queued', 'analyzing') THEN rs.id END) as "activeReviews",
          COUNT(DISTINCT CASE WHEN rs.status = 'completed' THEN rs.id END) as "completedReviews"
        FROM installations i
        LEFT JOIN repositories r ON r."installationId" = i.id AND r.status = 'active'
        LEFT JOIN review_sessions rs ON rs."repositoryId" = r.id
        WHERE i."userId" = ${userId} AND i.status = 'active'
      `;

      const result = stats[0] || {
        totalRepositories: BigInt(0),
        totalInstallations: BigInt(0),
        activeReviews: BigInt(0),
        completedReviews: BigInt(0)
      };

      return {
        totalRepositories: Number(result.totalRepositories),
        totalInstallations: Number(result.totalInstallations),
        activeReviews: Number(result.activeReviews),
        completedReviews: Number(result.completedReviews)
      };
    } catch (error) {
      console.error('Error fetching repository stats:', error);
      return {
        totalRepositories: 0,
        totalInstallations: 0,
        activeReviews: 0,
        completedReviews: 0
      };
    }
  }

  /**
   * Create new installation record when GitHub App is installed
   */
  async createInstallation(data: {
    githubInstallationId: number;
    githubAccountId: number;
    githubAccountType: string;
    userId: number;
    repositories?: Array<{
      githubId: number;
      name: string;
      fullName: string;
      isPrivate: boolean;
      language?: string;
      defaultBranch?: string;
    }>;
  }) {
    try {
      console.log('Creating installation for user:', data.userId);
      console.log('Installation data:', data);
      
      // Insert installation record
      const installation = await this.prisma.$queryRaw<Array<{id: number}>>`
        INSERT INTO installations ("githubInstallationId", "githubAccountId", "githubAccountType", "userId", status, "createdAt", "updatedAt")
        VALUES (${data.githubInstallationId}, ${data.githubAccountId}, ${data.githubAccountType}, ${data.userId}, 'active', NOW(), NOW())
        ON CONFLICT ("githubInstallationId") 
        DO UPDATE SET 
          "githubAccountId" = ${data.githubAccountId},
          "githubAccountType" = ${data.githubAccountType},
          "userId" = ${data.userId},
          status = 'active',
          "updatedAt" = NOW()
        RETURNING id
      `;

      const installationId = installation[0]?.id;
      console.log('Installation created/updated with ID:', installationId);

      // Create repositories if provided
      if (data.repositories && data.repositories.length > 0) {
        for (const repo of data.repositories) {
          await this.createRepository({
            ...repo,
            installationId
          });
        }
      }

      return {
        id: installationId,
        userId: data.userId,
        status: 'active',
        repositories: data.repositories || []
      };
    } catch (error) {
      console.error('Error creating installation:', error);
      throw new Error('Failed to create installation');
    }
  }

  /**
   * Create new repository record
   */
  async createRepository(data: {
    githubId: number;
    name: string;
    fullName: string;
    isPrivate: boolean;
    language?: string;
    defaultBranch?: string;
    installationId: number;
  }) {
    try {
      const repository = await this.prisma.$queryRaw<Array<{id: number}>>`
        INSERT INTO repositories ("githubId", name, "fullName", "isPrivate", language, "defaultBranch", "installationId", status, "createdAt", "updatedAt")
        VALUES (${data.githubId}, ${data.name}, ${data.fullName}, ${data.isPrivate}, ${data.language || null}, ${data.defaultBranch || 'main'}, ${data.installationId}, 'active', NOW(), NOW())
        ON CONFLICT ("githubId") 
        DO UPDATE SET 
          name = ${data.name},
          "fullName" = ${data.fullName},
          "isPrivate" = ${data.isPrivate},
          language = ${data.language || null},
          "defaultBranch" = ${data.defaultBranch || 'main'},
          "installationId" = ${data.installationId},
          status = 'active',
          "lastSyncAt" = NOW(),
          "updatedAt" = NOW()
        RETURNING id
      `;

      return repository[0];
    } catch (error) {
      console.error('Error creating repository:', error);
      throw new Error('Failed to create repository');
    }
  }

  /**
   * Sync repositories for an installation
   */
  async syncRepositoriesForInstallation(installationId: number, repositoriesData: any[]) {
    try {
      console.log('Syncing repositories for installation:', installationId);
      console.log('Repository data:', repositoriesData);
      
      // Mark all existing repositories as inactive first
      await this.prisma.$executeRaw`
        UPDATE repositories 
        SET status = 'inactive', "updatedAt" = NOW()
        WHERE "installationId" = ${installationId}
      `;

      // Then create or reactivate repositories
      for (const repoData of repositoriesData) {
        await this.createRepository({
          ...repoData,
          installationId
        });
      }

      return true;
    } catch (error) {
      console.error('Error syncing repositories:', error);
      throw new Error('Failed to sync repositories');
    }
  }
}