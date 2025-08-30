import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../../components/providers/AuthProvider';
import { router } from '../../../lib/router';
import { LOADING_MESSAGES, ERROR_MESSAGES } from '../../../lib/constants';

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const [location, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const [isCheckingRoute, setIsCheckingRoute] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState<string | null>(null);

  // Cycle through loading messages
  useEffect(() => {
    if (!isCheckingRoute) return;

    const interval = setInterval(() => {
      setLoadingMessage(prev => {
        const currentIndex = LOADING_MESSAGES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
        return LOADING_MESSAGES[nextIndex];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [isCheckingRoute]);

  useEffect(() => {
    const checkRoute = async () => {
      if (authLoading) return; // Wait for auth to complete

      setIsCheckingRoute(true);
      setError(null);

      try {
        const route = router.findRoute(location);
        
        if (!route) {
          setLocation('/404', { replace: true });
          return;
        }

        // Check authentication - skip for root route to avoid infinite redirect
        if (route.requiresAuth && !user && location !== '/') {
          setLocation('/login', { replace: true });
          return;
        }

        // Check role permissions
        if (route.roles && route.roles.length > 0) {
          if (!user || !user.role || !route.roles.includes(user.role)) {
            setLocation('/dashboard', { replace: true });
            return;
          }
        }

        // Pre-load the component if not already loaded
        await router.getComponent(location);
        
      } catch (err) {
        console.error('Route guard error:', err);
        setError(ERROR_MESSAGES.GENERIC_ERROR);
      } finally {
        setIsCheckingRoute(false);
      }
    };

    checkRoute();
  }, [location, user, authLoading, setLocation]);

  // Show loading state
  if (authLoading || isCheckingRoute) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <div className="space-y-2">
            <p className="text-lg font-medium">{loadingMessage}</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we prepare your experience
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold">Something went wrong</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}