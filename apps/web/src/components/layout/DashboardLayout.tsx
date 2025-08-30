/**
 * Dashboard Layout Component
 * @fileoverview Main layout wrapper for dashboard pages
 */

'use client';

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  /** Child components to render in main content area */
  children: React.ReactNode;
}

/**
 * Professional dashboard layout with responsive sidebar
 * Manages mobile sidebar state and provides consistent layout structure
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-zinc-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}