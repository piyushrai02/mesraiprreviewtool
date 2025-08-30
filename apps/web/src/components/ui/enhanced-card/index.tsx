/**
 * Enhanced Card Component
 * Professional enterprise-grade card with advanced animations and styling
 */

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { DESIGN_TOKENS } from '@/lib/design-constants';

export interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'gradient';
  hover?: boolean;
  animate?: boolean;
  glow?: boolean;
  children: React.ReactNode;
}

export const EnhancedCard = forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = 'default', hover = true, animate = true, glow = false, children, ...props }, ref) => {
    const baseClasses = 'relative overflow-hidden transition-all duration-300 ease-out';
    
    const variantClasses = {
      default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm',
      elevated: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg',
      glass: 'bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-xl',
      gradient: 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg',
    };

    const hoverClasses = hover ? {
      default: 'hover:shadow-md hover:-translate-y-1',
      elevated: 'hover:shadow-xl hover:-translate-y-2',
      glass: 'hover:bg-white/20 dark:hover:bg-black/20 hover:border-white/30 dark:hover:border-white/20',
      gradient: 'hover:shadow-xl hover:-translate-y-2 hover:from-white hover:to-blue-50 dark:hover:from-gray-700 dark:hover:to-gray-800',
    } : {};

    const animateClasses = animate ? 'animate-in fade-in slide-in-from-bottom-4 duration-500' : '';
    const glowClasses = glow ? 'shadow-[0_0_20px_rgba(59,130,246,0.3)] dark:shadow-[0_0_20px_rgba(59,130,246,0.2)]' : '';

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          hover && hoverClasses[variant],
          animateClasses,
          glowClasses,
          className
        )}
        {...props}
      >
        {/* Gradient overlay for enhanced visual depth */}
        {variant === 'gradient' && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-xl" />
        )}
        
        {/* Hover effect overlay */}
        {hover && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-500/0 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-xl" />
        )}
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);

EnhancedCard.displayName = 'EnhancedCard';

export interface EnhancedCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const EnhancedCardHeader = forwardRef<HTMLDivElement, EnhancedCardHeaderProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6 pb-4', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

EnhancedCardHeader.displayName = 'EnhancedCardHeader';

export interface EnhancedCardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  gradient?: boolean;
}

export const EnhancedCardTitle = forwardRef<HTMLParagraphElement, EnhancedCardTitleProps>(
  ({ className, children, gradient = false, ...props }, ref) => {
    return (
      <h3
        ref={ref}
        className={cn(
          'text-xl font-semibold leading-none tracking-tight',
          gradient && 'bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent',
          className
        )}
        {...props}
      >
        {children}
      </h3>
    );
  }
);

EnhancedCardTitle.displayName = 'EnhancedCardTitle';

export interface EnhancedCardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const EnhancedCardDescription = forwardRef<HTMLParagraphElement, EnhancedCardDescriptionProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn('text-sm text-gray-500 dark:text-gray-400', className)}
        {...props}
      >
        {children}
      </p>
    );
  }
);

EnhancedCardDescription.displayName = 'EnhancedCardDescription';

export interface EnhancedCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const EnhancedCardContent = forwardRef<HTMLDivElement, EnhancedCardContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-6 pt-0', className)} {...props}>
        {children}
      </div>
    );
  }
);

EnhancedCardContent.displayName = 'EnhancedCardContent';

export interface EnhancedCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const EnhancedCardFooter = forwardRef<HTMLDivElement, EnhancedCardFooterProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props}>
        {children}
      </div>
    );
  }
);

EnhancedCardFooter.displayName = 'EnhancedCardFooter';