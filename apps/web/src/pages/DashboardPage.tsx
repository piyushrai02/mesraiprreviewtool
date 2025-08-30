import { 
  GitBranch, 
  Github, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Activity,
  Settings,
  ExternalLink,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGitHubData } from '@/hooks/useGitHubData';
import { GitHubInstallButton } from '@/components/features/github/GitHubInstallButton';

export default function DashboardPage() {
  const { 
    repositories, 
    reviews, 
    dashboardStats, 
    loading, 
    error,
    refetch 
  } = useGitHubData();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reviewed':
      case 'commented':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'analyzing':
      case 'queued':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed':
      case 'commented':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'analyzing':
      case 'queued':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      case 'error':
        return 'bg-red-500/10 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6" data-testid="dashboard-loading">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6" data-testid="dashboard-error">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data: {error}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              className="ml-4"
              data-testid="button-retry"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="dashboard-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="page-title">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2" data-testid="page-description">
            Monitor your GitHub repositories and AI-powered code reviews
          </p>
        </div>
        {repositories.length === 0 && (
          <GitHubInstallButton data-testid="install-github-app" />
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="stat-repositories">
          <CardContent className="p-6">
            <div className="flex items-center">
              <GitBranch className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Connected Repositories
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-repos-count">
                  {dashboardStats.totalRepositories}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-active-reviews">
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Reviews
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-active-count">
                  {dashboardStats.activeReviews}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-completed-reviews">
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Completed Reviews
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-completed-count">
                  {dashboardStats.completedReviews}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card data-testid="stat-total-reviews">
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Reviews
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="stat-total-count">
                  {dashboardStats.totalReviews}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {repositories.length === 0 ? (
        // Empty State
        <div className="text-center py-12" data-testid="empty-state">
          <Github className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Welcome to Mesrai AI Review Tool
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Connect your GitHub repositories to start getting AI-powered code reviews on every pull request.
          </p>
          <GitHubInstallButton size="lg" data-testid="install-github-large" />
        </div>
      ) : (
        // Main Dashboard Content
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Repositories */}
          <Card data-testid="recent-repositories">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Recent Repositories
              </CardTitle>
              <CardDescription>
                Your most recently updated repositories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" data-testid="repositories-list">
                {repositories.slice(0, 5).map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    data-testid={`repo-item-${repo.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <Github className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 dark:text-white" data-testid={`repo-name-${repo.id}`}>
                            {repo.name}
                          </p>
                          {repo.isPrivate && (
                            <Badge variant="secondary" className="text-xs" data-testid={`repo-private-${repo.id}`}>
                              Private
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          {repo.language && (
                            <span data-testid={`repo-language-${repo.id}`}>{repo.language}</span>
                          )}
                          <Badge 
                            variant={repo.isActive ? "default" : "secondary"}
                            className={`text-xs ${repo.isActive ? "bg-green-500/10 text-green-700 dark:text-green-400" : ""}`}
                            data-testid={`repo-status-${repo.id}`}
                          >
                            {repo.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" data-testid={`button-view-repo-${repo.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {repositories.length > 5 && (
                  <Button variant="outline" className="w-full" data-testid="button-view-all-repos">
                    View All Repositories ({repositories.length})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews */}
          <Card data-testid="recent-reviews">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Recent Reviews
              </CardTitle>
              <CardDescription>
                Latest AI-powered code reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" data-testid="reviews-list">
                {reviews.slice(0, 5).map((review) => {
                  const repo = repositories.find(r => r.id === review.repositoryId);
                  return (
                    <div
                      key={review.id}
                      className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                      data-testid={`review-item-${review.id}`}
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(review.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 dark:text-white" data-testid={`review-repo-${review.id}`}>
                              {repo?.name || 'Unknown Repository'}
                            </p>
                            <span className="text-gray-500 text-sm" data-testid={`review-pr-${review.id}`}>
                              PR #{review.pullRequestNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={`text-xs ${getStatusColor(review.status)}`}
                              data-testid={`review-status-${review.id}`}
                            >
                              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                            </Badge>
                            <span className="text-xs text-gray-600 dark:text-gray-400" data-testid={`review-time-${review.id}`}>
                              {review.completedAt 
                                ? `Completed ${new Date(review.completedAt).toLocaleDateString()}`
                                : `Started ${new Date(review.createdAt).toLocaleDateString()}`
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-view-review-${review.id}`}>
                        View
                      </Button>
                    </div>
                  );
                })}
                {repositories.length > 0 && reviews.length === 0 && (
                  <div className="text-center py-6" data-testid="reviews-empty">
                    <Zap className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      No reviews yet. Create a pull request to get started!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      {dashboardStats.recentActivity.length > 0 && (
        <Card data-testid="recent-activity">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest events across your repositories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3" data-testid="activity-list">
              {dashboardStats.recentActivity.slice(0, 8).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                  data-testid={`activity-item-${activity.id}`}
                >
                  <div className="flex-shrink-0">
                    {activity.type === 'review_completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {activity.type === 'review_started' && <Clock className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'repo_connected' && <GitBranch className="h-4 w-4 text-purple-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white" data-testid={`activity-message-${activity.id}`}>
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400" data-testid={`activity-repo-${activity.id}`}>
                      {activity.repository} • {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex gap-4 justify-center" data-testid="quick-actions">
        <Button variant="outline" data-testid="button-github-integration">
          <Github className="h-4 w-4 mr-2" />
          GitHub Integration
        </Button>
        <Button variant="outline" data-testid="button-settings">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
        <Button onClick={refetch} variant="outline" data-testid="button-refresh">
          <TrendingUp className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>
    </div>
  );
}