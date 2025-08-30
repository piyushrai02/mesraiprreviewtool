import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Sparkles, Zap } from 'lucide-react';
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
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        'flex flex-col relative overflow-hidden border-r border-border/30 backdrop-blur-xl',
        collapsed ? 'w-16' : 'w-72',
        'h-full bg-gradient-to-b from-card/80 via-card/60 to-background/40',
        className
      )}
      data-testid="sidebar"
    >
      {/* Animated Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{
            background: [
              'radial-gradient(600px circle at 0% 0%, hsl(var(--primary) / 0.05), transparent 50%)',
              'radial-gradient(600px circle at 100% 100%, hsl(var(--primary) / 0.1), transparent 50%)',
              'radial-gradient(600px circle at 0% 100%, hsl(var(--primary) / 0.05), transparent 50%)'
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />
      </div>

      {/* Header Section with Enhanced Animation */}
      <motion.div 
        className="relative p-6 border-b border-border/30"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {!collapsed ? (
              <motion.div
                key="expanded"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 w-full"
              >
                <div className="relative">
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        '0 0 20px hsl(var(--primary) / 0.3)',
                        '0 0 30px hsl(var(--primary) / 0.5)',
                        '0 0 20px hsl(var(--primary) / 0.3)'
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center"
                  >
                    <Sparkles className="w-5 h-5 text-primary-foreground" />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <motion.h1 
                    className="font-bold text-xl text-gradient"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    Mesrai AI
                  </motion.h1>
                  <motion.p 
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Review Tool
                  </motion.p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto"
              >
                <Zap className="w-5 h-5 text-primary-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Navigation with advanced styling and animations */}
      <nav className="relative flex-1 p-4 space-y-2 overflow-y-auto scrollbar-hide">
        <motion.div 
          className="space-y-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {MAIN_NAVIGATION.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ 
                delay: 0.6 + (index * 0.1), 
                duration: 0.4,
                ease: "easeOut"
              }}
            >
              {renderNavItem(item)}
            </motion.div>
          ))}
        </motion.div>
      </nav>

      {/* User Menu with enhanced animations */}
      <motion.div 
        className="relative p-4 border-t border-border/30 glass"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <UserMenu collapsed={collapsed} />
      </motion.div>

      {/* Advanced Collapse Toggle with animations */}
      {onToggleCollapse && (
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 1.4, duration: 0.4 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleCollapse}
          className={cn(
            'absolute -right-4 top-24 w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow hover:shadow-floating transition-all duration-300',
            'hidden lg:flex group border-2 border-white/20'
          )}
          data-testid="sidebar-toggle"
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight className="w-4 h-4 text-primary-foreground" />
          </motion.div>
        </motion.button>
      )}
    </motion.aside>
  );
}