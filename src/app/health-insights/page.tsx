
// Health Insights Page

import React from 'react';
import HealthInsightsDashboard from '@/components/health-insights/health-insights-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Health Insights - CareMatch AI',
  description: 'Personalized health insights and recommendations.',
};

const HealthInsightsPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <HealthInsightsDashboard />
    </div>
  );
};

export default HealthInsightsPage;
