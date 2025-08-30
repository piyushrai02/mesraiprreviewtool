/**
 * Repository List Component
 * @fileoverview CodeRabbit-inspired professional repository list
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
import { RepositoryListItem } from './RepositoryListItem';
import { Github, Plus } from 'lucide-react';

interface RepositoryListProps {
  /** Array of repositories to display */
  repositories: Repository[];
}

/**
 * Professional repository list with CodeRabbit-style design
 * Clean layout with proper spacing and visual hierarchy
 */
export function RepositoryList({ repositories }: RepositoryListProps) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Github className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Repository Overview</h2>
            <p className="text-sm text-muted-foreground">
              Monitor code health and review activity across {repositories.length} repositories
            </p>
          </div>
        </div>
        <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Connect Repository
        </button>
      </div>
      
      {/* Repository list */}
      <div className="divide-y divide-border">
        {repositories.map((repository) => (
          <RepositoryListItem key={repository.id} repository={repository} />
        ))}
      </div>
      
      {/* Empty state */}
      {repositories.length === 0 && (
        <div className="text-center py-12 px-6">
          <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
            <Github className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No repositories connected</h3>
          <p className="text-muted-foreground mb-4">
            Connect your first repository to start getting AI-powered code reviews
          </p>
          <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Connect Repository
          </button>
        </div>
      )}
    </div>
  );
}