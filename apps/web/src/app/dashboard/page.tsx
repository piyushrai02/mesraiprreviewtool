/**
 * Professional Dashboard Page
 * @fileoverview Main dashboard with enterprise-grade layout and components
 */

import { useState } from 'react';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppHeader } from '../../components/layout/AppHeader';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { RecentActivity } from '../../components/dashboard/RecentActivity';
import { 
  GitPullRequest, 
  Users, 
  CheckCircle2, 
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Clock,
  Code
} from 'lucide-react';

export default function DashboardPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const statsData = [
    {
      title: 'Active Reviews',
      value: 24,
      change: { value: '+12%', type: 'increase' as const },
      icon: GitPullRequest,
      subtitle: '8 pending approval'
    },
    {
      title: 'Team Members',
      value: 16,
      change: { value: '+2', type: 'increase' as const },
      icon: Users,
      subtitle: '4 reviewers online'
    },
    {
      title: 'Completed Reviews',
      value: 142,
      change: { value: '+23%', type: 'increase' as const },
      icon: CheckCircle2,
      subtitle: 'This month'
    },
    {
      title: 'Issues Found',
      value: 38,
      change: { value: '-15%', type: 'decrease' as const },
      icon: AlertTriangle,
      subtitle: 'Critical: 3, Medium: 35'
    }
  ];

  return (
    <div className="h-screen w-full bg-gray-50 dark:bg-slate-900 flex overflow-hidden">
      {/* Sidebar */}
      <AppSidebar 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <AppHeader 
          title="Dashboard"
          subtitle="Overview of your code review activities"
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container-responsive py-3 md:py-4 space-y-4 md:space-y-6">
            {/* Stats Grid */}
            <div className="grid-responsive-stats">
              {statsData.map((stat, index) => (
                <StatsCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  icon={stat.icon}
                  subtitle={stat.subtitle}
                />
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid-responsive-main">
              {/* Performance Chart */}
              <div className="xl:col-span-2 card">
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h3 className="text-responsive-lg font-semibold text-gray-900 dark:text-white">Review Performance</h3>
                      <p className="text-responsive-sm text-gray-500 dark:text-gray-400">Weekly review completion trends</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                      <span className="text-responsive-sm font-medium text-gray-900 dark:text-white">Last 30 days</span>
                    </div>
                  </div>
                </div>
                
                {/* Chart Placeholder */}
                <div className="p-4 md:p-6">
                  <div className="h-48 md:h-64 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 md:w-12 md:h-12 text-blue-600 dark:text-blue-400 mx-auto mb-3 md:mb-4" />
                      <p className="text-responsive-base font-medium text-gray-900 dark:text-white">Performance Chart</p>
                      <p className="text-responsive-sm text-gray-500 dark:text-gray-400">Interactive chart will be displayed here</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="card">
                <div className="p-4 md:p-6">
                  <h3 className="text-responsive-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-2 md:space-y-3">
                    <button className="w-full btn-primary justify-start text-left">
                      <GitPullRequest className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 flex-shrink-0" />
                      <span className="truncate">Start New Review</span>
                    </button>
                    <button className="w-full btn-secondary justify-start text-left">
                      <Code className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 flex-shrink-0" />
                      <span className="truncate">View Code Quality</span>
                    </button>
                    <button className="w-full btn-secondary justify-start text-left">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 flex-shrink-0" />
                      <span className="truncate">Review Queue</span>
                    </button>
                    <button className="w-full btn-secondary justify-start text-left">
                      <Users className="w-3 h-3 md:w-4 md:h-4 mr-2 md:mr-3 flex-shrink-0" />
                      <span className="truncate">Team Performance</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Content Grid */}
            <div className="grid-responsive-content">
              <RecentActivity />
              
              {/* Top Repositories */}
              <div className="card">
                <div className="p-4 md:p-6 border-b border-gray-200 dark:border-slate-700">
                  <div>
                    <h3 className="text-responsive-lg font-semibold text-gray-900 dark:text-white">Top Repositories</h3>
                    <p className="text-responsive-sm text-gray-500 dark:text-gray-400">Most active repositories this week</p>
                  </div>
                </div>
                
                <div className="p-4 md:p-6">
                  <div className="space-y-3">
                    {[
                      { name: 'api-gateway', reviews: 12, issues: 3, trend: 'up' },
                      { name: 'frontend-app', reviews: 8, issues: 1, trend: 'up' },
                      { name: 'data-processor', reviews: 6, issues: 5, trend: 'down' },
                      { name: 'auth-service', reviews: 4, issues: 2, trend: 'neutral' }
                    ].map((repo, index) => (
                      <div key={index} className="flex items-center justify-between p-2 md:p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-md transition-colors">
                        <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-200 dark:bg-slate-700 rounded-md flex items-center justify-center flex-shrink-0">
                            <Code className="w-3 h-3 md:w-4 md:h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-responsive-sm font-medium text-gray-900 dark:text-white truncate">{repo.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{repo.reviews} reviews • {repo.issues} issues</p>
                          </div>
                        </div>
                        <div className={`flex items-center space-x-1 text-xs flex-shrink-0 ${
                          repo.trend === 'up' ? 'text-green-600' : 
                          repo.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {repo.trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                           repo.trend === 'down' ? <TrendingUp className="w-3 h-3 rotate-180" /> : 
                           <div className="w-2 h-2 bg-current rounded-full"></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}