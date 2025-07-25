import { useEffect } from 'react';

const QUEUE_KEY = 'carematch-offline-queue';

export function addToQueue(action: any) {
  const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  queue.push(action);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function useSyncQueue(syncFn: (action: any) => Promise<void>) {
  useEffect(() => {
    const sync = async () => {
      if (navigator.onLine) {
        const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
        for (const action of queue) {
          await syncFn(action);
        }
        localStorage.removeItem(QUEUE_KEY);
      }
    };
    window.addEventListener('online', sync);
    return () => window.removeEventListener('online', sync);
  }, [syncFn]);
} 