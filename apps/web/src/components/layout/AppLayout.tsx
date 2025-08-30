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
    <div className="min-h-screen bg-background flex">
      <RouteGuard>
        {/* Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
          className="fixed left-0 top-0 bottom-0 z-40 lg:relative lg:z-auto"
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="h-full px-6 flex items-center justify-between">
              {/* Breadcrumb */}
              <Breadcrumb className="hidden sm:flex" />
              
              {/* Mobile menu button */}
              <button
                onClick={handleToggleSidebar}
                className="lg:hidden p-2 hover:bg-accent rounded-lg"
                data-testid="mobile-menu-toggle"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {/* Right side actions */}
              <div className="flex items-center gap-4">
                {/* Add notification bell, search, etc. here */}
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">Loading page...</p>
                  </div>
                </div>
              }
            >
              {children}
            </Suspense>
          </main>
        </div>

        {/* Mobile Sidebar Overlay */}
        {!sidebarCollapsed && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={handleToggleSidebar}
            data-testid="sidebar-overlay"
          />
        )}
      </RouteGuard>
    </div>
  );
}