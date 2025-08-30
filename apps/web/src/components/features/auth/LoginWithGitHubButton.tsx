/**
 * GitHub Login Button Component
 * @fileoverview Professional login button for GitHub OAuth
 */

import { Github } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';

interface LoginWithGitHubButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoginWithGitHubButton({ 
  className = '', 
  size = 'md' 
}: LoginWithGitHubButtonProps) {
  const { login, isLoading } = useAuth();

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <button
      onClick={login}
      disabled={isLoading}
      className={`
        inline-flex items-center justify-center font-medium
        bg-gray-900 dark:bg-gray-800 text-white
        border border-gray-300 dark:border-gray-600
        rounded-lg transition-all duration-200
        hover:bg-gray-800 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]} ${className}
      `}
      data-testid="button-login-github"
    >
      <Github className={`${iconSizes[size]} mr-2 flex-shrink-0`} />
      <span>Continue with GitHub</span>
    </button>
  );
}