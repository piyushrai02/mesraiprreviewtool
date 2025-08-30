/**
 * Mock data utilities for Mesrai AI Review Tool
 * @fileoverview Provides mock data for development and testing
 */

// Local type definitions
interface Repository {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'inactive' | 'paused';
  pullRequestCount: number;
  codeHealthScore: number;
  lastReviewDate: string;
}

interface DashboardStats {
  title: string;
  value: string;
  icon: any;
}
import { 
  GitPullRequest, 
  CheckCircle, 
  HeartPulse,
  GitBranch
} from 'lucide-react';

/**
 * Mock repository data for dashboard display
 */
export const MOCK_REPOSITORIES: Repository[] = [
  {
    id: '1',
    name: 'mesrai-dev/core-platform',
    owner: 'mesrai-dev',
    status: 'active',
    pullRequestCount: 12,
    lastReviewDate: 'August 30, 2025',
    codeHealthScore: 94
  },
  {
    id: '2',
    name: 'mesrai-dev/ai-review-engine',
    owner: 'mesrai-dev',
    status: 'active',
    pullRequestCount: 8,
    lastReviewDate: 'August 29, 2025',
    codeHealthScore: 89
  },
  {
    id: '3',
    name: 'mesrai-dev/user-dashboard',
    owner: 'mesrai-dev',
    status: 'paused',
    pullRequestCount: 3,
    lastReviewDate: 'August 25, 2025',
    codeHealthScore: 76
  },
  {
    id: '4',
    name: 'mesrai-dev/api-gateway',
    owner: 'mesrai-dev',
    status: 'active',
    pullRequestCount: 15,
    lastReviewDate: 'August 30, 2025',
    codeHealthScore: 92
  },
  {
    id: '5',
    name: 'mesrai-dev/notification-service',
    owner: 'mesrai-dev',
    status: 'inactive',
    pullRequestCount: 0,
    lastReviewDate: 'August 20, 2025',
    codeHealthScore: 68
  },
  {
    id: '6',
    name: 'mesrai-dev/analytics-pipeline',
    owner: 'mesrai-dev',
    status: 'active',
    pullRequestCount: 6,
    lastReviewDate: 'August 28, 2025',
    codeHealthScore: 87
  }
];

/**
 * Mock dashboard statistics data
 */
export const MOCK_DASHBOARD_STATS: DashboardStats[] = [
  {
    title: 'Total Repositories',
    value: '24',
    icon: GitBranch
  },
  {
    title: 'Open PRs',
    value: '44',
    icon: GitPullRequest
  },
  {
    title: 'Reviews this Week',
    value: '127',
    icon: CheckCircle
  },
  {
    title: 'Avg. Code Health',
    value: '87%',
    icon: HeartPulse
  }
];