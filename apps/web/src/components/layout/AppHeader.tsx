/**
 * Professional Application Header
 * @fileoverview Enterprise-grade header component with search and user controls
 */

import { Search, Plus, Bell, Menu, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { LoginWithGitHubButton } from '../features/auth/LoginWithGitHubButton';
import { UserMenu } from '../features/auth/UserMenu';

interface AppHeaderProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
}

export function AppHeader({ onMenuClick, title = "Dashboard", subtitle }: AppHeaderProps) {
  const [isDark, setIsDark] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuClick}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4 md:mx-8 hidden sm:block">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Search repositories, pull requests..."
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2">
        {/* Quick Action Button - Only show when authenticated */}
        {isAuthenticated && (
          <button className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Review
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications - Only show when authenticated */}
        {isAuthenticated && (
          <button className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        )}

        {/* Authentication Section */}
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        ) : isAuthenticated ? (
          <UserMenu />
        ) : (
          <LoginWithGitHubButton size="sm" />
        )}
      </div>
    </header>
  );
}