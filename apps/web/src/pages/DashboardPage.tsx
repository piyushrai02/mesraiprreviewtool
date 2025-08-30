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
  Zap,
  Plus,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGitHubData } from '@/hooks/useGitHubData';
import { GitHubInstallButton } from '@/components/features/github/GitHubInstallButton';
import { Link } from 'wouter';

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

  // Show empty state when no repositories or installations are found
  const showEmptyState = !loading && repositories.length === 0 && dashboardStats.totalRepositories === 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6" data-testid="dashboard-loading">
        <div className="max-w-7xl mx-auto space-y-8">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6" data-testid="dashboard-error">
        <div className="max-w-7xl mx-auto">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" data-testid="page-title">
              Dashboard
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400" data-testid="page-description">
              Monitor your GitHub repositories and AI-powered code reviews
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/github-integration">
              <Button variant="outline" className="h-11 px-6" data-testid="button-github-integration">
                <Github className="h-5 w-5 mr-2" />
                GitHub Setup
              </Button>
            </Link>
            {repositories.length === 0 ? (
              <GitHubInstallButton data-testid="install-github-app" />
            ) : (
              <Button className="h-11 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" data-testid="button-new-review">
                <Plus className="h-5 w-5 mr-2" />
                Start Review
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:shadow-xl transition-all duration-300" data-testid="stat-repositories">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                    Connected Repositories
                  </p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100" data-testid="stat-repos-count">
                    {dashboardStats.totalRepositories}
                  </p>
                  <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>+2 this month</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <GitBranch className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 hover:shadow-xl transition-all duration-300" data-testid="stat-active-reviews">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                    Active Reviews
                  </p>
                  <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100" data-testid="stat-active-count">
                    {dashboardStats.activeReviews}
                  </p>
                  <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Processing now</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 hover:shadow-xl transition-all duration-300" data-testid="stat-completed-reviews">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                    Completed Reviews
                  </p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100" data-testid="stat-completed-count">
                    {dashboardStats.completedReviews}
                  </p>
                  <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span>All time</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:shadow-xl transition-all duration-300" data-testid="stat-total-reviews">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                    Total Reviews
                  </p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100" data-testid="stat-total-count">
                    {dashboardStats.totalReviews}
                  </p>
                  <div className="flex items-center text-xs text-purple-600 dark:text-purple-400">
                    <BarChart3 className="h-3 w-3 mr-1" />
                    <span>Since start</span>
                  </div>
                </div>
                <div className="h-12 w-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {repositories.length === 0 ? (
          /* Empty State */
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg" data-testid="empty-state">
            <div className="max-w-md mx-auto space-y-6">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <Github className="h-8 w-8 text-white" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Welcome to Mesrai AI Review Tool
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Connect your GitHub repositories to start getting AI-powered code reviews on every pull request.
                </p>
              </div>
              <div className="pt-4">
                <GitHubInstallButton size="lg" data-testid="install-github-large" />
              </div>
              <div className="flex items-center justify-center gap-8 pt-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Automated Reviews</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Real-time Analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Smart Suggestions</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Main Dashboard Content */
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Recent Repositories */}
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-800" data-testid="recent-repositories">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <GitBranch className="h-4 w-4 text-white" />
                  </div>
                  Recent Repositories
                </CardTitle>
                <CardDescription className="text-base">
                  Your most recently updated repositories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" data-testid="repositories-list">
                  {repositories.slice(0, 5).map((repo) => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      data-testid={`repo-item-${repo.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Github className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="font-semibold text-gray-900 dark:text-white" data-testid={`repo-name-${repo.id}`}>
                              {repo.name}
                            </p>
                            {repo.isPrivate && (
                              <Badge variant="secondary" className="text-xs" data-testid={`repo-private-${repo.id}`}>
                                Private
                              </Badge>
                            )}
                            <Badge 
                              variant={repo.isActive ? "default" : "secondary"}
                              className={`text-xs ${repo.isActive ? "bg-green-500/10 text-green-700 dark:text-green-400" : ""}`}
                              data-testid={`repo-status-${repo.id}`}
                            >
                              {repo.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {repo.language && (
                              <>
                                <span data-testid={`repo-language-${repo.id}`}>{repo.language}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" data-testid={`button-view-repo-${repo.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {repositories.length > 5 && (
                    <Button variant="outline" className="w-full mt-4" data-testid="button-view-all-repos">
                      View All Repositories ({repositories.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="border-0 shadow-lg bg-white dark:bg-slate-800" data-testid="recent-reviews">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  Recent Reviews
                </CardTitle>
                <CardDescription className="text-base">
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
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        data-testid={`review-item-${review.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center">
                            {getStatusIcon(review.status)}
                          </div>
                          <div>
                            <div className="flex items-center gap-3">
                              <p className="font-semibold text-gray-900 dark:text-white" data-testid={`review-repo-${review.id}`}>
                                {repo?.name || 'Unknown Repository'}
                              </p>
                              <span className="text-gray-500 text-sm" data-testid={`review-pr-${review.id}`}>
                                PR #{review.pullRequestNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
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
                    <div className="text-center py-8" data-testid="reviews-empty">
                      <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Zap className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">
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
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800" data-testid="recent-activity">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription className="text-base">
                Latest events across your repositories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" data-testid="activity-list">
                {dashboardStats.recentActivity.slice(0, 8).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                    data-testid={`activity-item-${activity.id}`}
                  >
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center">
                      {activity.type === 'review_completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {activity.type === 'review_started' && <Clock className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'repo_connected' && <GitBranch className="h-4 w-4 text-purple-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid={`activity-message-${activity.id}`}>
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
        <div className="flex flex-wrap gap-4 justify-center" data-testid="quick-actions">
          <Link href="/github-integration">
            <Button variant="outline" className="h-11 px-6" data-testid="button-github-integration-footer">
              <Github className="h-4 w-4 mr-2" />
              GitHub Integration
            </Button>
          </Link>
          <Button variant="outline" className="h-11 px-6" data-testid="button-settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button onClick={refetch} variant="outline" className="h-11 px-6" data-testid="button-refresh">
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>
      </div>
    </div>
  );
}