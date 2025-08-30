import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Users, GitBranch, MessageSquare, TrendingUp, Star, Zap } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    {
      title: 'Active Reviews',
      value: '12',
      description: 'Pending code reviews',
      icon: MessageSquare,
      trend: '+2 from yesterday',
    },
    {
      title: 'Connected Repos',
      value: '8',
      description: 'GitHub repositories',
      icon: GitBranch,
      trend: '+1 this week',
    },
    {
      title: 'Team Members',
      value: '24',
      description: 'Active reviewers',
      icon: Users,
      trend: '+3 this month',
    },
    {
      title: 'Review Score',
      value: '94%',
      description: 'Average quality score',
      icon: BarChart3,
      trend: '+5% improvement',
    },
  ];

  return (
    <motion.div 
      className="space-y-8" 
      data-testid="dashboard-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Enhanced Header Section */}
      <motion.div 
        className="space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow"
          >
            <Star className="w-6 h-6 text-primary-foreground" />
          </motion.div>
          <div>
            <motion.h1 
              className="text-4xl font-bold tracking-tight text-gradient"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Dashboard
            </motion.h1>
            <motion.p 
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Welcome back! Here's an overview of your code review activity.
            </motion.p>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Stats Grid with Advanced Animations */}
      <motion.div 
        className="grid-dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ 
                opacity: 0, 
                y: 50,
                scale: 0.8,
                rotateX: -15
              }}
              animate={{ 
                opacity: 1, 
                y: 0,
                scale: 1,
                rotateX: 0
              }}
              transition={{ 
                delay: 0.5 + (index * 0.1), 
                duration: 0.6,
                ease: "easeOut"
              }}
              whileHover={{ 
                y: -5,
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Card className="card-modern group overflow-hidden relative">
                {/* Animated background effect */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100"
                  animate={{
                    background: [
                      'linear-gradient(45deg, transparent, hsl(var(--primary) / 0.05), transparent)',
                      'linear-gradient(45deg, transparent, hsl(var(--primary) / 0.1), transparent)',
                      'linear-gradient(45deg, transparent, hsl(var(--primary) / 0.05), transparent)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
                  <CardTitle className="text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {stat.title}
                  </CardTitle>
                  <motion.div
                    whileHover={{ 
                      scale: 1.2,
                      rotate: 10
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="relative"
                  >
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 0 0 hsl(var(--primary) / 0)',
                          '0 0 0 8px hsl(var(--primary) / 0.1)',
                          '0 0 0 0 hsl(var(--primary) / 0)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="p-3 bg-gradient-primary/10 rounded-xl border border-primary/20"
                    >
                      <IconComponent className="h-5 w-5 text-primary" />
                    </motion.div>
                  </motion.div>
                </CardHeader>
                
                <CardContent className="space-y-4 relative z-10">
                  <motion.div 
                    className="text-3xl font-bold text-foreground"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.7 + (index * 0.1), duration: 0.4 }}
                  >
                    {stat.value}
                  </motion.div>
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <motion.div 
                      className="badge-success"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.trend}
                    </motion.div>
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 bg-primary rounded-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Recent Activity with Advanced Layout */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 card-modern animate-slide-up" style={{ animationDelay: '400ms' }}>
          <CardHeader className="border-b border-border/30">
            <CardTitle className="text-xl font-bold">Recent Reviews</CardTitle>
            <CardDescription className="text-base">
              Latest code reviews that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/30">
              {[
                {
                  title: 'Feature: Add user authentication',
                  repo: 'frontend-app',
                  author: 'john.doe',
                  status: 'pending',
                  time: '2 hours ago',
                },
                {
                  title: 'Fix: Resolve memory leak in data processing',
                  repo: 'backend-api',
                  author: 'jane.smith',
                  status: 'approved',
                  time: '4 hours ago',
                },
                {
                  title: 'Refactor: Optimize database queries',
                  repo: 'data-service',
                  author: 'mike.wilson',
                  status: 'changes-requested',
                  time: '6 hours ago',
                },
              ].map((review, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors duration-200 group">
                  <div className="space-y-2 flex-1">
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{review.title}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">{review.repo}</span> • by {review.author} • {review.time}
                    </p>
                  </div>
                  <div className={`badge-${
                    review.status === 'approved' ? 'success' :
                    review.status === 'pending' ? 'warning' :
                    'destructive'
                  }`}>
                    {review.status}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 card-modern animate-slide-up" style={{ animationDelay: '500ms' }}>
          <CardHeader className="border-b border-border/30">
            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
            <CardDescription className="text-base">
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <button className="btn-primary w-full">
              <MessageSquare className="w-4 h-4" />
              Start New Review
            </button>
            <button className="btn-secondary w-full">
              <GitBranch className="w-4 h-4" />
              Connect Repository
            </button>
            <button className="btn-secondary w-full">
              <BarChart3 className="w-4 h-4" />
              View Analytics
            </button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}