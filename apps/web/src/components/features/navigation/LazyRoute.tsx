import React, { Suspense, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { router } from '../../../lib/router';
import { ERROR_MESSAGES } from '../../../lib/constants';

export function LazyRoute() {
  const [location] = useLocation();
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const component = await router.getComponent(location);
        
        if (mounted) {
          if (component) {
            setComponent(() => component);
          } else {
            setError(ERROR_MESSAGES.ROUTE_NOT_FOUND);
          }
        }
      } catch (err) {
        if (mounted) {
          console.error('Failed to load route component:', err);
          setError(ERROR_MESSAGES.GENERIC_ERROR);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadComponent();

    return () => {
      mounted = false;
    };
  }, [location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Page Load Error</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold">Page Not Found</h1>
          <p className="text-muted-foreground">{ERROR_MESSAGES.ROUTE_NOT_FOUND}</p>
        </div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <Component />
    </Suspense>
  );
}