import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  GitBranch, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight,
  Calendar,
  Filter,
  Plus
} from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Active Reviews',
      value: '12',
      description: 'Pending code reviews',
      icon: MessageSquare,
      trend: '+2 from yesterday',
      change: '+16.7%',
      positive: true
    },
    {
      title: 'Connected Repos',
      value: '8',
      description: 'GitHub repositories',
      icon: GitBranch,
      trend: '+1 this week',
      change: '+12.5%',
      positive: true
    },
    {
      title: 'Team Members',
      value: '24',
      description: 'Active reviewers',
      icon: Users,
      trend: '+3 this month',
      change: '+14.3%',
      positive: true
    },
    {
      title: 'Review Score',
      value: '94%',
      description: 'Average quality score',
      icon: BarChart3,
      trend: '+5% improvement',
      change: '+5.3%',
      positive: true
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8" data-testid="dashboard-page">
      {/* Modern Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Welcome back! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your code reviews today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Last 7 days
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Review
          </Button>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="transition-all hover:shadow-md">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                    <span className="text-emerald-500">{stat.change}</span>
                    <span className="ml-1">{stat.description}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest code review activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'review', repo: 'auth-service', time: '2 hours ago' },
                { type: 'merge', repo: 'user-dashboard', time: '4 hours ago' },
                { type: 'comment', repo: 'api-gateway', time: '6 hours ago' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.type === 'review' && 'Review completed'}
                      {activity.type === 'merge' && 'Pull request merged'}
                      {activity.type === 'comment' && 'Comment added'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.repo} • {activity.time}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="ghost">
              <Plus className="mr-2 h-4 w-4" />
              Start New Review
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <GitBranch className="mr-2 h-4 w-4" />
              Connect Repository
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <Users className="mr-2 h-4 w-4" />
              Invite Team Member
            </Button>
            <Button className="w-full justify-start" variant="ghost">
              <BarChart3 className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}