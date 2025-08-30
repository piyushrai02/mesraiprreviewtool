export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: string | number;
  children?: NavItem[];
  roles?: string[];
  hidden?: boolean;
  disabled?: boolean;
  external?: boolean;
  target?: '_blank' | '_self';
}

export interface RouteConfig {
  path: string;
  component: () => Promise<{ default: React.ComponentType<any> }>;
  layout?: 'default' | 'auth' | 'minimal';
  title?: string;
  description?: string;
  requiresAuth?: boolean;
  roles?: string[];
  preload?: boolean;
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

export interface NavigationContext {
  state: NavigationState;
  navigate: (path: string, options?: NavigationOptions) => void;
  goBack: () => void;
  refresh: () => void;
  updateBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
}

export interface NavigationOptions {
  replace?: boolean;
  state?: any;
  preserveScroll?: boolean;
}

export interface RouteGuard {
  name: string;
  guard: (route: RouteConfig, context: any) => boolean | Promise<boolean>;
  redirect?: string;
}