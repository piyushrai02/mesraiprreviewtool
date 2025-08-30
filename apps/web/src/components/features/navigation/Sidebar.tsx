import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavItem } from '@shared/index';
import { MAIN_NAVIGATION } from '../../../config/navigation.config';
import { useNavigation } from '../../providers/NavigationProvider';
import { NavigationItem } from './NavigationItem';
import { UserMenu } from '../auth/UserMenu';

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ className, collapsed = false, onToggleCollapse }: SidebarProps) {
  const [location] = useLocation();
  const { navigate } = useNavigation();
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

  const renderNavItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = isPathActive(item.path);
    const hasActiveChild = hasChildren && item.children?.some(child => isPathActive(child.path));

    return (
      <div key={item.id} className="relative">
        <NavigationItem
          item={item}
          isActive={isActive || hasActiveChild}
          level={level}
          collapsed={collapsed}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              navigate(item.path);
            }
          }}
          onToggleExpand={hasChildren ? () => toggleExpanded(item.id) : undefined}
          isExpanded={isExpanded}
        />
        
        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-4 border-l border-border/50">
            {item.children?.map(child => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'flex flex-col glass border-r border-border/30 transition-all duration-500 ease-in-out backdrop-blur-xl animate-fade-in',
        collapsed ? 'w-16' : 'w-72',
        'bg-gradient-to-b from-background/95 via-background/90 to-background/95',
        className
      )}
      data-testid="sidebar"
    >
      {/* Header with gradient */}
      <div className="p-6 border-b border-border/30 bg-gradient-primary/5">
        <div className="flex items-center gap-4">
          <div className="relative w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow animate-scale-in">
            <span className="text-primary-foreground font-bold text-lg">M</span>
            <div className="absolute inset-0 bg-white/20 rounded-xl animate-pulse opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          {!collapsed && (
            <div className="animate-slide-up">
              <h1 className="font-bold text-lg text-gradient">Mesrai AI</h1>
              <p className="text-sm text-muted-foreground font-medium">Review Tool</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation with advanced styling */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        <div className="space-y-1">
          {MAIN_NAVIGATION.map(item => renderNavItem(item))}
        </div>
      </nav>

      {/* User Menu with glass effect */}
      <div className="p-4 border-t border-border/30 glass">
        <UserMenu collapsed={collapsed} />
      </div>

      {/* Advanced Collapse Toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className={cn(
            'absolute -right-4 top-24 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow hover:shadow-floating transition-all duration-300 hover:scale-110 active:scale-95',
            'hidden lg:flex group border-2 border-white/20'
          )}
          data-testid="sidebar-toggle"
        >
          <ChevronRight
            className={cn(
              'w-4 h-4 text-primary-foreground transition-transform duration-300 group-hover:scale-110',
              collapsed ? 'rotate-0' : 'rotate-180'
            )}
          />
        </button>
      )}
    </aside>
  );
}