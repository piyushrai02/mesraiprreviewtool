import { 
  ConnectedRepository, 
  ReviewSession, 
  GitHubAppInstallationResponse,
  StartReviewResponse,
  ApiResponse 
} from '@shared/index';

const API_BASE_URL = '/api/v1';

class GitHubApiService {
  /**
   * Fetch connected repositories
   */
  async getRepositories(): Promise<ConnectedRepository[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/github/repositories`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<ConnectedRepository[]> = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  }

  /**
   * Get repository by ID
   */
  async getRepository(id: string): Promise<ConnectedRepository | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/github/repositories/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<ConnectedRepository> = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching repository:', error);
      throw error;
    }
  }

  /**
   * Get review sessions for repositories
   */
  async getReviewSessions(): Promise<ReviewSession[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/github/reviews`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<ReviewSession[]> = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error fetching review sessions:', error);
      throw error;
    }
  }

  /**
   * Get review session by ID
   */
  async getReviewSession(id: string): Promise<ReviewSession | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/github/review/${id}/status`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<ReviewSession> = await response.json();
      return data.data || null;
    } catch (error) {
      console.error('Error fetching review session:', error);
      throw error;
    }
  }

  /**
   * Start a new review for a pull request
   */
  async startReview(repositoryId: string, pullRequestNumber: number): Promise<ReviewSession> {
    try {
      const response = await fetch(`${API_BASE_URL}/github/review/start`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryId,
          pullRequestNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: StartReviewResponse = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to start review');
      }

      return data.reviewSession;
    } catch (error) {
      console.error('Error starting review:', error);
      throw error;
    }
  }

  /**
   * Validate repository permissions
   */
  async validatePermissions(installationId: number, owner: string, repo: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/github/validate-permissions`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          installationId,
          owner,
          repo,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<{ isValid: boolean }> = await response.json();
      return data.data?.isValid || false;
    } catch (error) {
      console.error('Error validating permissions:', error);
      return false;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<{
    totalRepositories: number;
    activeReviews: number;
    completedReviews: number;
    totalReviews: number;
    recentActivity: Array<{
      id: string;
      type: 'review_completed' | 'review_started' | 'repo_connected';
      repository: string;
      timestamp: string;
      message: string;
    }>;
  }> {
    try {
      const [repositories, reviews] = await Promise.all([
        this.getRepositories(),
        this.getReviewSessions(),
      ]);

      const activeReviews = reviews.filter(r => 
        ['queued', 'analyzing'].includes(r.status)
      ).length;

      const completedReviews = reviews.filter(r => 
        ['reviewed', 'commented'].includes(r.status)
      ).length;

      // Generate recent activity from repositories and reviews
      const recentActivity = [
        ...repositories.slice(0, 3).map(repo => ({
          id: `repo-${repo.id}`,
          type: 'repo_connected' as const,
          repository: repo.name,
          timestamp: repo.createdAt,
          message: `Repository ${repo.name} connected`,
        })),
        ...reviews.slice(0, 5).map(review => ({
          id: `review-${review.id}`,
          type: review.status === 'completed' ? 'review_completed' as const : 'review_started' as const,
          repository: repositories.find(r => r.id === review.repositoryId)?.name || 'Unknown',
          timestamp: review.completedAt || review.createdAt,
          message: review.status === 'completed' 
            ? `Review completed for PR #${review.pullRequestNumber}`
            : `Review started for PR #${review.pullRequestNumber}`,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      return {
        totalRepositories: repositories.length,
        activeReviews,
        completedReviews,
        totalReviews: reviews.length,
        recentActivity,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return fallback data
      return {
        totalRepositories: 0,
        activeReviews: 0,
        completedReviews: 0,
        totalReviews: 0,
        recentActivity: [],
      };
    }
  }

  /**
   * Trigger manual review (for testing)
   */
  async triggerManualReview(
    installationId: number,
    owner: string,
    repo: string,
    pullNumber: number
  ): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/github/review/manual`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          installationId,
          owner,
          repo,
          pullNumber,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error triggering manual review:', error);
      throw error;
    }
  }
}

export const githubApiService = new GitHubApiService();