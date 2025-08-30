/**
 * Sidebar Navigation Component
 * @fileoverview Main navigation sidebar for the dashboard
 */

'use client';

import { LayoutDashboard, Github, BarChart, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  /** Whether sidebar is open on mobile */
  isOpen?: boolean;
  /** Callback to toggle sidebar */
  onToggle?: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '#', icon: LayoutDashboard, current: true },
  { name: 'Repositories', href: '#', icon: Github, current: false },
  { name: 'Analytics', href: '#', icon: BarChart, current: false },
  { name: 'Settings', href: '#', icon: Settings, current: false },
];

/**
 * Professional sidebar navigation component
 * Responsive design with mobile toggle functionality
 */
export function Sidebar({ isOpen = false, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 dark:bg-zinc-950 transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo and mobile close button */}
          <div className="flex items-center justify-between h-16 px-6 bg-gray-900 dark:bg-zinc-900">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-white">Mesrai AI</h1>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="md:hidden text-gray-300 hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${item.current
                      ? 'bg-gray-900 dark:bg-zinc-800 text-white'
                      : 'text-gray-300 dark:text-gray-400 hover:bg-gray-700 dark:hover:bg-zinc-800 hover:text-white'
                    }
                  `}
                  aria-current={item.current ? 'page' : undefined}
                >
                  <Icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700 dark:border-zinc-800">
            <p className="text-xs text-gray-400">© 2025 Mesrai AI</p>
          </div>
        </div>
      </div>
    </>
  );
}