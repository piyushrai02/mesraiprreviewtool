import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, GitBranch, MessageSquare } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Active Reviews',
      value: '12',
      description: 'Pending code reviews',
      icon: MessageSquare,
      trend: '+2 from yesterday',
    },
    {
      title: 'Connected Repos',
      value: '8',
      description: 'GitHub repositories',
      icon: GitBranch,
      trend: '+1 this week',
    },
    {
      title: 'Team Members',
      value: '24',
      description: 'Active reviewers',
      icon: Users,
      trend: '+3 this month',
    },
    {
      title: 'Review Score',
      value: '94%',
      description: 'Average quality score',
      icon: BarChart3,
      trend: '+5% improvement',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in" data-testid="dashboard-page">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-gradient">Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Welcome back! Here's an overview of your code review activity.
        </p>
      </div>

      {/* Stats Grid with Advanced Design */}
      <div className="grid-dashboard">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className="card-modern hover:shadow-glow group animate-slide-up"
              data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative p-2 bg-gradient-primary/10 rounded-lg border border-primary/20 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  {stat.value}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="badge-success">
                    {stat.trend}
                  </div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity with Advanced Layout */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 card-modern animate-slide-up" style={{ animationDelay: '400ms' }}>
          <CardHeader className="border-b border-border/30">
            <CardTitle className="text-xl font-bold">Recent Reviews</CardTitle>
            <CardDescription className="text-base">
              Latest code reviews that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {[
                {
                  title: 'Feature: Add user authentication',
                  repo: 'frontend-app',
                  author: 'john.doe',
                  status: 'pending',
                  time: '2 hours ago',
                },
                {
                  title: 'Fix: Resolve memory leak in data processing',
                  repo: 'backend-api',
                  author: 'jane.smith',
                  status: 'approved',
                  time: '4 hours ago',
                },
                {
                  title: 'Refactor: Optimize database queries',
                  repo: 'data-service',
                  author: 'mike.wilson',
                  status: 'changes-requested',
                  time: '6 hours ago',
                },
              ].map((review, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors duration-200 group">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{review.title}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">{review.repo}</span> • by {review.author} • {review.time}
                    </p>
                  </div>
                  <div className={`badge-${
                    review.status === 'approved' ? 'success' :
                    review.status === 'pending' ? 'warning' :
                    'destructive'
                  }`}>
                    {review.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 card-modern animate-slide-up" style={{ animationDelay: '500ms' }}>
          <CardHeader className="border-b border-border/30">
            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
            <CardDescription className="text-base">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <button className="btn-primary w-full">
              <MessageSquare className="w-4 h-4" />
              Start New Review
            </button>
            <button className="btn-secondary w-full">
              <GitBranch className="w-4 h-4" />
              Connect Repository
            </button>
            <button className="btn-secondary w-full">
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}