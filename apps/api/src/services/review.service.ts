import { PrismaClient } from '@prisma/client';

export class ReviewService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
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
          repository: {
            include: {
              installation: true
            }
          }
        }
      });

      return reviewSession;
    } catch (error) {
      console.error('Error creating review session:', error);
      throw new Error('Failed to create review session');
    }
  }

  /**
   * Get review session by ID
   */
  async getReviewSession(reviewSessionId: number) {
    try {
      const reviewSession = await this.prisma.reviewSession.findUnique({
        where: { id: reviewSessionId },
        include: {
          repository: true,
          reviewComments: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });

      return reviewSession;
    } catch (error) {
      console.error('Error fetching review session:', error);
      throw new Error('Failed to fetch review session');
    }
  }

  /**
   * Update review session status and stats
   */
  async updateReviewSession(
    reviewSessionId: number, 
    updates: {
      status?: string;
      totalIssues?: number;
      criticalIssues?: number;
      suggestions?: number;
    }
  ) {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: new Date()
      };

      if (updates.status === 'completed') {
        updateData.completedAt = new Date();
      }

      const reviewSession = await this.prisma.reviewSession.update({
        where: { id: reviewSessionId },
        data: updateData
      });

      return reviewSession;
    } catch (error) {
      console.error('Error updating review session:', error);
      throw new Error('Failed to update review session');
    }
  }

  /**
   * Add review comment to a session
   */
  async addReviewComment(data: {
    reviewSessionId: number;
    type: string;
    severity: string;
    title: string;
    description: string;
    filePath?: string;
    lineNumber?: number;
    suggestion?: string;
    isCommittable?: boolean;
  }) {
    try {
      const reviewComment = await this.prisma.reviewComment.create({
        data: {
          reviewSessionId: data.reviewSessionId,
          type: data.type,
          severity: data.severity,
          title: data.title,
          description: data.description,
          filePath: data.filePath,
          lineNumber: data.lineNumber,
          suggestion: data.suggestion,
          isCommittable: data.isCommittable || false,
          status: 'pending'
        }
      });

      return reviewComment;
    } catch (error) {
      console.error('Error adding review comment:', error);
      throw new Error('Failed to add review comment');
    }
  }

  /**
   * Get review comments for a session
   */
  async getReviewComments(reviewSessionId: number) {
    try {
      const comments = await this.prisma.reviewComment.findMany({
        where: { reviewSessionId },
        orderBy: [
          { filePath: 'asc' },
          { lineNumber: 'asc' },
          { createdAt: 'asc' }
        ]
      });

      return comments;
    } catch (error) {
      console.error('Error fetching review comments:', error);
      throw new Error('Failed to fetch review comments');
    }
  }

  /**
   * Update comment status (accepted, rejected, applied)
   */
  async updateCommentStatus(commentId: number, status: string) {
    try {
      const comment = await this.prisma.reviewComment.update({
        where: { id: commentId },
        data: { 
          status,
          updatedAt: new Date()
        }
      });

      return comment;
    } catch (error) {
      console.error('Error updating comment status:', error);
      throw new Error('Failed to update comment status');
    }
  }

  /**
   * Get review statistics for a repository
   */
  async getRepositoryReviewStats(repositoryId: number) {
    try {
      const [
        totalReviews,
        pendingReviews,
        completedReviews,
        totalIssues,
        criticalIssues
      ] = await Promise.all([
        this.prisma.reviewSession.count({
          where: { repositoryId }
        }),
        this.prisma.reviewSession.count({
          where: { 
            repositoryId,
            status: { in: ['pending', 'analyzing'] }
          }
        }),
        this.prisma.reviewSession.count({
          where: { 
            repositoryId,
            status: 'completed'
          }
        }),
        this.prisma.reviewSession.aggregate({
          where: { repositoryId },
          _sum: { totalIssues: true }
        }),
        this.prisma.reviewSession.aggregate({
          where: { repositoryId },
          _sum: { criticalIssues: true }
        })
      ]);

      return {
        totalReviews,
        pendingReviews,
        completedReviews,
        totalIssues: totalIssues._sum.totalIssues || 0,
        criticalIssues: criticalIssues._sum.criticalIssues || 0
      };
    } catch (error) {
      console.error('Error fetching repository review stats:', error);
      throw new Error('Failed to fetch repository review statistics');
    }
  }

  /**
   * Clean up database connection
   */
  async disconnect() {
    await this.prisma.$disconnect();
  }
}