/**
 * Repository List Item Component
 * @fileoverview CodeRabbit-inspired individual repository display
 */

// Local Repository type definition
interface Repository {
  id: string;
  name: string;
  owner: string;
  status: 'active' | 'inactive' | 'paused';
  pullRequestCount: number;
  codeHealthScore: number;
  lastReviewDate: string;
}
import { GitBranch, Clock, ExternalLink } from 'lucide-react';

interface RepositoryListItemProps {
  /** Repository data to display */
  repository: Repository;
}

/**
 * Status indicator with dot and label
 */
function StatusIndicator({ status }: { status: Repository['status'] }) {
  const statusConfig = {
    active: {
      dotColor: 'bg-green-500',
      label: 'Active',
      textColor: 'text-green-700 dark:text-green-400'
    },
    inactive: {
      dotColor: 'bg-red-500',
      label: 'Inactive',
      textColor: 'text-red-700 dark:text-red-400'
    },
    paused: {
      dotColor: 'bg-yellow-500',
      label: 'Paused',
      textColor: 'text-yellow-700 dark:text-yellow-400'
    }
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${config.dotColor}`}></div>
      <span className={`text-sm font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
}

/**
 * Health score with progress ring
 */
function HealthScore({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted opacity-20"
          />
          <circle
            cx="16"
            cy="16"
            r="12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={`${(score * 75.4) / 100} 75.4`}
            className={getScoreColor(score)}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Professional repository list item with CodeRabbit-style layout
 * Hover effects and clean information display
 */
export function RepositoryListItem({ repository }: RepositoryListItemProps) {
  return (
    <div className="group p-6 hover:bg-accent/30 transition-colors cursor-pointer">
      <div className="flex items-center justify-between">
        {/* Repository info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                <GitBranch className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-semibold text-foreground truncate">
                  {repository.name.split('/')[1]}
                </h3>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {repository.owner}
              </p>
            </div>
          </div>
          
          {/* Metrics row */}
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">PRs:</span>
              <span className="font-medium text-foreground">{repository.pullRequestCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{repository.lastReviewDate}</span>
            </div>
          </div>
        </div>

        {/* Status and health */}
        <div className="flex items-center space-x-6">
          <StatusIndicator status={repository.status} />
          <div className="text-right">
            <p className="text-xs text-muted-foreground mb-1">Health Score</p>
            <HealthScore score={repository.codeHealthScore} />
          </div>
        </div>
      </div>
    </div>
  );
}