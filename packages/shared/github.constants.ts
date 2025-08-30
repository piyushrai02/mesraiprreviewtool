// GitHub API Constants
export const GITHUB_API_BASE_URL = 'https://api.github.com';
export const GITHUB_APP_INSTALL_URL = 'https://github.com/apps';

// GitHub Events
export const GITHUB_WEBHOOK_EVENTS = {
  INSTALLATION: 'installation',
  INSTALLATION_REPOSITORIES: 'installation_repositories', 
  PULL_REQUEST: 'pull_request',
  PULL_REQUEST_REVIEW: 'pull_request_review',
  PULL_REQUEST_REVIEW_COMMENT: 'pull_request_review_comment',
  PUSH: 'push',
  REPOSITORY: 'repository',
  PING: 'ping'
} as const;

export const GITHUB_PR_ACTIONS = {
  OPENED: 'opened',
  REOPENED: 'reopened',
  SYNCHRONIZE: 'synchronize',
  CLOSED: 'closed',
  EDITED: 'edited'
} as const;

export const GITHUB_INSTALLATION_ACTIONS = {
  CREATED: 'created',
  DELETED: 'deleted',
  SUSPEND: 'suspend',
  UNSUSPEND: 'unsuspend',
  NEW_PERMISSIONS_ACCEPTED: 'new_permissions_accepted'
} as const;

// Review Configuration
export const REVIEW_CONFIG = {
  MAX_FILE_SIZE: 1024 * 1024, // 1MB
  SUPPORTED_LANGUAGES: [
    'javascript',
    'typescript', 
    'python',
    'java',
    'go',
    'rust',
    'cpp',
    'c',
    'csharp',
    'php',
    'ruby',
    'swift',
    'kotlin'
  ],
  IGNORED_PATHS: [
    'node_modules/',
    '.git/',
    'dist/',
    'build/',
    '.next/',
    '.nuxt/',
    'coverage/',
    '__pycache__/',
    '.pytest_cache/',
    'vendor/',
    '.vscode/',
    '.idea/'
  ],
  IGNORED_EXTENSIONS: [
    '.min.js',
    '.bundle.js',
    '.map',
    '.lock',
    '.log',
    '.tmp',
    '.cache'
  ]
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  GITHUB: {
    INSTALLATION: '/api/v1/github/installation',
    WEBHOOK: '/api/v1/github/webhook',
    REPOSITORIES: '/api/v1/github/repositories',
    REPOSITORY: (id: string) => `/api/v1/github/repositories/${id}`,
    START_REVIEW: '/api/v1/github/review/start',
    REVIEW_STATUS: (id: string) => `/api/v1/github/review/${id}/status`
  }
} as const;

// Error Messages
export const GITHUB_ERROR_MESSAGES = {
  INSTALLATION_NOT_FOUND: 'GitHub installation not found',
  REPOSITORY_NOT_CONNECTED: 'Repository is not connected to Mesrai AI',
  WEBHOOK_VERIFICATION_FAILED: 'Webhook signature verification failed', 
  REVIEW_ALREADY_IN_PROGRESS: 'Review is already in progress for this PR',
  PULL_REQUEST_NOT_FOUND: 'Pull request not found',
  INSUFFICIENT_PERMISSIONS: 'Insufficient GitHub app permissions',
  RATE_LIMIT_EXCEEDED: 'GitHub API rate limit exceeded',
  INVALID_WEBHOOK_PAYLOAD: 'Invalid webhook payload received'
} as const;

// Success Messages  
export const GITHUB_SUCCESS_MESSAGES = {
  INSTALLATION_COMPLETED: 'GitHub app installed successfully',
  REPOSITORY_CONNECTED: 'Repository connected successfully',
  WEBHOOK_PROCESSED: 'Webhook processed successfully',
  REVIEW_STARTED: 'Code review started successfully',
  REVIEW_COMPLETED: 'Code review completed successfully'
} as const;

// GitHub App Permissions Required
export const REQUIRED_PERMISSIONS = {
  contents: 'read' as const,
  pull_requests: 'write' as const,
  issues: 'write' as const,
  metadata: 'read' as const,
  checks: 'write' as const
};

// Review Comment Templates
export const REVIEW_COMMENT_TEMPLATES = {
  REVIEW_STARTED: '🤖 **Mesrai AI Review Started**\n\nI\'m analyzing this pull request and will provide detailed feedback shortly.',
  REVIEW_COMPLETED: (score: number, findings: number) => 
    `🎉 **Mesrai AI Review Completed**\n\n**Overall Score:** ${score}/100\n**Issues Found:** ${findings}\n\nDetailed review comments have been added below.`,
  SECURITY_ISSUE: '🔒 **Security Issue Detected**',
  PERFORMANCE_ISSUE: '⚡ **Performance Concern**',
  BUG_POTENTIAL: '🐛 **Potential Bug**',
  STYLE_SUGGESTION: '✨ **Style Suggestion**',
  BEST_PRACTICE: '💡 **Best Practice Recommendation**'
} as const;