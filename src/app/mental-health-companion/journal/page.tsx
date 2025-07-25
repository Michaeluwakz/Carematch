"use client";
import { useState } from 'react';
import { MentalHealthJournalScreen } from '@/components/mental-health/mental-health-chat';
import { addToQueue, useSyncQueue } from '@/hooks/use-offline-queue';

interface JournalEntry {
  date: string;
  text: string;
}

export default function MentalHealthJournalPage() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Sync queued journal entries when back online
  useSyncQueue(async (action) => {
    if (action.type === 'journal') {
      setJournalEntries(prev => [...prev, { date: new Date().toISOString(), text: action.text }]);
      // Here you would also save to server if needed
    }
  });

  const handleAddEntry = (text: string) => {
    if (navigator.onLine) {
      setJournalEntries(prev => [...prev, { date: new Date().toISOString(), text }]);
      // Save to server as usual
    } else {
      addToQueue({ type: 'journal', text });
    }
  };
  return <MentalHealthJournalScreen journalEntries={journalEntries} onAddEntry={handleAddEntry} />;
} 