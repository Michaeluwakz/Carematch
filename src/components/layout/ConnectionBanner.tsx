import React from 'react';
import { useConnectionStatus } from '@/hooks/use-connection-status';

export default function ConnectionBanner() {
  const online = useConnectionStatus();
  if (online) return null;
  return (
    <div className="w-full bg-red-600 text-white text-center py-2 fixed top-0 left-0 z-50">
      ⚠️ You are offline. Some features may be unavailable. Changes will sync when you’re back online.
    </div>
  );
} 