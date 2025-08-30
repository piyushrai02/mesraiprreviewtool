/**
 * Professional Navigation Components
 * Enterprise-grade navigation with advanced animations and styling
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavItem } from '@shared/index';

export interface ProfessionalNavItemProps {
  item: NavItem;
  isActive?: boolean;
  level?: number;
  collapsed?: boolean;
  onClick?: () => void;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  index?: number;
}

export function ProfessionalNavItem({
  item,
  isActive = false,
  level = 0,
  collapsed = false,
  onClick,
  onToggleExpand,
  isExpanded = false,
  index = 0,
}: ProfessionalNavItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const [isHovered, setIsHovered] = useState(false);
  
  // Get icon component dynamically
  const IconComponent = item.icon ? (Icons[item.icon as keyof typeof Icons] as LucideIcon) : null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (hasChildren && onToggleExpand) {
      onToggleExpand();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div 
      className="relative group"
      style={{ 
        animationDelay: `${index * 50}ms`,
        animation: 'slideInLeft 0.4s ease-out forwards'
      }}
    >
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out group',
          'hover:scale-[1.02] active:scale-[0.98]',
          isActive 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-gray-100',
          collapsed && 'justify-center px-3',
          level > 0 && 'ml-4'
        )}
        data-testid={`nav-item-${item.id}`}
        title={collapsed ? item.label : undefined}
      >
        {/* Animated background glow effect */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-xl blur-sm animate-pulse" />
        )}
        
        {/* Hover effect overlay */}
        <div className={cn(
          'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300',
          isActive 
            ? 'bg-white/10' 
            : 'bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-blue-900/20'
        )} />
        
        {/* Icon with enhanced styling */}
        {IconComponent && (
          <div className={cn(
            'relative flex-shrink-0 transition-all duration-300',
            isActive && 'drop-shadow-sm',
            collapsed ? 'w-6 h-6' : 'w-5 h-5',
            isHovered && 'scale-110'
          )}>
            <IconComponent 
              className={cn(
                'w-full h-full transition-all duration-300',
                isActive && 'text-white',
                isHovered && !isActive && 'text-blue-500'
              )} 
            />
          </div>
        )}

        {/* Label and Badge */}
        {!collapsed && (
          <>
            <span className={cn(
              'flex-1 text-left truncate transition-all duration-300 relative z-10',
              isActive && 'font-semibold text-white',
              isHovered && !isActive && 'font-medium'
            )}>
              {item.label}
            </span>
            
            {/* Modern Badge */}
            {item.badge && (
              <div className={cn(
                'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold transition-all duration-300',
                isActive 
                  ? 'bg-white/20 text-white border border-white/30' 
                  : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
                isHovered && 'scale-105'
              )}>
                {item.badge}
              </div>
            )}

            {/* Enhanced Expand/Collapse Icon */}
            {hasChildren && (
              <div className="ml-2 relative">
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300',
                  'hover:bg-white/10 group-hover:scale-110',
                  isActive && 'text-white'
                )}>
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 transition-transform duration-300" />
                  ) : (
                    <ChevronRight className="w-3 h-3 transition-transform duration-300" />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </button>

      {/* Enhanced Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-white via-white to-white/70 rounded-r-full shadow-lg animate-pulse" />
      )}

      {/* Subtle Border for Collapsed State */}
      {collapsed && (
        <div className={cn(
          'absolute inset-0 rounded-xl border transition-all duration-300',
          isActive 
            ? 'border-white/30 shadow-lg shadow-blue-500/25' 
            : 'border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-700'
        )} />
      )}
    </div>
  );
}

export interface ProfessionalSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  navigationItems: NavItem[];
}

export function ProfessionalSidebar({ 
  className, 
  collapsed = false, 
  onToggleCollapse,
  navigationItems 
}: ProfessionalSidebarProps) {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['dashboard']));

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const isPathActive = (path: string): boolean => {
    return location === path || location.startsWith(path + '/');
  };

  const renderNavItem = (item: NavItem, level: number = 0, index: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = isPathActive(item.path);
    const hasActiveChild = hasChildren && item.children?.some(child => isPathActive(child.path));

    return (
      <div key={item.id} className="relative">
        <ProfessionalNavItem
          item={item}
          isActive={isActive || hasActiveChild}
          level={level}
          collapsed={collapsed}
          index={index}
          onClick={() => {
            if (!hasChildren && item.path) {
              // Navigate to path (implement navigation logic)
              window.location.href = item.path;
            }
          }}
          onToggleExpand={hasChildren ? () => toggleExpanded(item.id) : undefined}
          isExpanded={isExpanded}
        />
        
        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-4 border-l border-gray-200 dark:border-gray-700 pl-4 mt-2 space-y-1">
            {item.children?.map((child, childIndex) => renderNavItem(child, level + 1, childIndex))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'flex flex-col backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-r border-gray-200/50 dark:border-gray-700/50 transition-all duration-500 ease-in-out',
        collapsed ? 'w-16' : 'w-72',
        'shadow-2xl shadow-gray-900/10',
        className
      )}
      data-testid="professional-sidebar"
    >
      {/* Header with enhanced gradient */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group hover:scale-110 transition-transform duration-300">
            <span className="text-white font-bold text-lg">M</span>
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          {!collapsed && (
            <div className="animate-in slide-in-from-left duration-300">
              <h1 className="font-bold text-xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                Mesrai AI
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Review Tool</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation with staggered animations */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {navigationItems.map((item, index) => renderNavItem(item, 0, index))}
        </div>
      </nav>

      {/* Advanced Collapse Toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className={cn(
            'absolute -right-4 top-24 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:scale-110 active:scale-95',
            'hidden lg:flex group border-2 border-white dark:border-gray-900'
          )}
          data-testid="sidebar-toggle"
        >
          <ChevronRight
            className={cn(
              'w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110',
              collapsed ? 'rotate-0' : 'rotate-180'
            )}
          />
        </button>
      )}
    </aside>
  );
}