/**
 * Dashboard Page Component
 * @fileoverview CodeRabbit-inspired professional dashboard for Mesrai AI Review Tool
 */

import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/features/dashboard/StatCard';
import { RepositoryList } from '../../components/features/dashboard/RepositoryList';
import { MOCK_REPOSITORIES, MOCK_DASHBOARD_STATS } from '../../lib/mock-data';

/**
 * Professional dashboard with CodeRabbit-style design
 * Clean layout, proper spacing, and comprehensive metrics overview
 */
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's what's happening with your code reviews today
          </p>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {MOCK_DASHBOARD_STATS.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Repository overview */}
        <RepositoryList repositories={MOCK_REPOSITORIES} />
      </div>
    </DashboardLayout>
  );
}