/**
 * User Menu Component
 * @fileoverview Dropdown menu for authenticated users
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, Settings, ChevronDown, Crown, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../../providers/AuthProvider';

interface UserMenuProps {
  collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  const { user, isLoading, logout } = useAuth();
  
  // Enhanced user display data
  const displayUser = user ? {
    username: user.username || 'User',
    email: user.email || 'user@example.com',
    avatarUrl: user.avatarUrl,
    role: 'Lead Developer',
    plan: 'Pro Plan'
  } : null;
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
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  if (!displayUser) {
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
              {displayUser.username}
            </p>
            <div className="badge-primary text-xs">
              {displayUser.plan}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {displayUser.role}
          </p>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-floating py-2 z-50 overflow-hidden"
          >
            {/* Enhanced background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-card/90 to-background/80" />
            
            {/* Header with enhanced user info */}
            <div className="relative px-4 py-3 border-b border-border/30 bg-gradient-primary/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow">
                  <Crown className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {displayUser.username}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {displayUser.email}
                  </p>
                </div>
                <div className="ml-auto badge-success text-xs">
                  {displayUser.plan}
                </div>
              </div>
            </div>
            
            {/* Menu items with animations */}
            <div className="relative py-2">
              <motion.button
                onClick={() => setIsOpen(false)}
                className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-accent/50 transition-colors group"
                data-testid="button-profile"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <User className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
                </motion.div>
                Profile Settings
              </motion.button>
              
              <motion.button
                onClick={() => setIsOpen(false)}
                className="flex items-center w-full px-4 py-3 text-sm text-foreground hover:bg-accent/50 transition-colors group"
                data-testid="button-settings"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Settings className="w-4 h-4 mr-3 text-muted-foreground group-hover:text-primary" />
                </motion.div>
                Account Settings
              </motion.button>
            </div>

            {/* Logout with enhanced styling */}
            <div className="relative border-t border-border/30 py-2 bg-destructive/5">
              <motion.button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors group"
                data-testid="button-logout"
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div
                  whileHover={{ x: 2, rotate: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <LogOut className="w-4 h-4 mr-3" />
                </motion.div>
                Sign Out
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}