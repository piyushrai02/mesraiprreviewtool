/**
 * User Menu Component
 * @fileoverview Dropdown menu for authenticated users
 */

import { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';

export function UserMenu() {
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        data-testid="button-user-menu"
      >
        <img
          src={user.avatarUrl || `https://github.com/identicons/${user.username}.png`}
          alt={user.username}
          className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600"
          onError={(e) => {
            e.currentTarget.src = `https://github.com/identicons/${user.username}.png`;
          }}
        />
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
            {user.username}
          </p>
          {user.email && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32">
              {user.email}
            </p>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.username}
            </p>
            {user.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              data-testid="button-profile"
            >
              <User className="w-4 h-4 mr-3" />
              Profile
            </button>
            
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 dark:border-slate-700 py-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}