import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@shared/index';
import { useNavigation } from '../../providers/NavigationProvider';

interface BreadcrumbProps {
  className?: string;
  maxItems?: number;
}

export function Breadcrumb({ className, maxItems = 5 }: BreadcrumbProps) {
  const { state, navigate } = useNavigation();
  const { breadcrumbs } = state;

  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  // Truncate breadcrumbs if they exceed maxItems
  const displayBreadcrumbs = breadcrumbs.length > maxItems 
    ? [
        breadcrumbs[0], 
        { label: '...', path: undefined },
        ...breadcrumbs.slice(-(maxItems - 2))
      ]
    : breadcrumbs;

  const handleBreadcrumbClick = (item: BreadcrumbItem) => {
    if (item.path && item.path !== state.currentPath) {
      navigate(item.path);
    }
  };

  return (
    <nav 
      className={cn('flex items-center space-x-1 text-sm', className)}
      data-testid="breadcrumb"
      aria-label="Breadcrumb"
    >
      {displayBreadcrumbs.map((item, index) => {
        const isLast = index === displayBreadcrumbs.length - 1;
        const isClickable = item.path && !isLast;
        const IconComponent = item.icon ? (Icons[item.icon as keyof typeof Icons] as React.ComponentType<any>) : null;

        return (
          <React.Fragment key={`${item.label}-${index}`}>
            <div className="flex items-center gap-1">
              {/* Icon */}
              {IconComponent && (
                <IconComponent className="w-4 h-4 text-muted-foreground" />
              )}

              {/* Breadcrumb Item */}
              {isClickable ? (
                <button
                  onClick={() => handleBreadcrumbClick(item)}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium"
                  data-testid={`breadcrumb-${index}`}
                >
                  {item.label}
                </button>
              ) : (
                <span 
                  className={cn(
                    'font-medium',
                    isLast ? 'text-foreground' : 'text-muted-foreground'
                  )}
                  data-testid={`breadcrumb-${index}`}
                >
                  {item.label}
                </span>
              )}
            </div>

            {/* Separator */}
            {!isLast && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}