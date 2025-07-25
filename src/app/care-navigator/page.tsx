
import { CareNavigatorForm } from '@/components/care-navigator/care-navigator-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Care Navigator - CareMatch AI',
  description: 'Get personalized health recommendations and find nearby care options based on your needs.',
};

export default function CareNavigatorPage() {
  return (
    <div className="w-full">
      <CareNavigatorForm />
    </div>
  );
}
