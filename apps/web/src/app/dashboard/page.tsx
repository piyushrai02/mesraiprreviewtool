/**
 * Dashboard Page Component
 * @fileoverview Main dashboard page for Mesrai AI Review Tool
 */

import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatCard } from '../../components/features/dashboard/StatCard';
import { RepositoryList } from '../../components/features/dashboard/RepositoryList';
import { MOCK_REPOSITORIES, MOCK_DASHBOARD_STATS } from '../../lib/mock-data';

/**
 * Main dashboard page component
 * Displays key statistics and repository overview in a professional layout
 */
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Overview of your repositories and code review metrics
          </p>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_DASHBOARD_STATS.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
            />
          ))}
        </div>

        {/* Repository list */}
        <RepositoryList repositories={MOCK_REPOSITORIES} />
      </div>
    </DashboardLayout>
  );
}