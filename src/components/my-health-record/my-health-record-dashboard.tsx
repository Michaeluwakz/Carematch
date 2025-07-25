
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, NotebookText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getUserProfile } from '@/services/user-service';
import { addHealthRecordEntry } from '@/services/user-service'; // Import addHealthRecordEntry
import type { UserProfile, VisitSummary, ImmunizationRecord, LabResult } from '@/lib/types';
import VisitSummarySection from './visit-summary-section';
import ImmunizationRecordSection from './immunization-record-section';
import LabResultSection from './lab-result-section';

const MyHealthRecordDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchUserProfile();
  }, [user, authLoading, router]);

  const fetchUserProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const profile = await getUserProfile(user.uid);
      setUserProfile(profile);
    } catch (err) {
      console.error("Error fetching user profile:", err);
      const errorMessage = err instanceof Error ? err.message : "Could not fetch user profile.";
      setError(errorMessage);
      toast({ title: "Error fetching user profile", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVisitSummary = async (newEntryData: Omit<VisitSummary, 'id' | 'createdAt'>) => {
    if (!user) return;
    try {
      const newEntryId = await addHealthRecordEntry(user.uid, 'visitSummaries', newEntryData);
      toast({ title: "Visit Summary Added", description: "Your new visit summary has been saved." });
      fetchUserProfile(); // Refresh data
      return newEntryId;
    } catch (err) {
      console.error("Error adding visit summary:", err);
      const errorMessage = err instanceof Error ? err.message : "Could not add visit summary.";
      toast({ title: "Error Adding Visit Summary", description: errorMessage, variant: "destructive" });
      return null;
    }
  };

  const handleAddImmunizationRecord = async (newEntryData: Omit<ImmunizationRecord, 'id' | 'createdAt'>) => {
    if (!user) return;
    try {
      const newEntryId = await addHealthRecordEntry(user.uid, 'immunizationRecords', newEntryData);
      toast({ title: "Immunization Record Added", description: "Your new immunization record has been saved." });
      fetchUserProfile(); // Refresh data
      return newEntryId;
    } catch (err) {
      console.error("Error adding immunization record:", err);
      const errorMessage = err instanceof Error ? err.message : "Could not add immunization record.";
      toast({ title: "Error Adding Immunization Record", description: errorMessage, variant: "destructive" });
      return null;
    }
  };

  const handleAddLabResult = async (newEntryData: Omit<LabResult, 'id' | 'createdAt'>) => {
    if (!user) return;
    try {
      const newEntryId = await addHealthRecordEntry(user.uid, 'labResults', newEntryData);
      toast({ title: "Lab Result Added", description: "Your new lab result has been saved." });
      fetchUserProfile(); // Refresh data
      return newEntryId;
    } catch (err) {
      console.error("Error adding lab result:", err);
      const errorMessage = err instanceof Error ? err.message : "Could not add lab result.";
      toast({ title: "Error Adding Lab Result", description: errorMessage, variant: "destructive" });
      return null;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your health record...</p>
      </div>
    );
  }

  if (error) {
    let displayError = `Error loading health record: ${error}`;
    const lowerCaseError = error.toLowerCase();
    if (lowerCaseError.includes("offline") || lowerCaseError.includes("unavailable") || lowerCaseError.includes("could not reach cloud firestore backend")) {
      displayError = "Could not connect to the database. Please check your internet connection and ensure Firebase services are operational. The application might be in offline mode.";
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] text-destructive p-4">
        <AlertCircle className="h-12 w-12" />
        <p className="mt-4 text-center">{displayError}</p>
        <Button onClick={fetchUserProfile} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <NotebookText className="h-8 w-8" /> My Health Record
        </h1>
      </div>

      {userProfile ? (
        <>
          <VisitSummarySection
            visitSummaries={userProfile.visitSummaries || []}
            onAddVisitSummary={handleAddVisitSummary}
          />

          <ImmunizationRecordSection
            immunizationRecords={userProfile.immunizationRecords || []}
            onAddImmunizationRecord={handleAddImmunizationRecord}
          />

          <LabResultSection
            labResults={userProfile.labResults || []}
            onAddLabResult={handleAddLabResult}
          />
        </>
      ) : (
        <Card className="text-center py-8 shadow-md">
          <CardContent>
            <NotebookText className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">No profile information found.</p>
            <p className="text-sm text-muted-foreground">Complete your profile in settings to start managing your health record.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyHealthRecordDashboard;
