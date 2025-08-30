/**
 * User Menu Component
 * @fileoverview Dropdown menu for authenticated users
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Settings, ChevronDown, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserMenuProps {
  collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  const user = { 
    username: 'Alex Johnson', 
    email: 'alex@mesrai.ai', 
    avatarUrl: null,
    role: 'Lead Developer',
    plan: 'Pro Plan'
  };
  const isLoading = false;
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    // Logout logic would go here
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (collapsed) {
    return (
      <motion.div 
        className="flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div 
          className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow relative overflow-hidden"
          animate={{
            boxShadow: [
              '0 0 0 0 hsl(var(--primary) / 0)',
              '0 0 0 4px hsl(var(--primary) / 0.1)',
              '0 0 0 0 hsl(var(--primary) / 0)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Crown className="w-5 h-5 text-primary-foreground" />
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: [-100, 100] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-3 w-full rounded-xl glass border border-border/30 hover:border-primary/20 transition-all duration-300 group"
        data-testid="button-user-menu"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative">
          <motion.div
            className="w-10 h-10 bg-gradient-primary rounded-full border-2 border-primary/20 shadow-glow overflow-hidden"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-full h-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
              <Crown className="w-5 h-5 text-primary-foreground" />
            </div>
          </motion.div>
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-2 h-2 text-success-foreground" />
          </motion.div>
        </div>
        
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {user.username}
            </p>
            <div className="badge-primary text-xs">
              {user.plan}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {user.role}
          </p>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </motion.div>
      </motion.button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-2 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user.username}
            </p>
            {user.email && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              data-testid="button-profile"
            >
              <User className="w-4 h-4 mr-3" />
              Profile
            </button>
            
            <button
              className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              data-testid="button-settings"
            >
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </button>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-200 dark:border-slate-700 py-2">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}