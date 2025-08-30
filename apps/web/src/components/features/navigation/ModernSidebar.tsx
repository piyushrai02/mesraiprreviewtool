import React from 'react';
import { 
  ChartBarIcon,
  DocumentTextIcon,
  FolderIcon,
  ChartPieIcon,
  UserGroupIcon,
  CreditCardIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Badge } from '@/components/ui/badge';
import { UserMenu } from '../auth/UserMenu';

interface NavigationItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive?: boolean;
  badge?: string;
  onClick?: () => void;
}

function NavigationItem({ icon: Icon, label, isActive, badge, onClick }: NavigationItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full
        ${isActive 
          ? 'bg-primary text-primary-foreground' 
          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }
      `}
    >
      <Icon className="h-5 w-5" />
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <Badge variant="secondary" className="ml-auto text-xs">
          {badge}
        </Badge>
      )}
    </button>
  );
}

export function ModernSidebar() {
  const navigationItems = [
    { icon: ChartBarIcon, label: 'Dashboard', isActive: true },
    { icon: DocumentTextIcon, label: 'Pull Requests', badge: '23' },
    { icon: FolderIcon, label: 'Repositories' },
    { icon: ChartPieIcon, label: 'Analytics' },
    { icon: UserGroupIcon, label: 'Team Management' },
    { icon: CreditCardIcon, label: 'Billing' },
    { icon: Cog6ToothIcon, label: 'Settings' }
  ];

  return (
    <div className="flex h-screen w-64 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
          M
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground">Mesrai AI</h1>
          <p className="text-xs text-muted-foreground">PR Reviewer</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => (
          <NavigationItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            isActive={item.isActive}
            badge={item.badge}
          />
        ))}
      </nav>

      {/* User Menu */}
      <div className="border-t border-border p-4">
        <UserMenu />
      </div>
    </div>
  );
}