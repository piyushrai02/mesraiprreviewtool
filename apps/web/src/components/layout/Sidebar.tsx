/**
 * Sidebar Navigation Component
 * @fileoverview Professional sidebar navigation for Mesrai AI Review Tool
 */

import { LayoutDashboard, Github, BarChart, Settings, X, Bot } from 'lucide-react';

interface SidebarProps {
  /** Whether sidebar is open on mobile */
  isOpen?: boolean;
  /** Callback to toggle sidebar */
  onToggle?: () => void;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current: boolean;
  badge?: string;
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '#', icon: LayoutDashboard, current: true },
  { name: 'Pull Requests', href: '#', icon: Github, current: false, badge: '12' },
  { name: 'Analytics', href: '#', icon: BarChart, current: false },
  { name: 'Settings', href: '#', icon: Settings, current: false },
];

/**
 * CodeRabbit-inspired professional sidebar navigation
 * Clean design with proper spacing and hover states
 */
export function Sidebar({ isOpen = false, onToggle }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">Mesrai AI</h1>
                <p className="text-xs text-muted-foreground">Code Reviews</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="md:hidden p-1 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`
                    group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${item.current
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }
                  `}
                  aria-current={item.current ? 'page' : undefined}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span className={`
                      inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full
                      ${item.current 
                        ? 'bg-primary-foreground/20 text-primary-foreground' 
                        : 'bg-primary text-primary-foreground'
                      }
                    `}>
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Status indicator */}
          <div className="px-3 pb-4">
            <div className="bg-accent rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-foreground">System Online</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">All services operational</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">© 2025 Mesrai AI</p>
          </div>
        </div>
      </div>
    </>
  );
}