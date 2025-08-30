/**
 * Repository List Item Component
 * @fileoverview Individual repository row display
 */

import { Repository } from '@mesrai/shared';

interface RepositoryListItemProps {
  /** Repository data to display */
  repository: Repository;
}

/**
 * Status badge component for repository status
 */
function StatusBadge({ status }: { status: Repository['status'] }) {
  const statusConfig = {
    active: {
      className: 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400',
      label: 'Active'
    },
    inactive: {
      className: 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400',
      label: 'Inactive'
    },
    paused: {
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400',
      label: 'Paused'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}

/**
 * Code health score display with color coding
 */
function HealthScore({ score }: { score: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <span className={`font-medium ${getScoreColor(score)}`}>
      {score}%
    </span>
  );
}

/**
 * Professional repository list item component
 * Displays repository information in a clean, responsive grid layout
 */
export function RepositoryListItem({ repository }: RepositoryListItemProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-4 border-b border-gray-200 dark:border-zinc-700 last:border-b-0">
      {/* Repository name and owner */}
      <div className="col-span-2 md:col-span-1">
        <div className="flex flex-col">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {repository.name.split('/')[1]}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {repository.owner}
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <StatusBadge status={repository.status} />
      </div>

      {/* Pull requests count */}
      <div className="flex items-center">
        <span className="text-sm text-gray-900 dark:text-white">
          {repository.pullRequestCount} PRs
        </span>
      </div>

      {/* Health score */}
      <div className="flex items-center">
        <HealthScore score={repository.codeHealthScore} />
      </div>

      {/* Last review date */}
      <div className="flex items-center">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {repository.lastReviewDate}
        </span>
      </div>
    </div>
  );
}