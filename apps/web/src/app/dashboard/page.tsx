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
    <div className="h-screen w-screen bg-gray-50 dark:bg-slate-900 flex overflow-hidden m-0 p-0">
      {/* Sidebar */}
      <AppSidebar 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AppHeader 
          title="Dashboard"
          subtitle="Overview of your code review activities"
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
            {/* Performance Chart Placeholder */}
            <div className="lg:col-span-2 card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Performance</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Weekly review completion trends</p>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Last 30 days</span>
                </div>
              </div>
              
              {/* Chart Placeholder */}
              <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white">Performance Chart</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Interactive chart will be displayed here</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-primary justify-start">
                  <GitPullRequest className="w-4 h-4 mr-3" />
                  Start New Review
                </button>
                <button className="w-full btn-secondary justify-start">
                  <Code className="w-4 h-4 mr-3" />
                  View Code Quality
                </button>
                <button className="w-full btn-secondary justify-start">
                  <Clock className="w-4 h-4 mr-3" />
                  Review Queue
                </button>
                <button className="w-full btn-secondary justify-start">
                  <Users className="w-4 h-4 mr-3" />
                  Team Performance
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RecentActivity />
            
            {/* Top Repositories */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Repositories</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Most active repositories this week</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'api-gateway', reviews: 12, issues: 3, trend: 'up' },
                  { name: 'frontend-app', reviews: 8, issues: 1, trend: 'up' },
                  { name: 'data-processor', reviews: 6, issues: 5, trend: 'down' },
                  { name: 'auth-service', reviews: 4, issues: 2, trend: 'neutral' }
                ].map((repo, index) => (
                  <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                        <Code className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{repo.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{repo.reviews} reviews • {repo.issues} issues</p>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 text-xs ${
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
        </main>
      </div>
    </div>
  );
}