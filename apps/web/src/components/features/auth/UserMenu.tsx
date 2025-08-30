/**
 * Modern User Menu Component
 * @fileoverview Advanced dropdown menu using Radix UI primitives
 */

import { motion } from 'framer-motion';
import { LogOut, User, Settings, Crown, Sparkles, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '../../providers/AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        {!collapsed && (
          <div className="space-y-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-3 w-16 bg-muted rounded animate-pulse" />
          </div>
        )}
      </div>
    );
  }

  if (!displayUser) {
    return null;
  }

  if (collapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg ring-2 ring-primary/20 transition-all hover:scale-105 hover:shadow-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="button-user-menu-collapsed"
          >
            <Crown className="h-4 w-4" />
            <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayUser.username}</p>
              <p className="text-xs leading-none text-muted-foreground">{displayUser.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          className="flex w-full items-center gap-3 rounded-lg p-3 text-left transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          data-testid="button-user-menu"
        >
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage 
              src={displayUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUser.username}`} 
              alt={displayUser.username} 
            />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
              <Crown className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{displayUser.username}</p>
              <Badge variant="secondary" className="text-xs">
                {displayUser.plan}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">{displayUser.role}</p>
          </div>
          
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            <MoreVertical className="h-4 w-4 text-muted-foreground" />
          </div>
        </motion.button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayUser.username}</p>
            <p className="text-xs leading-none text-muted-foreground">{displayUser.email}</p>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline" className="text-xs">
                {displayUser.role}
              </Badge>
              <Badge variant="default" className="text-xs">
                {displayUser.plan}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Account Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleLogout} 
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}