export const APP_CONFIG = {
  name: 'Mesrai AI Review Tool',
  description: 'Professional enterprise-grade code review and analysis platform',
  version: '1.0.0',
  author: 'Mesrai Technologies',
} as const;

export const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/reviews': 'Code Reviews',
  '/reviews/pending': 'Pending Reviews',
  '/reviews/completed': 'Completed Reviews',
  '/reviews/archive': 'Review Archive',
  '/repositories': 'Repositories',
  '/repositories/connected': 'Connected Repositories',
  '/repositories/settings': 'Repository Settings',
  '/analytics': 'Analytics',
  '/analytics/overview': 'Analytics Overview',
  '/analytics/performance': 'Performance Metrics',
  '/analytics/reports': 'Analytics Reports',
  '/team': 'Team Management',
  '/team/members': 'Team Members',
  '/team/permissions': 'Team Permissions',
  '/settings': 'Settings',
  '/settings/profile': 'Profile Settings',
  '/settings/notifications': 'Notification Settings',
  '/settings/integrations': 'Integration Settings',
  '/settings/billing': 'Billing Settings',
  '/help': 'Help & Support',
  '/docs': 'Documentation',
} as const;

export const LOADING_MESSAGES = [
  'Loading your workspace...',
  'Preparing your dashboard...',
  'Fetching latest data...',
  'Almost ready...',
] as const;

export const ERROR_MESSAGES = {
  ROUTE_NOT_FOUND: 'The page you are looking for could not be found.',
  UNAUTHORIZED: 'You do not have permission to access this page.',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your connection.',
  GENERIC_ERROR: 'Something went wrong. Please try again later.',
} as const;