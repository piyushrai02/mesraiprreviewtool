import { NavItem } from '@shared/index';

export const MAIN_NAVIGATION: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    id: 'reviews',
    label: 'Reviews',
    path: '/reviews',
    icon: 'MessageSquare',
    children: [
      {
        id: 'reviews-pending',
        label: 'Pending Reviews',
        path: '/reviews/pending',
        icon: 'Clock',
        badge: 'pending',
      },
      {
        id: 'reviews-completed',
        label: 'Completed Reviews',
        path: '/reviews/completed',
        icon: 'CheckCircle',
      },
      {
        id: 'reviews-archive',
        label: 'Archive',
        path: '/reviews/archive',
        icon: 'Archive',
      },
    ],
  },
  {
    id: 'repositories',
    label: 'Repositories',
    path: '/repositories',
    icon: 'GitBranch',
    children: [
      {
        id: 'repositories-connected',
        label: 'Connected Repos',
        path: '/repositories/connected',
        icon: 'Link',
      },
      {
        id: 'repositories-settings',
        label: 'Repository Settings',
        path: '/repositories/settings',
        icon: 'Settings',
        roles: ['admin', 'owner'],
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: 'BarChart3',
    children: [
      {
        id: 'analytics-overview',
        label: 'Overview',
        path: '/analytics/overview',
        icon: 'TrendingUp',
      },
      {
        id: 'analytics-performance',
        label: 'Performance',
        path: '/analytics/performance',
        icon: 'Zap',
      },
      {
        id: 'analytics-reports',
        label: 'Reports',
        path: '/analytics/reports',
        icon: 'FileText',
      },
    ],
  },
  {
    id: 'team',
    label: 'Team',
    path: '/team',
    icon: 'Users',
    roles: ['admin', 'owner'],
    children: [
      {
        id: 'team-members',
        label: 'Members',
        path: '/team/members',
        icon: 'UserPlus',
      },
      {
        id: 'team-permissions',
        label: 'Permissions',
        path: '/team/permissions',
        icon: 'Shield',
        roles: ['owner'],
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: 'Settings',
    children: [
      {
        id: 'settings-profile',
        label: 'Profile',
        path: '/settings/profile',
        icon: 'User',
      },
      {
        id: 'settings-notifications',
        label: 'Notifications',
        path: '/settings/notifications',
        icon: 'Bell',
      },
      {
        id: 'settings-integrations',
        label: 'Integrations',
        path: '/settings/integrations',
        icon: 'Puzzle',
      },
      {
        id: 'settings-billing',
        label: 'Billing',
        path: '/settings/billing',
        icon: 'CreditCard',
        roles: ['admin', 'owner'],
      },
    ],
  },
];

export const USER_MENU_NAVIGATION: NavItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    path: '/settings/profile',
    icon: 'User',
  },
  {
    id: 'preferences',
    label: 'Preferences',
    path: '/settings/preferences',
    icon: 'Settings',
  },
  {
    id: 'help',
    label: 'Help & Support',
    path: '/help',
    icon: 'HelpCircle',
  },
  {
    id: 'docs',
    label: 'Documentation',
    path: '/docs',
    icon: 'BookOpen',
    external: true,
    target: '_blank',
  },
  {
    id: 'logout',
    label: 'Sign Out',
    path: '/logout',
    icon: 'LogOut',
  },
];

export const BREADCRUMB_CONFIG = {
  showHome: true,
  homeLabel: 'Home',
  homePath: '/dashboard',
  separator: '/',
  maxItems: 5,
};