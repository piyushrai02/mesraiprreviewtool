/**
 * Header Component
 * @fileoverview Top navigation header with search and user controls
 */

'use client';

import { Search, Menu, User } from 'lucide-react';
import { ThemeSwitcher } from '../ThemeSwitcher';

interface HeaderProps {
  /** Callback to toggle mobile sidebar */
  onMenuClick?: () => void;
}

/**
 * Professional header component with search and user controls
 * Responsive design with mobile menu trigger
 */
export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-zinc-700">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Mobile menu button and search */}
        <div className="flex items-center flex-1">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-700 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          {/* Search bar */}
          <div className="ml-4 flex-1 max-w-lg">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-zinc-600 rounded-md leading-5 bg-white dark:bg-zinc-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search repositories..."
              />
            </div>
          </div>
        </div>

        {/* Right side - Theme switcher and user menu */}
        <div className="flex items-center space-x-4">
          <ThemeSwitcher />
          
          {/* User avatar/dropdown placeholder */}
          <div className="relative">
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-700">
              <User className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}