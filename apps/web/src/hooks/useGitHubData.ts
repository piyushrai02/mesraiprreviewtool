import { useState, useEffect } from 'react';
import { githubApiService } from '@/lib/services/github.service';
import { ConnectedRepository, ReviewSession } from '@shared/index';

interface GitHubDataState {
  repositories: ConnectedRepository[];
  reviews: ReviewSession[];
  dashboardStats: {
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
  };
  loading: boolean;
  error: string | null;
}

export function useGitHubData() {
  const [state, setState] = useState<GitHubDataState>({
    repositories: [],
    reviews: [],
    dashboardStats: {
      totalRepositories: 0,
      activeReviews: 0,
      completedReviews: 0,
      totalReviews: 0,
      recentActivity: [],
    },
    loading: true,
    error: null,
  });

  const fetchData = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch data directly from API endpoints
      const [repositoriesResponse, reviewsResponse, dashboardStatsResponse] = await Promise.all([
        fetch('/api/v1/github/repositories').then(r => r.json()),
        fetch('/api/v1/github/reviews').then(r => r.json()),
        fetch('/api/v1/github/dashboard-stats').then(r => r.json()),
      ]);

      setState({
        repositories: repositoriesResponse.data || [],
        reviews: reviewsResponse.data || [],
        dashboardStats: dashboardStatsResponse.data || {
          totalRepositories: 0,
          activeReviews: 0,
          completedReviews: 0,
          totalReviews: 0,
          recentActivity: [],
        },
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch GitHub data',
      }));
    }
  };

  const refetch = () => {
    fetchData();
  };

  const startReview = async (repositoryId: string, pullRequestNumber: number) => {
    try {
      const newReview = await githubApiService.startReview(repositoryId, pullRequestNumber);
      setState(prev => ({
        ...prev,
        reviews: [newReview, ...prev.reviews],
      }));
      
      // Refetch dashboard stats to update counters
      const dashboardResponse = await fetch('/api/v1/github/dashboard-stats').then(r => r.json());
      setState(prev => ({
        ...prev,
        dashboardStats: dashboardResponse.data || prev.dashboardStats,
      }));

      return newReview;
    } catch (error) {
      console.error('Error starting review:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    ...state,
    refetch,
    startReview,
  };
}

export function useRepository(id: string) {
  const [repository, setRepository] = useState<ConnectedRepository | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchRepository = async () => {
      try {
        setLoading(true);
        setError(null);
        const repo = await githubApiService.getRepository(id);
        setRepository(repo);
      } catch (err) {
        console.error('Error fetching repository:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch repository');
      } finally {
        setLoading(false);
      }
    };

    fetchRepository();
  }, [id]);

  return { repository, loading, error };
}

export function useReviewSession(id: string) {
  const [reviewSession, setReviewSession] = useState<ReviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchReviewSession = async () => {
      try {
        setLoading(true);
        setError(null);
        const session = await githubApiService.getReviewSession(id);
        setReviewSession(session);
      } catch (err) {
        console.error('Error fetching review session:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch review session');
      } finally {
        setLoading(false);
      }
    };

    fetchReviewSession();
  }, [id]);

  return { reviewSession, loading, error };
}