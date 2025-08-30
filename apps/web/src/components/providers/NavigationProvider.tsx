import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { NavigationContext, NavigationState, BreadcrumbItem, NavigationOptions } from '@shared/index';
import { router } from '../../lib/router';
import { NAVIGATION_EVENTS } from '@shared/index';

const NavigationCtx = createContext<NavigationContext | null>(null);

interface NavigationProviderProps {
  children: React.ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [location, setLocation] = useLocation();
  const [state, setState] = useState<NavigationState>({
    currentPath: location,
    breadcrumbs: [],
    isLoading: false,
    error: undefined,
  });

  const navigate = useCallback(async (path: string, options: NavigationOptions = {}) => {
    setState(prev => ({ ...prev, isLoading: true, error: undefined }));
    
    try {
      // Emit navigation start event
      window.dispatchEvent(new CustomEvent(NAVIGATION_EVENTS.ROUTE_CHANGE_START, {
        detail: { from: location, to: path }
      }));

      await router.navigate(path, options);
      
      if (options.replace) {
        setLocation(path, { replace: true });
      } else {
        setLocation(path);
      }

      setState(prev => ({
        ...prev,
        currentPath: path,
        isLoading: false,
      }));

      // Emit navigation end event
      window.dispatchEvent(new CustomEvent(NAVIGATION_EVENTS.ROUTE_CHANGE_END, {
        detail: { path }
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Navigation failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      // Emit navigation error event
      window.dispatchEvent(new CustomEvent(NAVIGATION_EVENTS.ROUTE_CHANGE_ERROR, {
        detail: { error: errorMessage, path }
      }));
    }
  }, [location, setLocation]);

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const refresh = useCallback(() => {
    window.location.reload();
  }, []);

  const updateBreadcrumbs = useCallback((breadcrumbs: BreadcrumbItem[]) => {
    setState(prev => ({ ...prev, breadcrumbs }));
    
    // Emit breadcrumb update event
    window.dispatchEvent(new CustomEvent(NAVIGATION_EVENTS.BREADCRUMB_UPDATE, {
      detail: { breadcrumbs }
    }));
  }, []);

  // Update state when location changes
  useEffect(() => {
    setState(prev => ({ ...prev, currentPath: location }));
  }, [location]);

  // Auto-generate breadcrumbs based on current path
  useEffect(() => {
    const generateBreadcrumbs = () => {
      const segments = location.split('/').filter(Boolean);
      const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Home', path: '/dashboard', icon: 'Home' }
      ];

      let currentPath = '';
      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const title = router.getRouteTitle(currentPath);
        
        if (index === segments.length - 1) {
          // Last segment doesn't need a path (current page)
          breadcrumbs.push({ label: title });
        } else {
          breadcrumbs.push({ label: title, path: currentPath });
        }
      });

      return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();
    updateBreadcrumbs(breadcrumbs);
  }, [location, updateBreadcrumbs]);

  const contextValue: NavigationContext = {
    state,
    navigate,
    goBack,
    refresh,
    updateBreadcrumbs,
  };

  return (
    <NavigationCtx.Provider value={contextValue}>
      {children}
    </NavigationCtx.Provider>
  );
}

export function useNavigation(): NavigationContext {
  const context = useContext(NavigationCtx);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}