import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, CheckCircle } from 'lucide-react';

export default function ReviewsPage() {
  return (
    <div className="space-y-6" data-testid="reviews-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Code Reviews</h1>
        <p className="text-muted-foreground">
          Manage and track all your code reviews in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Being reviewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
          <CardDescription>
            Latest code reviews requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                id: 1,
                title: 'Feature: Add user authentication system',
                repo: 'frontend-app',
                author: 'john.doe',
                status: 'pending',
                priority: 'high',
                createdAt: '2 hours ago',
              },
              {
                id: 2,
                title: 'Fix: Resolve memory leak in data processing',
                repo: 'backend-api',
                author: 'jane.smith',
                status: 'in-progress',
                priority: 'medium',
                createdAt: '4 hours ago',
              },
              {
                id: 3,
                title: 'Refactor: Optimize database queries',
                repo: 'data-service',
                author: 'mike.wilson',
                status: 'changes-requested',
                priority: 'low',
                createdAt: '6 hours ago',
              },
            ].map((review) => (
              <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{review.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {review.repo} • by {review.author} • {review.createdAt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      review.priority === 'high' ? 'destructive' :
                      review.priority === 'medium' ? 'default' :
                      'secondary'
                    }
                  >
                    {review.priority}
                  </Badge>
                  <Badge
                    variant={
                      review.status === 'pending' ? 'secondary' :
                      review.status === 'in-progress' ? 'default' :
                      'destructive'
                    }
                  >
                    {review.status}
                  </Badge>
                  <Button size="sm">Review</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}