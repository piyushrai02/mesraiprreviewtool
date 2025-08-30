export const NAVIGATION_EVENTS = {
  ROUTE_CHANGE_START: 'navigation:route-change-start',
  ROUTE_CHANGE_END: 'navigation:route-change-end',
  ROUTE_CHANGE_ERROR: 'navigation:route-change-error',
  BREADCRUMB_UPDATE: 'navigation:breadcrumb-update',
} as const;

export const NAVIGATION_LAYOUTS = {
  DEFAULT: 'default',
  AUTH: 'auth',
  MINIMAL: 'minimal',
} as const;

export const ROUTE_TRANSITIONS = {
  DURATION: 300,
  EASING: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;

export const NAVIGATION_STORAGE_KEYS = {
  LAST_VISITED_ROUTE: 'nav:last-visited-route',
  NAVIGATION_STATE: 'nav:state',
  COLLAPSED_SIDEBAR: 'nav:sidebar-collapsed',
} as const;