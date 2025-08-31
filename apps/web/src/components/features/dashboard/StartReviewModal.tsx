import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// Note: Using simple HTML select for now - can be upgraded to custom Select component
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Github, ArrowRight, Zap, AlertCircle } from 'lucide-react';

interface Repository {
  id: string;
  githubId: number;
  name: string;
  fullName: string;
  owner: string;
  isPrivate: boolean;
  language?: string;
  defaultBranch: string;
  isActive: boolean;
  lastSyncAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface StartReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositories: Repository[];
  onStartReview: (repositoryId: string, pullRequestNumber?: number) => Promise<void>;
}

export function StartReviewModal({ 
  isOpen, 
  onClose, 
  repositories, 
  onStartReview 
}: StartReviewModalProps) {
  const [selectedRepository, setSelectedRepository] = useState<string>('');
  const [pullRequestNumber, setPullRequestNumber] = useState<string>('');
  const [isStarting, setIsStarting] = useState(false);

  const handleStartReview = async () => {
    if (!selectedRepository) return;

    try {
      setIsStarting(true);
      const prNumber = pullRequestNumber ? parseInt(pullRequestNumber) : undefined;
      await onStartReview(selectedRepository, prNumber);
      onClose();
      setSelectedRepository('');
      setPullRequestNumber('');
    } catch (error) {
      console.error('Failed to start review:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const selectedRepo = repositories.find(r => r.id === selectedRepository);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" data-testid="start-review-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            Start AI Review
          </DialogTitle>
          <DialogDescription>
            Select a repository and optionally specify a pull request to review
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {repositories.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No repositories available. Please connect repositories first.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Repository Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Repository
                </label>
                <select
                  value={selectedRepository}
                  onChange={(e) => setSelectedRepository(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="repository-select"
                >
                  <option value="">Select a repository</option>
                  {repositories.map((repo) => (
                    <option 
                      key={repo.id} 
                      value={repo.id}
                      data-testid={`repository-option-${repo.id}`}
                    >
                      {repo.name} ({repo.owner}) {repo.isPrivate ? '(Private)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Repository Info */}
              {selectedRepo && (
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      {selectedRepo.fullName}
                    </CardTitle>
                    <CardDescription>
                      {selectedRepo.language && (
                        <Badge variant="outline" className="mr-2">{selectedRepo.language}</Badge>
                      )}
                      Default branch: <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs">{selectedRepo.defaultBranch}</code>
                    </CardDescription>
                  </CardHeader>
                </Card>
              )}

              {/* Pull Request Number (Optional) */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Pull Request Number (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 123"
                  value={pullRequestNumber}
                  onChange={(e) => setPullRequestNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  data-testid="pull-request-input"
                />
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Leave empty to review the latest open pull request, or specify a PR number
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={onClose}
                  data-testid="button-cancel-review"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleStartReview}
                  disabled={!selectedRepository || isStarting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  data-testid="button-start-review"
                >
                  {isStarting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Start Review
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}