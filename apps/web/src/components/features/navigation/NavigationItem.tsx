import React from 'react';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Link } from 'wouter';

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  badge?: string;
  children?: NavItem[];
}

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
    if (hasChildren && onToggleExpand) {
      e.preventDefault();
      e.stopPropagation();
      onToggleExpand();
    }
  };

  const ItemContent = (
    <>
      {/* Icon with enhanced styling */}
      {IconComponent && (
        <div className={`relative flex-shrink-0 transition-all duration-300 ${isActive ? 'drop-shadow-sm' : ''} ${collapsed ? 'w-6 h-6' : 'w-5 h-5'}`}>
          <IconComponent 
            className={`w-full h-full transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
          />
        </div>
      )}

      {/* Label and Badge */}
      {!collapsed && (
        <>
          <span className={`flex-1 text-left truncate transition-all duration-300 ${isActive ? 'font-semibold' : ''}`}>
            {item.label}
          </span>
          
          {/* Badge */}
          {item.badge && (
            <div className={`px-2 py-1 text-xs rounded-full ${isActive ? 'bg-white/20 text-primary-foreground border-white/30' : 'bg-primary text-primary-foreground'}`}>
              {item.badge}
            </div>
          )}

          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <div className="ml-2 relative">
              <div className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-white/10">
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
    </>
  );

  const baseClasses = `w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'} ${collapsed ? 'justify-center px-3' : ''} ${level > 0 ? 'ml-4' : ''}`;

  return (
    <div className="relative group">
      {hasChildren ? (
        <button
          onClick={handleClick}
          className={baseClasses}
          data-testid={`nav-item-${item.id}`}
          title={collapsed ? item.label : undefined}
        >
          {ItemContent}
        </button>
      ) : (
        <Link 
          href={item.path}
          className={baseClasses}
          data-testid={`nav-item-${item.id}`}
          title={collapsed ? item.label : undefined}
        >
          {ItemContent}
        </Link>
      )}

      {/* Enhanced Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary via-primary to-primary/70 rounded-r-full shadow-glow animate-scale-in" />
      )}
    </div>
  );
}