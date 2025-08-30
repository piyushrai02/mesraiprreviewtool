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
        'flex flex-col bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
      data-testid="sidebar"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">M</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-semibold text-sm">Mesrai AI</h1>
              <p className="text-xs text-muted-foreground">Review Tool</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {MAIN_NAVIGATION.map(item => renderNavItem(item))}
      </nav>

      {/* User Menu */}
      <div className="p-2 border-t border-border">
        <UserMenu collapsed={collapsed} />
      </div>

      {/* Collapse Toggle */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className={cn(
            'absolute -right-3 top-20 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center shadow-sm hover:bg-accent transition-colors',
            'hidden lg:flex'
          )}
          data-testid="sidebar-toggle"
        >
          <ChevronRight
            className={cn(
              'w-3 h-3 transition-transform',
              collapsed ? 'rotate-0' : 'rotate-180'
            )}
          />
        </button>
      )}
    </aside>
  );
}