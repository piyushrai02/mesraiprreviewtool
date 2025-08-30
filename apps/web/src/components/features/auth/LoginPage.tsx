/**
 * Login Page Component
 * @fileoverview Dedicated login page for unauthenticated users
 */

import { Bot, Github, Shield, Zap, Users } from 'lucide-react';
import { LoginWithGitHubButton } from './LoginWithGitHubButton';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 py-16">
        <div className="max-w-md">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mesrai AI</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Code Review Tool</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
            Intelligent Code Reviews
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Transform your development workflow with AI-powered code reviews. 
            Catch issues early, maintain code quality, and accelerate your team's productivity.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Enterprise-grade security</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Lightning-fast analysis</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-gray-700 dark:text-gray-300">Team collaboration</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 py-16">
        <div className="max-w-md mx-auto w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Mesrai AI</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Code Review Tool</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Sign in to your account to continue
              </p>
            </div>

            <div className="space-y-6">
              <LoginWithGitHubButton className="w-full justify-center" size="lg" />
              
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Secure authentication powered by GitHub
                </p>
              </div>
            </div>

            {/* Error Message Display */}
            <div className="mt-6">
              {typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('error') && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    Authentication failed. Please try again.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}