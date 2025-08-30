/**
 * Professional Application Sidebar
 * @fileoverview Enterprise-grade sidebar navigation component
 */

import { useState } from 'react';
import { 
  LayoutDashboard, 
  GitPullRequest, 
  BarChart3, 
  Settings, 
  Bot,
  ChevronLeft,
  ChevronRight,
  Github,
  Bell,
  Users,
  Zap
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isActive?: boolean;
  badge?: number;
}

interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    title: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        isActive: true
      },
      {
        id: 'pull-requests',
        label: 'Pull Requests',
        icon: GitPullRequest,
        href: '/pull-requests',
        badge: 12
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        href: '/analytics'
      }
    ]
  },
  {
    title: 'Management',
    items: [
      {
        id: 'repositories',
        label: 'Repositories',
        icon: Github,
        href: '/repositories'
      },
      {
        id: 'team',
        label: 'Team',
        icon: Users,
        href: '/team'
      },
      {
        id: 'integrations',
        label: 'Integrations',
        icon: Zap,
        href: '/integrations'
      }
    ]
  },
  {
    title: 'System',
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        href: '/notifications',
        badge: 3
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        href: '/settings'
      }
    ]
  }
];

interface AppSidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export function AppSidebar({ isCollapsed = false, onToggleCollapse }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(isCollapsed);

  const handleToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    onToggleCollapse?.(newCollapsed);
  };

  return (
    <div className={`
      h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 
      transition-all duration-300 flex flex-col
      ${collapsed ? 'w-16' : 'w-64'}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
        <div className={`flex items-center space-x-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Mesrai AI</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Code Reviews</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={handleToggle}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Collapse button when collapsed */}
      {collapsed && (
        <div className="p-2">
          <button
            onClick={handleToggle}
            className="w-full p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {navigationGroups.map((group) => (
          <div key={group.title}>
            {!collapsed && (
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                {group.title}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`
                      ${item.isActive ? 'nav-item-active' : 'nav-item-inactive'}
                      ${collapsed ? 'justify-center px-2' : 'justify-between'}
                    `}
                  >
                    <div className="flex items-center">
                      <Icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                    {!collapsed && item.badge && (
                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
        <div className={`bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 ${collapsed ? 'text-center' : ''}`}>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            {!collapsed && (
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">All Systems Operational</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: 2 min ago</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}