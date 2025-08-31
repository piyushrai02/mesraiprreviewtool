import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GitBranch,
  Github,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Plus,
  ExternalLink,
} from "lucide-react";
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiRequest } from '@/lib/queryClient';

interface Repository {
  id: string;
  githubId: number;
  name: string;
  fullName: string;
  owner: string;
  isPrivate: boolean;
  language?: string;
  defaultBranch: string;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
}

interface ReviewSession {
  id: string;
  repositoryId: string;
  pullRequestNumber: number;
  status: "queued" | "analyzing" | "reviewed" | "commented" | "error";
  createdAt: string;
  completedAt?: string;
}

export default function GitHubIntegrationPage() {
  const [activeTab, setActiveTab] = useState("overview");

  // Start GitHub App installation
  const installGitHubApp = () => {
    const appName = "mesrai-ai-review-tool"; // Replace with your actual GitHub App name
    const installUrl = `https://github.com/apps/${appName}/installations/new`;
    window.open(installUrl, "_blank");
  };

  const repositoriesLoading = false;

  const mockRepositories: Repository[] = [
    {
      id: "1",
      githubId: 123456,
      name: "awesome-project",
      fullName: "myorg/awesome-project",
      owner: "myorg",
      isPrivate: false,
      language: "TypeScript",
      defaultBranch: "main",
      isActive: true,
      lastSyncAt: "2024-01-15T10:30:00Z",
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "2",
      githubId: 789012,
      name: "api-service",
      fullName: "myorg/api-service",
      owner: "myorg",
      isPrivate: true,
      language: "Python",
      defaultBranch: "main",
      isActive: true,
      lastSyncAt: "2024-01-14T15:45:00Z",
      createdAt: "2024-01-05T00:00:00Z",
    },
  ];

  const mockReviewSessions: ReviewSession[] = [
    {
      id: "review-1",
      repositoryId: "1",
      pullRequestNumber: 42,
      status: "reviewed",
      createdAt: "2024-01-15T09:00:00Z",
      completedAt: "2024-01-15T09:05:00Z",
    },
    {
      id: "review-2",
      repositoryId: "2",
      pullRequestNumber: 18,
      status: "analyzing",
      createdAt: "2024-01-15T10:15:00Z",
    },
  ];

  const getStatusIcon = (status: ReviewSession["status"]) => {
    switch (status) {
      case "reviewed":
      case "commented":
        return (
          <CheckCircle
            className="h-4 w-4 text-green-500"
            data-testid="icon-success"
          />
        );
      case "analyzing":
      case "queued":
        return (
          <Clock
            className="h-4 w-4 text-blue-500"
            data-testid="icon-processing"
          />
        );
      case "error":
        return (
          <AlertCircle
            className="h-4 w-4 text-red-500"
            data-testid="icon-error"
          />
        );
      default:
        return (
          <Clock className="h-4 w-4 text-gray-500" data-testid="icon-default" />
        );
    }
  };

  const getStatusColor = (status: ReviewSession["status"]) => {
    switch (status) {
      case "reviewed":
      case "commented":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "analyzing":
      case "queued":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "error":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div
      className="container mx-auto p-6 space-y-6"
      data-testid="github-integration-page"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-bold text-gray-900 dark:text-white"
            data-testid="page-title"
          >
            GitHub Integration
          </h1>
          <p
            className="text-gray-600 dark:text-gray-400 mt-2"
            data-testid="page-description"
          >
            Manage your GitHub repositories and AI code reviews
          </p>
        </div>
        <Button
          onClick={installGitHubApp}
          className="flex items-center gap-2"
          data-testid="button-install-app"
        >
          <Plus className="h-4 w-4" />
          Install GitHub App
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList
          className="grid w-full grid-cols-3"
          data-testid="tabs-navigation"
        >
          <TabsTrigger value="overview" data-testid="tab-overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="repositories" data-testid="tab-repositories">
            Repositories
          </TabsTrigger>
          <TabsTrigger value="reviews" data-testid="tab-reviews">
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="overview"
          className="space-y-6"
          data-testid="tab-content-overview"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card data-testid="card-total-repos">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <GitBranch className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Connected Repos
                    </p>
                    <p
                      className="text-2xl font-bold text-gray-900 dark:text-white"
                      data-testid="stat-repos"
                    >
                      {mockRepositories.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-active-reviews">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-yellow-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Reviews
                    </p>
                    <p
                      className="text-2xl font-bold text-gray-900 dark:text-white"
                      data-testid="stat-active"
                    >
                      {
                        mockReviewSessions.filter((r) =>
                          ["analyzing", "queued"].includes(r.status),
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-completed-reviews">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Completed Reviews
                    </p>
                    <p
                      className="text-2xl font-bold text-gray-900 dark:text-white"
                      data-testid="stat-completed"
                    >
                      {
                        mockReviewSessions.filter((r) =>
                          ["reviewed", "commented"].includes(r.status),
                        ).length
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-total-reviews">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Github className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Reviews
                    </p>
                    <p
                      className="text-2xl font-bold text-gray-900 dark:text-white"
                      data-testid="stat-total"
                    >
                      {mockReviewSessions.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert data-testid="alert-installation-info">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Install the Mesrai AI GitHub App to start automated code reviews
              on your repositories. The app will automatically review new pull
              requests and provide detailed feedback.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent
          value="repositories"
          className="space-y-6"
          data-testid="tab-content-repositories"
        >
          <Card>
            <CardHeader>
              <CardTitle
                className="flex items-center gap-2"
                data-testid="repos-title"
              >
                <GitBranch className="h-5 w-5" />
                Connected Repositories
              </CardTitle>
              <CardDescription data-testid="repos-description">
                Repositories connected to Mesrai AI for automated code reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              {repositoriesLoading ? (
                <div className="space-y-4" data-testid="repos-loading">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse"
                    >
                      <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4" data-testid="repos-list">
                  {mockRepositories.map((repo) => (
                    <div
                      key={repo.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      data-testid={`repo-item-${repo.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Github className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              className="text-lg font-medium text-gray-900 dark:text-white"
                              data-testid={`repo-name-${repo.id}`}
                            >
                              {repo.fullName}
                            </h3>
                            {repo.isPrivate && (
                              <Badge
                                variant="secondary"
                                data-testid={`repo-private-${repo.id}`}
                              >
                                Private
                              </Badge>
                            )}
                            <Badge
                              variant={repo.isActive ? "default" : "secondary"}
                              className={
                                repo.isActive
                                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                  : ""
                              }
                              data-testid={`repo-status-${repo.id}`}
                            >
                              {repo.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {repo.language && (
                              <span data-testid={`repo-language-${repo.id}`}>
                                {repo.language}
                              </span>
                            )}
                            <span data-testid={`repo-branch-${repo.id}`}>
                              Default: {repo.defaultBranch}
                            </span>
                            {repo.lastSyncAt && (
                              <span data-testid={`repo-sync-${repo.id}`}>
                                Last sync:{" "}
                                {new Date(repo.lastSyncAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-configure-${repo.id}`}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                  ))}
                  {mockRepositories.length === 0 && (
                    <div className="text-center py-8" data-testid="repos-empty">
                      <Github className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No repositories connected
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Install the GitHub App to connect your repositories
                      </p>
                      <Button
                        onClick={installGitHubApp}
                        data-testid="button-install-from-empty"
                      >
                        Install GitHub App
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent
          value="reviews"
          className="space-y-6"
          data-testid="tab-content-reviews"
        >
          <Card>
            <CardHeader>
              <CardTitle
                className="flex items-center gap-2"
                data-testid="reviews-title"
              >
                <CheckCircle className="h-5 w-5" />
                Recent Reviews
              </CardTitle>
              <CardDescription data-testid="reviews-description">
                AI-powered code reviews for your pull requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4" data-testid="reviews-list">
                {mockReviewSessions.map((review) => {
                  const repo = mockRepositories.find(
                    (r) => r.id === review.repositoryId,
                  );
                  return (
                    <div
                      key={review.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                      data-testid={`review-item-${review.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {getStatusIcon(review.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              className="text-lg font-medium text-gray-900 dark:text-white"
                              data-testid={`review-repo-${review.id}`}
                            >
                              {repo?.name || "Unknown Repository"}
                            </h3>
                            <span
                              className="text-gray-500"
                              data-testid={`review-pr-${review.id}`}
                            >
                              PR #{review.pullRequestNumber}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400">
                            <Badge
                              className={getStatusColor(review.status)}
                              data-testid={`review-status-${review.id}`}
                            >
                              {review.status.charAt(0).toUpperCase() +
                                review.status.slice(1)}
                            </Badge>
                            <span data-testid={`review-created-${review.id}`}>
                              Created:{" "}
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                            {review.completedAt && (
                              <span
                                data-testid={`review-completed-${review.id}`}
                              >
                                Completed:{" "}
                                {new Date(
                                  review.completedAt,
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-view-review-${review.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  );
                })}
                {mockReviewSessions.length === 0 && (
                  <div className="text-center py-8" data-testid="reviews-empty">
                    <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No reviews yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Reviews will appear here once you create pull requests in
                      connected repositories
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
