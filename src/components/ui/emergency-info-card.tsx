import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './card';
import type { UserProfile } from '@/lib/types';
import { AlertTriangle, Phone } from 'lucide-react';

interface EmergencyInfoCardProps {
  userProfile: UserProfile | null;
}

export default function EmergencyInfoCard({ userProfile }: EmergencyInfoCardProps) {
  if (!userProfile) return null;

  const allergies = userProfile.allergies || 'None reported';
  const conditions = userProfile.chronicConditions?.length
    ? userProfile.chronicConditions.join(', ')
    : 'None reported';
  // For demo: emergencyContacts is not in UserProfile, so fallback to a static example
  const emergencyContacts = userProfile.emergencyContacts || [
    { name: 'ICE: Jane Doe', phone: '+1234567890', relation: 'Spouse' }
  ];

  return (
    <Card className="border-red-500 bg-red-50">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <AlertTriangle className="text-red-500 h-5 w-5" />
        <CardTitle className="text-red-700 text-lg">Emergency Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <span className="font-semibold text-red-700">Allergies:</span> {allergies}
        </div>
        <div>
          <span className="font-semibold text-red-700">Conditions:</span> {conditions}
        </div>
        <div>
          <span className="font-semibold text-red-700">Emergency Contacts:</span>
          <ul className="ml-4 mt-1 list-disc">
            {emergencyContacts.map((c: any, i: number) => (
              <li key={i} className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-red-400" />
                <span>{c.name} ({c.relation}): <a href={`tel:${c.phone}`} className="underline text-blue-700">{c.phone}</a></span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 