import { RouteConfig, RouteGuard, NavigationOptions } from '@shared/index';
import { ROUTE_TITLES } from './constants';

// Lazy-loaded route components
const routes: RouteConfig[] = [
  {
    path: '/dashboard',
    component: () => import('../pages/DashboardPage'),
    title: 'Dashboard',
    requiresAuth: true,
    preload: true,
  },
  {
    path: '/reviews',
    component: () => import('../pages/ReviewsPage'),
    title: 'Reviews',
    requiresAuth: true,
  },
  {
    path: '/reviews/pending',
    component: () => import('../pages/reviews/PendingReviewsPage'),
    title: 'Pending Reviews',
    requiresAuth: true,
  },
  {
    path: '/reviews/completed',
    component: () => import('../pages/reviews/CompletedReviewsPage'),
    title: 'Completed Reviews',
    requiresAuth: true,
  },
  {
    path: '/reviews/archive',
    component: () => import('../pages/reviews/ArchiveReviewsPage'),
    title: 'Review Archive',
    requiresAuth: true,
  },
  {
    path: '/repositories',
    component: () => import('../pages/RepositoriesPage'),
    title: 'Repositories',
    requiresAuth: true,
  },
  {
    path: '/repositories/connected',
    component: () => import('../pages/repositories/ConnectedReposPage'),
    title: 'Connected Repositories',
    requiresAuth: true,
  },
  {
    path: '/repositories/settings',
    component: () => import('../pages/repositories/RepositorySettingsPage'),
    title: 'Repository Settings',
    requiresAuth: true,
    roles: ['admin', 'owner'],
  },
  {
    path: '/analytics',
    component: () => import('../pages/AnalyticsPage'),
    title: 'Analytics',
    requiresAuth: true,
  },
  {
    path: '/analytics/overview',
    component: () => import('../pages/analytics/OverviewPage'),
    title: 'Analytics Overview',
    requiresAuth: true,
  },
  {
    path: '/analytics/performance',
    component: () => import('../pages/analytics/PerformancePage'),
    title: 'Performance Metrics',
    requiresAuth: true,
  },
  {
    path: '/analytics/reports',
    component: () => import('../pages/analytics/ReportsPage'),
    title: 'Analytics Reports',
    requiresAuth: true,
  },
  {
    path: '/team',
    component: () => import('../pages/TeamPage'),
    title: 'Team Management',
    requiresAuth: true,
    roles: ['admin', 'owner'],
  },
  {
    path: '/team/members',
    component: () => import('../pages/team/MembersPage'),
    title: 'Team Members',
    requiresAuth: true,
    roles: ['admin', 'owner'],
  },
  {
    path: '/team/permissions',
    component: () => import('../pages/team/PermissionsPage'),
    title: 'Team Permissions',
    requiresAuth: true,
    roles: ['owner'],
  },
  {
    path: '/settings',
    component: () => import('../pages/SettingsPage'),
    title: 'Settings',
    requiresAuth: true,
  },
  {
    path: '/settings/profile',
    component: () => import('../pages/settings/ProfilePage'),
    title: 'Profile Settings',
    requiresAuth: true,
  },
  {
    path: '/settings/notifications',
    component: () => import('../pages/settings/NotificationsPage'),
    title: 'Notification Settings',
    requiresAuth: true,
  },
  {
    path: '/settings/integrations',
    component: () => import('../pages/settings/IntegrationsPage'),
    title: 'Integration Settings',
    requiresAuth: true,
  },
  {
    path: '/settings/billing',
    component: () => import('../pages/settings/BillingPage'),
    title: 'Billing Settings',
    requiresAuth: true,
    roles: ['admin', 'owner'],
  },
  {
    path: '/github',
    component: () => import('../pages/GitHubIntegrationPage'),
    title: 'GitHub Integration',
    requiresAuth: true,
  },
  {
    path: '/help',
    component: () => import('../pages/HelpPage'),
    title: 'Help & Support',
    requiresAuth: true,
  },
  {
    path: '/',
    component: () => import('../pages/DashboardPage'),
    title: 'Dashboard',
    requiresAuth: false,
    preload: true,
  },
  {
    path: '/login',
    component: () => import('../pages/LoginPage'),
    layout: 'auth',
    title: 'Sign In',
  },
  {
    path: '/404',
    component: () => import('../pages/NotFoundPage'),
    layout: 'minimal',
    title: 'Page Not Found',
  },
];

// Route guards
const authGuard: RouteGuard = {
  name: 'auth',
  guard: (route, context) => {
    if (!route.requiresAuth) return true;
    return !!context.user;
  },
  redirect: '/login',
};

const roleGuard: RouteGuard = {
  name: 'role',
  guard: (route, context) => {
    if (!route.roles || !route.roles.length) return true;
    if (!context.user || !context.user.role) return false;
    return route.roles.includes(context.user.role);
  },
  redirect: '/dashboard',
};

export const routeGuards: RouteGuard[] = [authGuard, roleGuard];

export class Router {
  private static instance: Router;
  private currentRoute: RouteConfig | null = null;
  private preloadedComponents = new Map<string, any>();
  private listeners: Set<(route: RouteConfig) => void> = new Set();

  static getInstance(): Router {
    if (!Router.instance) {
      Router.instance = new Router();
    }
    return Router.instance;
  }

  constructor() {
    this.initializePreloading();
  }

  private initializePreloading() {
    // Preload critical routes
    const preloadRoutes = routes.filter(route => route.preload);
    preloadRoutes.forEach(route => this.preloadRoute(route.path));
  }

  async preloadRoute(path: string): Promise<void> {
    const route = this.findRoute(path);
    if (!route || this.preloadedComponents.has(path)) return;

    try {
      const component = await route.component();
      this.preloadedComponents.set(path, component);
    } catch (error) {
      console.warn(`Failed to preload route ${path}:`, error);
    }
  }

  findRoute(path: string): RouteConfig | null {
    return routes.find(route => this.matchPath(route.path, path)) || null;
  }

  private matchPath(routePath: string, currentPath: string): boolean {
    // Simple path matching - can be enhanced with parameters
    const routeSegments = routePath.split('/').filter(Boolean);
    const currentSegments = currentPath.split('/').filter(Boolean);

    if (routeSegments.length !== currentSegments.length) return false;

    return routeSegments.every((segment, index) => {
      if (segment.startsWith(':')) return true; // Parameter
      return segment === currentSegments[index];
    });
  }

  async navigate(path: string, options: NavigationOptions = {}): Promise<void> {
    const route = this.findRoute(path);
    if (!route) {
      await this.navigate('/404', options);
      return;
    }

    // Run route guards
    const context = await this.getNavigationContext();
    for (const guard of routeGuards) {
      const canAccess = await guard.guard(route, context);
      if (!canAccess && guard.redirect) {
        await this.navigate(guard.redirect, { replace: true });
        return;
      }
    }

    this.currentRoute = route;
    this.notifyListeners(route);

    // Update document title
    document.title = route.title ? `${route.title} | Mesrai AI Review Tool` : 'Mesrai AI Review Tool';
  }

  async getComponent(path: string): Promise<React.ComponentType<any> | null> {
    const route = this.findRoute(path);
    if (!route) return null;

    // Check if already preloaded
    if (this.preloadedComponents.has(path)) {
      return this.preloadedComponents.get(path).default;
    }

    // Load on demand
    try {
      const component = await route.component();
      this.preloadedComponents.set(path, component);
      return component.default;
    } catch (error) {
      console.error(`Failed to load component for ${path}:`, error);
      return null;
    }
  }

  private async getNavigationContext(): Promise<any> {
    // This would typically come from your auth context
    return {
      user: null, // Replace with actual user from context
    };
  }

  onRouteChange(listener: (route: RouteConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(route: RouteConfig): void {
    this.listeners.forEach(listener => listener(route));
  }

  getCurrentRoute(): RouteConfig | null {
    return this.currentRoute;
  }

  getRouteTitle(path: string): string {
    return ROUTE_TITLES[path] || 'Mesrai AI Review Tool';
  }
}

export const router = Router.getInstance();