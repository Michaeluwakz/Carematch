
import RemindersDashboard from '@/components/reminders/reminders-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Reminders - CareMatch AI',
  description: 'Manage your health-related reminders for appointments, medications, and more.',
};

export default function RemindersPage() {
  return (
    <div className="w-full">
      <RemindersDashboard />
    </div>
  );
}
