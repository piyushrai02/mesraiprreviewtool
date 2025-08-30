/**
 * Statistics Card Component
 * @fileoverview CodeRabbit-inspired professional stat card
 */

import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  /** Display title for the statistic */
  title: string;
  /** Formatted value to display */
  value: string;
  /** Icon component */
  icon: LucideIcon;
  /** Optional trend indicator */
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

/**
 * Professional statistics card with CodeRabbit-style design
 * Clean typography, proper spacing, and subtle interactions
 */
export function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="group bg-card rounded-xl p-6 border border-border hover:shadow-md transition-all duration-200 hover:border-border/80">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
            {trend && (
              <div className="flex items-center space-x-1">
                <span className={`text-sm font-medium ${
                  trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {trend.isPositive ? '↗' : '↘'} {trend.value}
                </span>
                <span className="text-xs text-muted-foreground">from last week</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}