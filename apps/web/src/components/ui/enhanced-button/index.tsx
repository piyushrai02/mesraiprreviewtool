/**
 * Enhanced Button Component
 * Professional enterprise-grade button with advanced animations and styling
 */

import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 hover:scale-[1.02] active:scale-[0.98]',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700 hover:scale-[1.02] active:scale-[0.98]',
        outline:
          'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        secondary:
          'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        ghost: 
          'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 hover:scale-[1.02] active:scale-[0.98]',
        link: 
          'text-blue-600 dark:text-blue-400 underline-offset-4 hover:underline hover:text-blue-700 dark:hover:text-blue-300',
        gradient:
          'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]',
        glass:
          'bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 text-gray-900 dark:text-gray-100 hover:bg-white/20 dark:hover:bg-black/20 hover:scale-[1.02] active:scale-[0.98]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-12 rounded-lg px-8',
        xl: 'h-14 rounded-xl px-10 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  glow?: boolean;
}

export const EnhancedButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, glow = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          glow && 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
          loading && 'cursor-not-allowed opacity-70'
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Shimmer effect for enhanced visual appeal */}
        <div className="absolute inset-0 -top-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-300" />
        
        {/* Loading spinner */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {/* Content */}
        <span className={cn('relative z-10 flex items-center gap-2', loading && 'invisible')}>
          {children}
        </span>
      </Comp>
    );
  }
);

EnhancedButton.displayName = 'EnhancedButton';