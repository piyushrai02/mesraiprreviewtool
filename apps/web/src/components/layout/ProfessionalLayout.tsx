/**
 * Professional Layout - Matching Reference Design
 * Enterprise-grade layout with blue sidebar and professional styling
 */

import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Home, 
  BarChart3, 
  Users, 
  Package, 
  FileText, 
  Settings, 
  Search,
  Bell,
  ChevronDown,
  Menu,
  MessageSquare,
  Calendar,
  Folder,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EnhancedButton } from '@/components/ui/enhanced-button';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  path: string;
  badge?: string;
}

const navigationItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/professional' },
  { id: 'overview1', label: 'Overview 1', icon: BarChart3, path: '/overview-1' },
  { id: 'overview2', label: 'Overview 2', icon: BarChart3, path: '/overview-2' },
  { id: 'overview3', label: 'Overview 3', icon: BarChart3, path: '/overview-3' },
  { id: 'overview4', label: 'Overview 4', icon: BarChart3, path: '/overview-4' },
  { id: 'menu-layout', label: 'Menu Layout', icon: Menu, path: '/menu-layout' },
  { id: 'inbox', label: 'Inbox', icon: MessageSquare, path: '/inbox' },
  { id: 'file-manager', label: 'File Manager', icon: Folder, path: '/file-manager' },
  { id: 'point-of-sale', label: 'Point of Sale', icon: Package, path: '/pos' },
  { id: 'chat', label: 'Chat', icon: MessageSquare, path: '/chat' },
  { id: 'post', label: 'Post', icon: FileText, path: '/post' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
  { id: 'crud', label: 'Crud', icon: Settings, path: '/crud' },
  { id: 'users', label: 'Users', icon: Users, path: '/users' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  { id: 'pages', label: 'Pages', icon: FileText, path: '/pages' },
];

interface ProfessionalLayoutProps {
  children: React.ReactNode;
}

export function ProfessionalLayout({ children }: ProfessionalLayoutProps) {
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPathActive = (path: string): boolean => {
    return location === path || location.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Professional Sidebar */}
      <aside className="bg-gradient-to-b from-blue-600 to-blue-700 text-white w-64 flex-shrink-0 shadow-2xl">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-blue-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg">R</span>
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">Rubick</h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            const isActive = isPathActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => window.location.href = item.path}
                className={cn(
                  'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive 
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                )}
                style={{ 
                  animationDelay: `${index * 50}ms`,
                  animation: 'slideInLeft 0.4s ease-out forwards'
                }}
                data-testid={`nav-item-${item.id}`}
              >
                <IconComponent className={cn(
                  'w-5 h-5 transition-all duration-200',
                  isActive ? 'text-white' : 'text-blue-200 group-hover:text-white'
                )} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge && (
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            {/* Left side - Breadcrumb */}
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Application</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">Dashboard</span>
            </div>

            {/* Right side - Search, Notifications, Profile */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm w-64"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">JD</span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}