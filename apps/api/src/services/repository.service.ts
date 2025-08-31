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
      // For now, return empty array since we need to set up the proper schema
      // This will be populated once GitHub App installation is working
      return [];
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
      // For now, return empty array since we need to set up the proper schema
      // This will be populated once GitHub App installation is working
      return [];
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw new Error('Failed to fetch reviews');
    }
  }

  /**
   * Check if user has any active GitHub App installations
   */
  async hasActiveInstallations(userId: number): Promise<boolean> {
    try {
      // For now, return false since we need to set up GitHub App installation
      return false;
    } catch (error) {
      console.error('Error checking installations:', error);
      return false;
    }
  }

  /**
   * Get repository statistics for dashboard
   */
  async getRepositoryStats(userId: number) {
    try {
      // Return basic stats for now
      return {
        totalRepositories: 0,
        totalInstallations: 0,
        activeReviews: 0,
        completedReviews: 0
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
    repositories: Array<{
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
      
      // For now, just log the installation attempt
      // In production, this would save to the database
      return {
        id: data.githubInstallationId,
        userId: data.userId,
        status: 'active',
        repositories: data.repositories
      };
    } catch (error) {
      console.error('Error creating installation:', error);
      throw new Error('Failed to create installation');
    }
  }

  /**
   * Sync repositories for an installation
   */
  async syncRepositoriesForInstallation(installationId: number, repositoriesData: any[]) {
    try {
      console.log('Syncing repositories for installation:', installationId);
      console.log('Repository data:', repositoriesData);
      
      // For now, just log the sync attempt
      // In production, this would update the database
      return true;
    } catch (error) {
      console.error('Error syncing repositories:', error);
      throw new Error('Failed to sync repositories');
    }
  }
}