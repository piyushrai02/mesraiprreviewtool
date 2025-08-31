import { PrismaClient } from '@prisma/client';

export class RepositoryService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Get all repositories for authenticated user based on their GitHub App installations
   */
  async getUserRepositories(userId: number) {
    try {
      const repositories = await this.prisma.repository.findMany({
        where: {
          installation: {
            userId: userId,
            status: 'active'
          },
          status: 'active'
        },
        include: {
          installation: true,
          _count: {
            select: {
              reviewSessions: true
            }
          }
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });

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
        reviewCount: repo._count.reviewSessions
      }));
    } catch (error) {
      console.error('Error fetching user repositories:', error);
      throw new Error('Failed to fetch repositories');
    }
  }

  /**
   * Get repository by ID for authenticated user
   */
  async getRepositoryById(repositoryId: number, userId: number) {
    try {
      const repository = await this.prisma.repository.findFirst({
        where: {
          id: repositoryId,
          installation: {
            userId: userId,
            status: 'active'
          }
        },
        include: {
          installation: true,
          reviewSessions: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 10
          }
        }
      });

      if (!repository) {
        return null;
      }

      return {
        id: repository.id.toString(),
        githubId: repository.githubId,
        name: repository.name,
        fullName: repository.fullName,
        owner: repository.fullName.split('/')[0],
        isPrivate: repository.isPrivate,
        installationId: repository.installationId,
        language: repository.language,
        defaultBranch: repository.defaultBranch,
        isActive: repository.status === 'active',
        lastSyncAt: repository.lastSyncAt?.toISOString(),
        createdAt: repository.createdAt.toISOString(),
        updatedAt: repository.updatedAt.toISOString(),
        recentReviews: repository.reviewSessions
      };
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
      const installation = await this.prisma.installation.findFirst({
        where: {
          userId: userId,
          status: 'active'
        }
      });

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
      const [
        totalRepositories,
        totalReviews,
        activeReviews,
        completedReviews,
        recentActivity
      ] = await Promise.all([
        // Total repositories
        this.prisma.repository.count({
          where: {
            installation: {
              userId: userId,
              status: 'active'
            },
            status: 'active'
          }
        }),
        
        // Total review sessions
        this.prisma.reviewSession.count({
          where: {
            userId: userId
          }
        }),
        
        // Active reviews (pending/analyzing)
        this.prisma.reviewSession.count({
          where: {
            userId: userId,
            status: {
              in: ['pending', 'analyzing']
            }
          }
        }),
        
        // Completed reviews
        this.prisma.reviewSession.count({
          where: {
            userId: userId,
            status: 'completed'
          }
        }),
        
        // Recent activity
        this.prisma.reviewSession.findMany({
          where: {
            userId: userId
          },
          include: {
            repository: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        })
      ]);

      return {
        totalRepositories,
        activeReviews,
        completedReviews,
        totalReviews,
        recentActivity: recentActivity.map(review => ({
          id: review.id,
          type: 'review',
          title: review.title || `Review #${review.pullRequestNumber}`,
          repository: review.repository.name,
          status: review.status,
          createdAt: review.createdAt.toISOString()
        }))
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
      const reviews = await this.prisma.reviewSession.findMany({
        where: {
          userId: userId
        },
        include: {
          repository: true,
          reviewComments: {
            select: {
              type: true,
              severity: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reviews.map(review => ({
        id: review.id,
        repositoryId: review.repositoryId.toString(),
        pullRequestNumber: review.pullRequestNumber,
        githubPrId: review.githubPrId,
        status: review.status,
        title: review.title,
        author: review.author,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        completedAt: review.completedAt?.toISOString(),
        repositoryName: review.repository.name,
        repositoryFullName: review.repository.fullName,
        totalIssues: review.totalIssues,
        criticalIssues: review.criticalIssues,
        suggestions: review.suggestions,
        commentSummary: {
          issues: review.reviewComments.filter(c => c.type === 'issue').length,
          security: review.reviewComments.filter(c => c.type === 'security').length,
          suggestions: review.reviewComments.filter(c => c.type === 'suggestion').length,
          performance: review.reviewComments.filter(c => c.type === 'performance').length
        }
      }));
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  }

  /**
   * Create a new review session
   */
  async createReviewSession(data: {
    repositoryId: number;
    pullRequestNumber: number;
    githubPrId: number;
    title?: string;
    author?: string;
    userId?: number;
  }) {
    try {
      const reviewSession = await this.prisma.reviewSession.create({
        data: {
          repositoryId: data.repositoryId,
          pullRequestNumber: data.pullRequestNumber,
          githubPrId: data.githubPrId,
          title: data.title,
          author: data.author,
          userId: data.userId,
          status: 'pending'
        },
        include: {
          repository: true
        }
      });

      return reviewSession;
    } catch (error) {
      console.error('Error creating review session:', error);
      throw new Error('Failed to create review session');
    }
  }

  /**
   * Update review session status
   */
  async updateReviewSessionStatus(
    reviewSessionId: number, 
    status: string, 
    stats?: { totalIssues?: number; criticalIssues?: number; suggestions?: number }
  ) {
    try {
      const updateData: any = {
        status,
        updatedAt: new Date()
      };

      if (status === 'completed') {
        updateData.completedAt = new Date();
      }

      if (stats) {
        Object.assign(updateData, stats);
      }

      const reviewSession = await this.prisma.reviewSession.update({
        where: { id: reviewSessionId },
        data: updateData
      });

      return reviewSession;
    } catch (error) {
      console.error('Error updating review session status:', error);
      throw new Error('Failed to update review session');
    }
  }

  /**
   * Clean up database connection
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}