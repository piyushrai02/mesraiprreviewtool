// Export GitHub types and constants
export * from './github.types';
export * from './github.constants';

// Export existing types if any
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin' | 'owner';
  githubId?: number;
  githubUsername?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

// Navigation types (if they exist)
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: string;
  children?: NavItem[];
  roles?: string[];
}

export interface NavigationContext {
  state: NavigationState;
  navigate: (path: string, options?: NavigationOptions) => Promise<void>;
  goBack: () => void;
  refresh: () => void;
  updateBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
}

export interface NavigationState {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  isLoading: boolean;
  error?: string;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: string;
}

export interface NavigationOptions {
  replace?: boolean;
  state?: any;
}

export interface RouteConfig {
  path: string;
  component: () => Promise<any>;
  title: string;
  requiresAuth?: boolean;
  roles?: string[];
  layout?: 'default' | 'auth' | 'minimal';
  preload?: boolean;
}

// Constants
export const NAVIGATION_STORAGE_KEYS = {
  COLLAPSED_SIDEBAR: 'mesrai_sidebar_collapsed',
  NAVIGATION_HISTORY: 'mesrai_navigation_history'
} as const;

export const NAVIGATION_EVENTS = {
  ROUTE_CHANGE_START: 'navigation:route-change-start',
  ROUTE_CHANGE_END: 'navigation:route-change-end', 
  ROUTE_CHANGE_ERROR: 'navigation:route-change-error',
  BREADCRUMB_UPDATE: 'navigation:breadcrumb-update'
} as const;