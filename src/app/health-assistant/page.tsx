
import { HealthAssistantChat } from '@/components/health-assistant/health-assistant-chat';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Autonomous AI Health Companion - CareMatch AI',
  description: 'Your smart AI partner for health questions, document understanding, appointment assistance, and more, in your preferred language.',
};

export default function HealthAssistantPage() {
  return (
    <div className="w-full">
      <HealthAssistantChat />
    </div>
  );
}

    