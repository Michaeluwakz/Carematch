"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, User, Heart, Activity, Utensils, Moon, Target } from 'lucide-react';
import { getUserProfile, saveUserProfile } from '@/services/user-service';
import { addToQueue, useSyncQueue } from '@/hooks/use-offline-queue';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    getUserProfile(user.uid)
      .then((data) => setProfileData(data))
      .catch(() => setProfileData(null))
      .finally(() => setIsLoading(false));
  }, [user]);

  // Sync queued profile updates when back online
  useSyncQueue(async (action) => {
    if (action.type === 'profile' && user) {
      await saveUserProfile(user.uid, action.profileData);
      toast({ title: 'Profile updated', description: 'Your health profile has been saved successfully.' });
    }
  });

  const handleSave = async () => {
    if (!user || !profileData) return;
    setIsSaving(true);
    if (navigator.onLine) {
      try {
        await saveUserProfile(user.uid, profileData);
        toast({ title: 'Profile updated', description: 'Your health profile has been saved successfully.' });
        setIsEditing(false);
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setIsSaving(false);
      }
    } else {
      addToQueue({ type: 'profile', profileData });
      toast({ title: 'Offline Mode', description: 'Profile update will be saved when you are back online.', variant: 'default' });
      setIsEditing(false);
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setProfileData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (loading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">No health profile found.</p>
              <Button onClick={() => router.push('/onboarding')}>
                Complete Health Profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Health Profile</h1>
            <p className="text-muted-foreground">View and edit your health information</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={profileData.age || ''}
                  onChange={(e) => handleInputChange('age', parseInt(e.target.value) || '')}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={profileData.height || ''}
                  onChange={(e) => handleInputChange('height', parseInt(e.target.value) || '')}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={profileData.weight || ''}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || '')}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Health Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="healthGoals">Primary Health Goals</Label>
              <Select
                value={profileData.healthGoals || ''}
                onValueChange={(value) => handleInputChange('healthGoals', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your primary health goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight_loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                  <SelectItem value="better_nutrition">Better Nutrition</SelectItem>
                  <SelectItem value="improve_fitness">Improve Fitness</SelectItem>
                  <SelectItem value="manage_condition">Manage Health Condition</SelectItem>
                  <SelectItem value="general_wellness">General Wellness</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Health Conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Health Conditions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="knownDiseases">Known Health Conditions</Label>
              <Textarea
                id="knownDiseases"
                value={profileData.knownDiseases || ''}
                onChange={(e) => handleInputChange('knownDiseases', e.target.value)}
                disabled={!isEditing}
                placeholder="List any known health conditions, allergies, or medications..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Physical Abilities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Physical Abilities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mobilityLevel">Mobility Level</Label>
              <Select
                value={profileData.mobilityLevel || ''}
                onValueChange={(value) => handleInputChange('mobilityLevel', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your mobility level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fully_mobile">Fully Mobile</SelectItem>
                  <SelectItem value="limited_mobility">Limited Mobility</SelectItem>
                  <SelectItem value="wheelchair_user">Wheelchair User</SelectItem>
                  <SelectItem value="bed_bound">Bed Bound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="exerciseFrequency">Exercise Frequency</Label>
              <Select
                value={profileData.exerciseFrequency || ''}
                onValueChange={(value) => handleInputChange('exerciseFrequency', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How often do you exercise?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="1-2_times_week">1-2 times per week</SelectItem>
                  <SelectItem value="3-4_times_week">3-4 times per week</SelectItem>
                  <SelectItem value="5-7_times_week">5-7 times per week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Lifestyle & Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dietaryHabits">Dietary Habits</Label>
              <Select
                value={profileData.dietaryHabits || ''}
                onValueChange={(value) => handleInputChange('dietaryHabits', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your dietary preference" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="low_carb">Low Carb</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                  <SelectItem value="unspecified">Unspecified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sleepHours">Average Sleep Hours</Label>
              <Select
                value={profileData.sleepHours?.toString() || ''}
                onValueChange={(value) => handleInputChange('sleepHours', parseInt(value) || '')}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How many hours do you sleep?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">Less than 5 hours</SelectItem>
                  <SelectItem value="5">5 hours</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="7">7 hours</SelectItem>
                  <SelectItem value="8">8 hours</SelectItem>
                  <SelectItem value="9">9 hours</SelectItem>
                  <SelectItem value="10">More than 9 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="stressLevel">Stress Level</Label>
              <Select
                value={profileData.stressLevel || ''}
                onValueChange={(value) => handleInputChange('stressLevel', value)}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How would you rate your stress level?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="very_high">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                <Input
                  id="emergencyContactName"
                  value={profileData.emergencyContactName || ''}
                  onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyContactPhone"
                  value={profileData.emergencyContactPhone || ''}
                  onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation to Analytics */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Want to see detailed analytics and AI recommendations?
              </p>
              <Button variant="outline" onClick={() => router.push('/health-profile')}>
                View Health Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
