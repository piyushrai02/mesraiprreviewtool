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
    if (hasChildren && onToggleExpand) {
      onToggleExpand();
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={cn(
          'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          'hover:bg-accent hover:text-accent-foreground',
          isActive && 'bg-accent text-accent-foreground shadow-sm',
          collapsed && 'justify-center px-2',
          level > 0 && 'ml-4'
        )}
        data-testid={`nav-item-${item.id}`}
        title={collapsed ? item.label : undefined}
      >
        {/* Icon */}
        {IconComponent && (
          <IconComponent 
            className={cn(
              'flex-shrink-0 transition-colors',
              collapsed ? 'w-5 h-5' : 'w-4 h-4'
            )} 
          />
        )}

        {/* Label and Badge */}
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">
              {item.label}
            </span>
            
            {/* Badge */}
            {item.badge && (
              <Badge 
                variant="secondary" 
                className="ml-auto text-xs"
                data-testid={`nav-badge-${item.id}`}
              >
                {item.badge}
              </Badge>
            )}

            {/* Expand/Collapse Icon */}
            {hasChildren && (
              <div className="ml-auto">
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            )}
          </>
        )}
      </button>

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />
      )}
    </div>
  );
}