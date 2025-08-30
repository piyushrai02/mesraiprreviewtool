import React from 'react';
import { 
  ChartBarIcon, 
  ExclamationTriangleIcon, 
  FolderIcon, 
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { GitBranch } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  changeType: 'positive' | 'negative' | 'neutral';
}

function MetricCard({ title, value, change, icon: Icon, changeType }: MetricCardProps) {
  const changeColor = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400'
  }[changeType];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <p className={`text-xs ${changeColor}`}>
          {change}
        </p>
      </CardContent>
    </Card>
  );
}

interface ActivityItemProps {
  type: 'review' | 'security' | 'repository';
  title: string;
  description: string;
  time: string;
}

function ActivityItem({ type, title, description, time }: ActivityItemProps) {
  const getIcon = () => {
    switch (type) {
      case 'review':
        return <CheckCircleIcon className="h-4 w-4 text-green-400" />;
      case 'security':
        return <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400" />;
      case 'repository':
        return <GitBranch className="h-4 w-4 text-blue-400" />;
      default:
        return <div className="h-2 w-2 bg-blue-400 rounded-full" />;
    }
  };

  return (
    <div className="flex items-center gap-3 py-3">
      {getIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  );
}

export default function DashboardPage() {
  const metrics = [
    {
      title: 'TOTAL REVIEWS',
      value: '0',
      change: '+12% from last month',
      icon: ChartBarIcon,
      changeType: 'positive' as const
    },
    {
      title: 'ISSUES FOUND',
      value: '0',
      change: '-5% from last month',
      icon: ExclamationTriangleIcon,
      changeType: 'positive' as const
    },
    {
      title: 'ACTIVE REPOSITORIES',
      value: '0',
      change: '+2 new this month',
      icon: FolderIcon,
      changeType: 'positive' as const
    },
    {
      title: 'AVG REVIEW TIME',
      value: '0s',
      change: '-15% faster',
      icon: ClockIcon,
      changeType: 'positive' as const
    }
  ];

  const recentActivity = [
    {
      type: 'review' as const,
      title: 'AI Review completed',
      description: 'for feat/user-auth',
      time: '2 minutes ago'
    },
    {
      type: 'security' as const,
      title: 'Security issue detected',
      description: 'in api/auth.ts',
      time: '5 minutes ago'
    },
    {
      type: 'repository' as const,
      title: 'New repository connected',
      description: 'mesrai/backend',
      time: '1 hour ago'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Monitor your AI-powered code reviews and team performance
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-foreground border-border">
              <GitBranch className="mr-2 h-4 w-4" />
              Connect Repository
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Start Review
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              icon={metric.icon}
              changeType={metric.changeType}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent PR Reviews - Takes 2 columns */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent PR Reviews</CardTitle>
              <CardDescription className="text-muted-foreground">
                Latest pull requests awaiting AI-powered analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Pull Requests Found
                </h3>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  No pull requests match your current filters or none have been created yet.
                </p>
                <Button variant="outline" size="sm" className="text-foreground border-border">
                  Connect Repository
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription className="text-muted-foreground">
                Latest reviews and analysis results
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-6">
                {recentActivity.map((activity, index) => (
                  <ActivityItem
                    key={index}
                    type={activity.type}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}