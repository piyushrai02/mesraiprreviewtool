/**
 * Statistics Card Component
 * @fileoverview Display card for dashboard statistics
 */

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  /** Display title for the statistic */
  title: string;
  /** Formatted value to display */
  value: string;
  /** Icon component */
  icon: LucideIcon;
}

/**
 * Professional statistics card component
 * Displays key metrics with icons in a clean card layout
 */
export function StatCard({ title, value, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-zinc-700 transition-colors duration-200">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}