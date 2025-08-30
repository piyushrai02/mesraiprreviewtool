import React, { useState, Suspense } from 'react';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sidebar } from '../features/navigation/Sidebar';
import { Breadcrumb } from '../features/navigation/Breadcrumb';
import { RouteGuard } from '../features/navigation/RouteGuard';
import { router } from '../../lib/router';
import { NAVIGATION_STORAGE_KEYS } from '@shared/index';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem(NAVIGATION_STORAGE_KEYS.COLLAPSED_SIDEBAR);
    return saved ? JSON.parse(saved) : false;
  });

  const currentRoute = router.findRoute(location);
  const layout = currentRoute?.layout || 'default';

  const handleToggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem(NAVIGATION_STORAGE_KEYS.COLLAPSED_SIDEBAR, JSON.stringify(newState));
  };

  // Auth layout (login page)
  if (layout === 'auth') {
    return (
      <div className="min-h-screen bg-background">
        <RouteGuard>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }
          >
            {children}
          </Suspense>
        </RouteGuard>
      </div>
    );
  }

  // Minimal layout (404, error pages)
  if (layout === 'minimal') {
    return (
      <div className="min-h-screen bg-background">
        <RouteGuard>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            }
          >
            {children}
          </Suspense>
        </RouteGuard>
      </div>
    );
  }

  // Default layout (main app)
  return (
    <div className="h-screen w-full bg-background flex overflow-hidden">
      <RouteGuard>
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          className={cn(
            "relative z-40 transition-all duration-300",
            sidebarCollapsed && "lg:w-16"
          )}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Navigation Bar */}
          <header className="h-16 border-b border-border/30 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
              {/* Mobile menu button */}
              <button
                onClick={handleToggleSidebar}
                className="lg:hidden btn-ghost p-2"
                data-testid="mobile-menu-toggle"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Breadcrumb */}
              <Breadcrumb className="hidden sm:flex flex-1" />
              
              {/* Right side actions */}
              <div className="flex items-center gap-3">
                {/* Add notification bell, search, user profile, etc. here */}
                <div className="hidden md:flex items-center gap-2">
                  <div className="text-sm text-muted-foreground">Welcome back!</div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-background">
            <div className="h-full p-4 lg:p-6">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center space-y-4 animate-fade-in">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                      <p className="text-sm text-muted-foreground">Loading page...</p>
                    </div>
                  </div>
                }
              >
                <div className="max-w-full animate-fade-in">
                  {children}
                </div>
              </Suspense>
            </div>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
            onClick={handleToggleSidebar}
            data-testid="sidebar-overlay"
          />
        )}
      </RouteGuard>
    </div>
  );
}