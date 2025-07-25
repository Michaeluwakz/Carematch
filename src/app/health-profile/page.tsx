"use client";
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';
import { getUserProfile } from '@/services/user-service';
import { Button } from '@/components/ui/button';
import { deleteUser } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
// You can use a chart library like recharts, chart.js, or a simple SVG for demo

function calculateHealthScore(profile: any) {
  if (!profile) return 0;
  let score = 80;
  if (profile.exerciseFrequency === '5-7_times_week') score += 10;
  if (profile.dietaryHabits === 'balanced' || profile.dietaryHabits === 'vegetarian' || profile.dietaryHabits === 'vegan') score += 5;
  if (profile.knownDiseases) score -= 10;
  if (profile.weight && profile.height) {
    const bmi = profile.weight / ((profile.height / 100) ** 2);
    if (bmi < 18.5 || bmi > 30) score -= 5;
  }
  return Math.max(0, Math.min(100, score));
}

function getRiskFlag(profile: any) {
  if (!profile) return { level: 'low', message: 'No profile data available.' };
  if (profile.knownDiseases || (profile.weight && profile.height && (profile.weight / ((profile.height / 100) ** 2) > 30))) {
    return { level: 'high', message: 'Potential health risks detected. Please consult your doctor.' };
  }
  if (profile.exerciseFrequency === 'never' || profile.dietaryHabits === 'unspecified') {
    return { level: 'medium', message: 'Consider improving your lifestyle for better health.' };
  }
  return { level: 'low', message: 'No major risks detected. Keep up the good work!' };
}

function getAIRecommendations(profile: any) {
  if (!profile) return ['Complete your health profile to get personalized recommendations.'];
  const recs = [];
  if (profile.exerciseFrequency === 'never') recs.push('Try to add at least one short walk per week.');
  if (profile.dietaryHabits === 'unspecified') recs.push('Log your dietary habits for more personalized advice.');
  if (profile.sleepHours && profile.sleepHours < 6) recs.push('Aim for at least 7 hours of sleep per night.');
  if (profile.knownDiseases?.toLowerCase().includes('hypertension')) recs.push('Consider a low-sodium diet and regular blood pressure checks.');
  if (profile.weight && profile.height) {
    const bmi = profile.weight / ((profile.height / 100) ** 2);
    if (bmi > 30) recs.push('Your BMI is high. Consider consulting a nutritionist or doctor.');
    if (bmi < 18.5) recs.push('Your BMI is low. Ensure you are getting enough nutrition.');
  }
  if (recs.length === 0) recs.push('Keep up your healthy habits!');
  return recs;
}

function SimpleLineChart({ data, label, color = '#2563eb' }: { data: number[]; label: string; color?: string }) {
  if (!data || data.length === 0) return <div className="text-muted-foreground">No data</div>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((v, i) => `${i * 40},${100 - ((v - min) / (max - min || 1)) * 80}`);
  return (
    <svg width={data.length * 40} height={120} className="block">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        points={points.join(' ')}
      />
      {data.map((v, i) => (
        <circle key={i} cx={i * 40} cy={100 - ((v - min) / (max - min || 1)) * 80} r="4" fill={color} />
      ))}
      <text x="0" y="115" fontSize="12" fill="#888">{label}</text>
    </svg>
  );
}

export { calculateHealthScore, getRiskFlag, getAIRecommendations };

export default function HealthProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    getUserProfile(user.uid)
      .then((data) => setProfileData(data))
      .catch(() => setProfileData(null))
      .finally(() => setIsLoading(false));
  }, [user]);

  const handleDownloadProfile = async () => {
    if (!user) return;
    const profile = await getUserProfile(user.uid);
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_health_profile.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setIsSaving(true);
    try {
      await fetch(`/api/delete-user-profile?uid=${user.uid}`, { method: 'DELETE' });
      await deleteUser(auth.currentUser!);
      toast({ title: 'Account deleted', description: 'Your account and data have been deleted.' });
      router.push('/signup');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const healthScore = useMemo(() => profileData ? calculateHealthScore(profileData) : null, [profileData]);
  const bmi = useMemo(() => {
    if (profileData?.weight && profileData?.height) {
      return (profileData.weight / ((profileData.height / 100) ** 2)).toFixed(1);
    }
    return null;
  }, [profileData]);
  const clinicVisits = profileData?.visitSummaries?.length || 0;
  const heartRateTrend = profileData?.biometrics?.heartRate || [];
  const weightTrend = profileData?.biometrics?.weight || [];
  const riskFlag = getRiskFlag(profileData);
  const aiRecs = getAIRecommendations(profileData);

  if (loading || isLoading) {
    return <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading your health profile...</p>
    </div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Health Profile & Analytics</CardTitle>
          <CardDescription>Advanced insights, trends, and AI recommendations for your health.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="font-semibold mb-1">Heart Rate (last 7 days)</div>
              <SimpleLineChart data={heartRateTrend.slice(-7)} label="bpm" color="#ef4444" />
            </div>
            <div>
              <div className="font-semibold mb-1">Weight Trend (last 7 days)</div>
              <SimpleLineChart data={weightTrend.slice(-7)} label="kg" color="#10b981" />
            </div>
            <div>
              <div className="font-semibold mb-1">Height</div>
              <div className="text-lg">{profileData?.height ? `${profileData.height} cm` : 'Not set'}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">BMI</div>
              <div className="text-lg">{bmi || 'Not available'}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Clinic Visits</div>
              <div className="text-lg">{clinicVisits}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Exercise Frequency</div>
              <div className="text-lg">{profileData?.exerciseFrequency || 'Not set'}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Dietary Habits</div>
              <div className="text-lg">{profileData?.dietaryHabits || 'Not set'}</div>
            </div>
            <div>
              <div className="font-semibold mb-1">Sleep Hours (avg)</div>
              <div className="text-lg">{profileData?.sleepHours || 'Not set'}</div>
            </div>
          </div>
          <div className="my-8 p-6 rounded-lg bg-primary/10 border border-primary/30 text-center">
            <div className="text-3xl font-bold mb-2">AI Health Score: {healthScore !== null ? healthScore : '--'} / 100</div>
            <div className="text-muted-foreground">This score is based on your exercise, nutrition, conditions, and recent health data.</div>
          </div>
          <div className="my-8 p-6 rounded-lg border flex items-center gap-4" style={{ background: riskFlag?.level === 'high' ? '#fee2e2' : riskFlag?.level === 'medium' ? '#fef9c3' : '#dcfce7' }}>
            {riskFlag?.level === 'high' && <AlertTriangle className="text-destructive w-8 h-8" />}
            {riskFlag?.level === 'medium' && <AlertTriangle className="text-yellow-500 w-8 h-8" />}
            {riskFlag?.level === 'low' && <CheckCircle className="text-green-600 w-8 h-8" />}
            <div className="text-lg font-semibold">{riskFlag?.message}</div>
          </div>
          <div className="my-8 p-6 rounded-lg border bg-muted">
            <div className="font-semibold mb-2">AI Recommendations</div>
            <ul className="list-disc list-inside text-base space-y-1">
              {aiRecs.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Button variant="outline" onClick={handleDownloadProfile} disabled={isSaving}>
              Download My Data
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount} disabled={isSaving}>
              Delete My Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
