// GitHub Integration Types
export interface GitHubApp {
  id: number;
  name: string;
  description: string;
  external_url: string;
  html_url: string;
  permissions: GitHubAppPermissions;
  events: string[];
}

export interface GitHubAppPermissions {
  contents: 'read' | 'write';
  pull_requests: 'read' | 'write';
  issues: 'read' | 'write';
  metadata: 'read';
  checks: 'read' | 'write';
}

export interface GitHubInstallation {
  id: number;
  account: {
    login: string;
    id: number;
    type: 'User' | 'Organization';
    avatar_url: string;
  };
  repository_selection: 'all' | 'selected';
  permissions: GitHubAppPermissions;
  events: string[];
  created_at: string;
  updated_at: string;
  single_file_name?: string;
  has_multiple_single_files?: boolean;
  single_file_paths?: string[];
  app_id: number;
  target_id: number;
  target_type: 'User' | 'Organization';
  suspended_by?: any;
  suspended_at?: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    type: 'User' | 'Organization';
  };
  private: boolean;
  html_url: string;
  description?: string;
  fork: boolean;
  language?: string;
  default_branch: string;
  archived: boolean;
  disabled: boolean;
  pushed_at: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed' | 'merged';
  head: {
    sha: string;
    ref: string;
    repo: GitHubRepository;
  };
  base: {
    sha: string;
    ref: string;
    repo: GitHubRepository;
  };
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  assignees: Array<{
    login: string;
    id: number;
    avatar_url: string;
  }>;
  reviewers: Array<{
    login: string;
    id: number;
    avatar_url: string;
  }>;
  html_url: string;
  diff_url: string;
  patch_url: string;
  created_at: string;
  updated_at: string;
  merged_at?: string;
  closed_at?: string;
}

export interface GitHubWebhookEvent {
  action: string;
  installation?: GitHubInstallation;
  repository?: GitHubRepository;
  pull_request?: GitHubPullRequest;
  sender: {
    login: string;
    id: number;
    avatar_url: string;
    type: 'User' | 'Bot';
  };
}

// AI Review Types
export interface CodeReview {
  id: string;
  pullRequestId: number;
  repositoryId: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  findings: CodeReviewFinding[];
  summary: string;
  score: number; // 1-100
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CodeReviewFinding {
  id: string;
  type: 'issue' | 'suggestion' | 'praise' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  file: string;
  line: number;
  endLine?: number;
  column?: number;
  endColumn?: number;
  code: string;
  suggestion?: string;
  category: 'bug' | 'performance' | 'security' | 'style' | 'maintainability' | 'best_practice';
}

export interface GitHubComment {
  id: number;
  body: string;
  path?: string;
  line?: number;
  side?: 'LEFT' | 'RIGHT';
  start_line?: number;
  start_side?: 'LEFT' | 'RIGHT';
  in_reply_to?: number;
  user: {
    login: string;
    id: number;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
}

// Database Models
export interface ConnectedRepository {
  id: string;
  githubId: number;
  name: string;
  fullName: string;
  owner: string;
  isPrivate: boolean;
  installationId: number;
  language?: string;
  defaultBranch: string;
  isActive: boolean;
  webhookId?: number;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewSession {
  id: string;
  repositoryId: string;
  pullRequestNumber: number;
  githubPrId: number;
  status: 'queued' | 'analyzing' | 'reviewed' | 'commented' | 'error';
  reviewId?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

// API Request/Response Types
export interface GitHubAppInstallationRequest {
  installationId: number;
  setupAction: 'install' | 'update';
  repositories?: GitHubRepository[];
}

export interface GitHubAppInstallationResponse {
  success: boolean;
  installation: GitHubInstallation;
  repositories: ConnectedRepository[];
  message: string;
}

export interface WebhookProcessingRequest {
  event: string;
  payload: GitHubWebhookEvent;
  signature: string;
  deliveryId: string;
}

export interface WebhookProcessingResponse {
  success: boolean;
  processed: boolean;
  action?: string;
  message: string;
}

export interface StartReviewRequest {
  repositoryId: string;
  pullRequestNumber: number;
  forceReview?: boolean;
}

export interface StartReviewResponse {
  success: boolean;
  reviewSession: ReviewSession;
  message: string;
}