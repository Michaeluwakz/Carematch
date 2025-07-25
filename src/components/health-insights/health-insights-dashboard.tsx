
"use client";

// HealthInsightsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, Lightbulb } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getUserProfile } from '@/services/user-service';
import type { UserProfile } from '@/lib/types';

const HealthInsightsDashboard: React.FC = () => {
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

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your health insights...</p>
      </div>
    );
  }

  if (error) {
    let displayError = `Error loading health insights: ${error}`;
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
          <Lightbulb className="h-8 w-8" /> My Health Insights
        </h1>
      </div>

      {userProfile ? (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Example Insight Card - Replace with real insights based on user data */}
          <Card>
            <CardHeader>
              <CardTitle>Sleep Patterns</CardTitle>
              <CardDescription>Analyze your sleep data for better rest.</CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile.sleepHours !== undefined ? (
                <p>Average sleep hours per night: {userProfile.sleepHours} hours</p>
              ) : (
                <p>No sleep data available. Consider tracking your sleep habits.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dietary Habits</CardTitle>
              <CardDescription>Get insights on your dietary habits.</CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile.dietaryHabits ? (
                <p>Your dietary habit: {userProfile.dietaryHabits}</p>
              ) : (
                <p>No dietary data available. Update your profile to receive relevant insights.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exercise Frequency</CardTitle>
              <CardDescription>Understand your exercise routine.</CardDescription>
            </CardHeader>
            <CardContent>
              {userProfile.exerciseFrequency ? (
                <p>Your exercise frequency: {userProfile.exerciseFrequency}</p>
              ) : (
                <p>No exercise data available. Update your profile to receive relevant insights.</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-8 shadow-md">
          <CardContent>
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">No profile information found.</p>
            <p className="text-sm text-muted-foreground">Complete your profile in settings to unlock personalized health insights.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HealthInsightsDashboard;
