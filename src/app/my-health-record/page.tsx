
import React from 'react';
import MyHealthRecordDashboard from '@/components/my-health-record/my-health-record-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Health Record - CareMatch AI',
  description: 'Manage your health records, including visit summaries, immunization records, and lab results.',
};

const MyHealthRecordPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <MyHealthRecordDashboard />
    </div>
  );
};

export default MyHealthRecordPage;
