
import NotificationsDashboard from '@/components/notifications/notifications-dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Notifications - CareMatch AI',
  description: 'View and manage your notifications.',
};

export default function NotificationsPage() {
  return (
    <div className="w-full">
      <NotificationsDashboard />
    </div>
  );
}
