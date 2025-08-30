/**
 * Recent Activity Component
 * @fileoverview Displays recent code review activities
 */

import { GitPullRequest, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'review' | 'comment' | 'approval' | 'rejection';
  title: string;
  description: string;
  time: string;
  author: {
    name: string;
    avatar?: string;
  };
  repository: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'review',
    title: 'New pull request opened',
    description: 'Add authentication middleware for API routes',
    time: '2 minutes ago',
    author: { name: 'Sarah Chen' },
    repository: 'api-gateway'
  },
  {
    id: '2',
    type: 'approval',
    title: 'Pull request approved',
    description: 'Fix memory leak in data processing pipeline',
    time: '15 minutes ago',
    author: { name: 'Mike Johnson' },
    repository: 'data-processor'
  },
  {
    id: '3',
    type: 'comment',
    title: 'New comment added',
    description: 'Consider using async/await for better error handling',
    time: '1 hour ago',
    author: { name: 'Alex Smith' },
    repository: 'frontend-app'
  },
  {
    id: '4',
    type: 'rejection',
    title: 'Pull request needs changes',
    description: 'Security vulnerabilities found in dependencies',
    time: '2 hours ago',
    author: { name: 'Emma Wilson' },
    repository: 'security-service'
  }
];

export function RecentActivity() {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'review':
        return <GitPullRequest className="w-4 h-4 text-blue-600" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-purple-600" />;
      case 'approval':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejection':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'review':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'comment':
        return 'bg-purple-50 dark:bg-purple-900/20';
      case 'approval':
        return 'bg-green-50 dark:bg-green-900/20';
      case 'rejection':
        return 'bg-red-50 dark:bg-red-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest code review activities</p>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {mockActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
              <div className={`p-2 rounded-lg ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.title}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {activity.description}
                </p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>by {activity.author.name}</span>
                  <span>•</span>
                  <span>{activity.repository}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700">
          <button className="w-full text-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
            View all activity
          </button>
        </div>
      </div>
    </div>
  );
}