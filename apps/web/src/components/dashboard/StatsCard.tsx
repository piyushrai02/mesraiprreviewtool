/**
 * Professional Statistics Card Component
 * @fileoverview Enterprise-grade stat card for displaying key metrics
 */

import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatsCard({ title, value, change, icon: Icon, subtitle, trend }: StatsCardProps) {
  const getTrendColor = () => {
    switch (trend || change?.type) {
      case 'increase':
      case 'up':
        return 'text-green-600 dark:text-green-400';
      case 'decrease':
      case 'down':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend || change?.type) {
      case 'increase':
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'decrease':
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-3 md:p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-responsive-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide truncate">
              {title}
            </h3>
          </div>
          {Icon && (
            <div className="p-1.5 md:p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md flex-shrink-0">
              <Icon className="w-3 h-3 md:w-4 md:h-4 text-blue-600 dark:text-blue-400" />
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {subtitle && (
            <p className="text-responsive-sm text-gray-500 dark:text-gray-400 truncate">
              {subtitle}
            </p>
          )}
          
          {change && (
            <div className={`flex items-center space-x-1 text-xs md:text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="font-medium">{change.value}</span>
              <span className="text-gray-500 dark:text-gray-400 hidden sm:inline">vs last period</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}