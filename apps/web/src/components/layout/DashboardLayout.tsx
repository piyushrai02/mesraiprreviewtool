/**
 * Dashboard Layout Component
 * @fileoverview CodeRabbit-inspired professional layout wrapper
 */

import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface DashboardLayoutProps {
  /** Child components to render in main content area */
  children: React.ReactNode;
}

/**
 * Professional dashboard layout matching CodeRabbit's design patterns
 * Clean, responsive layout with proper spacing and visual hierarchy
 */
export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}