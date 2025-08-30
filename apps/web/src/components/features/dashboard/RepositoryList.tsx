/**
 * Repository List Component
 * @fileoverview Container for displaying list of repositories
 */

import { Repository } from '@mesrai/shared';
import { RepositoryListItem } from './RepositoryListItem';

interface RepositoryListProps {
  /** Array of repositories to display */
  repositories: Repository[];
}

/**
 * Table header component for repository list
 */
function RepositoryListHeader() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 py-3 border-b border-gray-200 dark:border-zinc-700">
      <div className="col-span-2 md:col-span-1">
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Repository
        </h4>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Status
        </h4>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          PRs
        </h4>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Health Score
        </h4>
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Last Review
        </h4>
      </div>
    </div>
  );
}

/**
 * Professional repository list component
 * Displays repositories in a clean table-like layout with responsive design
 */
export function RepositoryList({ repositories }: RepositoryListProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-gray-200 dark:border-zinc-700">
      <div className="px-6 py-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Repository Overview
        </h2>
        
        {/* Header */}
        <RepositoryListHeader />
        
        {/* Repository items */}
        <div className="divide-y divide-gray-200 dark:divide-zinc-700">
          {repositories.map((repository) => (
            <RepositoryListItem key={repository.id} repository={repository} />
          ))}
        </div>
        
        {/* Empty state */}
        {repositories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No repositories found</p>
          </div>
        )}
      </div>
    </div>
  );
}