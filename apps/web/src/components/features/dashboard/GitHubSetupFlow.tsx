import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GitHubInstallButton } from '@/components/features/github/GitHubInstallButton';
import { Github, ArrowRight, Settings, ExternalLink } from 'lucide-react';

interface GitHubSetupFlowProps {
  isGitHubAppInstalled: boolean;
  hasRepositories: boolean;
  onRefresh: () => void;
}

export function GitHubSetupFlow({ 
  isGitHubAppInstalled, 
  hasRepositories, 
  onRefresh 
}: GitHubSetupFlowProps) {
  
  // Case 1: GitHub App not installed
  if (!isGitHubAppInstalled) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="github-setup-flow">
        <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
              <Github className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl text-blue-900 dark:text-blue-100">
              Connect Your GitHub Account
            </CardTitle>
            <CardDescription className="text-lg text-blue-700 dark:text-blue-300">
              Install the Mesrai AI GitHub App to start reviewing your pull requests
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center space-y-2 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 font-bold">1</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">Install App</span>
                <span className="text-slate-600 dark:text-slate-400 text-center">
                  Authorize Mesrai AI to access your repositories
                </span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-400 font-bold">2</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">Select Repositories</span>
                <span className="text-slate-600 dark:text-slate-400 text-center">
                  Choose which repositories to enable for AI reviews
                </span>
              </div>
              <div className="flex flex-col items-center space-y-2 p-4 bg-white/50 dark:bg-slate-800/50 rounded-lg">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400 font-bold">3</span>
                </div>
                <span className="font-medium text-slate-900 dark:text-slate-100">Start Reviewing</span>
                <span className="text-slate-600 dark:text-slate-400 text-center">
                  AI reviews activate automatically on new pull requests
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <GitHubInstallButton 
                variant="default" 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8"
              />
              <Button 
                variant="outline" 
                size="lg"
                onClick={onRefresh}
                className="px-8"
                data-testid="button-refresh"
              >
                I've Already Installed
              </Button>
            </div>

            <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
              <Github className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Secure & Private:</strong> We only request the minimum permissions needed. 
                Your code never leaves GitHub's servers - we only read diffs and post review comments.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Case 2: GitHub App installed but no repositories connected
  if (isGitHubAppInstalled && !hasRepositories) {
    return (
      <div className="max-w-4xl mx-auto space-y-6" data-testid="github-setup-repositories">
        <Card className="border-2 border-dashed border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <Settings className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-900 dark:text-green-100">
              GitHub App Installed Successfully! 
            </CardTitle>
            <CardDescription className="text-lg text-green-700 dark:text-green-300">
              Now connect some repositories to start getting AI-powered code reviews
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
              <Settings className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                You need to grant repository access in your GitHub settings to see them here.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8"
                size="lg"
                onClick={() => {
                  const settingsUrl = 'https://github.com/settings/installations';
                  window.open(settingsUrl, '_blank');
                }}
                data-testid="button-github-settings"
              >
                <Settings className="w-4 h-4 mr-2" />
                GitHub Settings
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={onRefresh}
                className="px-8"
                data-testid="button-refresh-repos"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Check for Repositories
              </Button>
            </div>

            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
              <p><strong>How to add repositories:</strong></p>
              <ol className="list-decimal list-inside space-y-1 text-left max-w-md mx-auto">
                <li>Click "GitHub Settings" above</li>
                <li>Find "Mesrai AI" in your installed GitHub Apps</li>
                <li>Click "Configure" and select repositories</li>
                <li>Return here and click "Check for Repositories"</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This component shouldn't render if repositories exist
  return null;
}