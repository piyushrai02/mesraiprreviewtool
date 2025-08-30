/**
 * Professional Dashboard Page - Entry Point
 * Combines the professional layout with the dashboard content
 */

import React from 'react';
import { ProfessionalLayout } from '@/components/layout/ProfessionalLayout';
import { ProfessionalDashboard } from './ProfessionalDashboard';

export function ProfessionalDashboardPage() {
  return (
    <ProfessionalLayout>
      <ProfessionalDashboard />
    </ProfessionalLayout>
  );
}