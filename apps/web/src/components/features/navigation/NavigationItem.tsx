import React from 'react';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavItem } from '@shared/index';
import { Badge } from '@/components/ui/badge';

interface NavigationItemProps {
  item: NavItem;
  isActive?: boolean;
  level?: number;
  collapsed?: boolean;
  onClick?: () => void;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
}

export function NavigationItem({
  item,
  isActive = false,
  level = 0,
  collapsed = false,
  onClick,
  onToggleExpand,
  isExpanded = false,
}: NavigationItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  
  // Get icon component dynamically
  const IconComponent = item.icon ? (Icons[item.icon as keyof typeof Icons] as LucideIcon) : null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasChildren && onToggleExpand) {
      onToggleExpand();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        className={cn(
          'w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out',
          'hover:scale-[1.02] active:scale-[0.98]',
          isActive 
            ? 'nav-item-active' 
            : 'nav-item-inactive',
          collapsed && 'justify-center px-3',
          level > 0 && 'ml-4'
        )}
        data-testid={`nav-item-${item.id}`}
        title={collapsed ? item.label : undefined}
      >
        {/* Background Glow Effect */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-xl blur-sm" />
        )}
        
        {/* Icon with enhanced styling */}
        {IconComponent && (
          <div className={cn(
            'relative flex-shrink-0 transition-all duration-300',
            isActive && 'drop-shadow-sm',
            collapsed ? 'w-6 h-6' : 'w-5 h-5'
          )}>
            <IconComponent 
              className={cn(
                'w-full h-full transition-all duration-300',
                isActive && 'scale-110'
              )} 
            />
          </div>
        )}

        {/* Label and Badge */}
        {!collapsed && (
          <>
            <span className={cn(
              'flex-1 text-left truncate transition-all duration-300',
              isActive && 'font-semibold'
            )}>
              {item.label}
            </span>
            
            {/* Modern Badge */}
            {item.badge && (
              <div className={cn(
                'badge-modern',
                isActive 
                  ? 'bg-white/20 text-primary-foreground border-white/30' 
                  : 'badge-primary'
              )}>
                {item.badge}
              </div>
            )}

            {/* Enhanced Expand/Collapse Icon */}
            {hasChildren && (
              <div className="ml-2 relative">
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300',
                  'hover:bg-white/10 group-hover:scale-110'
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

        {/* Hover Effect Overlay */}
        <div className={cn(
          'absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          isActive 
            ? 'bg-white/5' 
            : 'bg-accent/50'
        )} />
      </button>

      {/* Enhanced Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary via-primary to-primary/70 rounded-r-full shadow-glow animate-scale-in" />
      )}

      {/* Subtle Border for Collapsed State */}
      {collapsed && (
        <div className={cn(
          'absolute inset-0 rounded-xl border transition-all duration-300',
          isActive 
            ? 'border-primary/30 shadow-glow' 
            : 'border-transparent group-hover:border-border/50'
        )} />
      )}
    </div>
  );
}