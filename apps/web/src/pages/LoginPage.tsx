import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginWithGitHubButton } from '../components/features/auth/LoginWithGitHubButton';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto">
            <span className="text-primary-foreground font-bold text-xl">M</span>
          </div>
          <div>
            <CardTitle className="text-2xl">Welcome to Mesrai AI</CardTitle>
            <CardDescription>
              Sign in to access your code review dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <LoginWithGitHubButton />
        </CardContent>
      </Card>
    </div>
  );
}