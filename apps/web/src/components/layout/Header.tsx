/**
 * Header Component
 * @fileoverview CodeRabbit-inspired professional header with search and controls
 */

import { Search, Menu, Bell, User, Plus } from 'lucide-react';
import { ThemeSwitcher } from '../ThemeSwitcher';

interface HeaderProps {
  /** Callback to toggle mobile sidebar */
  onMenuClick?: () => void;
}

/**
 * Professional header component matching CodeRabbit's clean design
 * Features search, notifications, and user controls
 */
export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Mobile menu and search */}
        <div className="flex items-center flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent md:hidden transition-colors"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Enhanced search bar */}
          <div className="ml-4 flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-4 py-2 bg-accent border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-colors"
                placeholder="Search repositories, PRs, or reviews..."
              />
            </div>
          </div>
        </div>

        {/* Right side - Actions and user controls */}
        <div className="flex items-center space-x-2">
          {/* Quick actions */}
          <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4 mr-2" />
            New Review
          </button>
          
          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {/* Theme switcher */}
          <ThemeSwitcher />
          
          {/* User menu */}
          <div className="relative">
            <button className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-primary-foreground" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}