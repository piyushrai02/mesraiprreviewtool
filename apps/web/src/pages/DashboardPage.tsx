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
    <div className="space-y-6" data-testid="dashboard-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your code review activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <Badge variant="secondary" className="mt-2 text-xs">
                  {stat.trend}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>
              Latest code reviews that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{review.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.repo} • by {review.author} • {review.time}
                    </p>
                  </div>
                  <Badge
                    variant={
                      review.status === 'approved' ? 'default' :
                      review.status === 'pending' ? 'secondary' :
                      'destructive'
                    }
                  >
                    {review.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full p-3 h-auto flex flex-col items-start">
              <div className="font-medium">Start New Review</div>
              <div className="text-sm text-muted-foreground">Review pending pull requests</div>
            </Button>
            <Button variant="outline" className="w-full p-3 h-auto flex flex-col items-start">
              <div className="font-medium">Connect Repository</div>
              <div className="text-sm text-muted-foreground">Add a new GitHub repository</div>
            </Button>
            <Button variant="outline" className="w-full p-3 h-auto flex flex-col items-start">
              <div className="font-medium">View Analytics</div>
              <div className="text-sm text-muted-foreground">Check team performance metrics</div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}