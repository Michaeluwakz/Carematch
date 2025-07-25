
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Save, AlertCircle, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { saveUserProfile, getUserProfile } from '@/services/user-service';
import { Textarea } from '@/components/ui/textarea';

const onboardingFormSchema = z.object({
  preferredLanguage: z.string().min(1, "Preferred language is required."),
  age: z.coerce.number().min(1, "Age is required.").max(120, "Please enter a valid age.").optional().or(z.literal(undefined).transform(() => undefined)).or(z.literal('')),
  genderIdentity: z.string().min(1, "Gender identity is required."),
  
  // Health profile fields
  weight: z.coerce.number().positive("Weight must be a positive number if entered.").optional().or(z.literal(undefined).transform(() => undefined)).or(z.literal('')),
  knownDiseases: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  
  // Health Insights fields
  dietaryHabits: z.string().optional(),
  sleepHours: z.coerce.number().min(0, "Cannot be negative.").max(24, "Please enter a valid number of hours (0-24).").optional().or(z.literal(undefined).transform(() => undefined)).or(z.literal('')),
  exerciseFrequency: z.string().optional(),

  consentDataProcessing: z.boolean().refine(val => val === true, {
    message: "You must consent to data processing to continue.",
  }),
  consentShareAnonymizedDataForResearch: z.boolean().optional(),
  identityDocument: z.any().optional(),
  insuranceCard: z.any().optional(),
  medicalTestReport: z.any().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;

export function OnboardingForm() {
  const { user, loading: authLoading, refreshUserProfile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      preferredLanguage: '',
      age: undefined,
      genderIdentity: '',
      weight: undefined,
      knownDiseases: '',
      allergies: '',
      currentMedications: '',
      dietaryHabits: 'unspecified',
      sleepHours: undefined,
      exerciseFrequency: 'unspecified',
      consentDataProcessing: false,
      consentShareAnonymizedDataForResearch: false,
    },
  });

  useEffect(() => {
    if (authLoading) return; 

    if (!user) {
      toast({ title: "Authentication Required", description: "Please log in to continue onboarding.", variant: "destructive" });
      router.push('/login');
      return;
    }

    const checkOnboardingStatus = async () => {
      setIsCheckingStatus(true);
      setError(null); 
      try {
        const profile = await getUserProfile(user.uid);
        if (profile) {
          form.reset({
            preferredLanguage: profile.preferredLanguage || '',
            age: profile.age === undefined ? undefined : profile.age,
            genderIdentity: profile.genderIdentity || '',
            weight: profile.weight === undefined ? undefined : profile.weight,
            knownDiseases: profile.knownDiseases || '',
            allergies: profile.allergies || '',
            currentMedications: profile.currentMedications || '',
            dietaryHabits: profile.dietaryHabits || 'unspecified',
            sleepHours: profile.sleepHours === undefined ? undefined : profile.sleepHours,
            exerciseFrequency: profile.exerciseFrequency || 'unspecified',
            consentDataProcessing: profile.consentDataProcessing || false,
            consentShareAnonymizedDataForResearch: profile.consentShareAnonymizedDataForResearch || false,
          });
        }
        setIsCheckingStatus(false);
      } catch (err) {
        console.error("Error checking/loading profile status:", err);
        const errorMessage = err instanceof Error ? err.message : "Could not verify or load your profile.";
        setError(errorMessage);
        toast({
            title: "Profile Load Failed",
            description: errorMessage,
            variant: "destructive",
        });
        setIsCheckingStatus(false); 
      }
    };

    checkOnboardingStatus();
  }, [user, authLoading, router, toast, form]);


  const onSubmit: SubmitHandler<OnboardingFormValues> = async (data) => {
    if (!user) {
      setError("You must be logged in to complete onboarding.");
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { identityDocument, insuranceCard, medicalTestReport, ...profileData } = data;
      
      const ageToSave = profileData.age === '' ? undefined : profileData.age;
      const weightToSave = profileData.weight === '' ? undefined : profileData.weight;
      const sleepHoursToSave = profileData.sleepHours === '' ? undefined : profileData.sleepHours;

      await saveUserProfile(user.uid, {
        ...profileData,
        age: ageToSave,
        weight: weightToSave,
        sleepHours: sleepHoursToSave,
        email: user.email, 
        onboardingCompleted: true,
      });

      await refreshUserProfile();

      toast({
        title: "Profile Updated",
        description: "Your information has been saved successfully!",
      });
      
      router.push('/health-insights');

    } catch (err) {
      console.error("Error saving onboarding data:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to save profile: ${errorMessage}`);
      toast({
        title: "Profile Save Failed",
        description: `Could not save your profile. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isCheckingStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-20rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">Your Health Profile</CardTitle>
        <CardDescription>
          This information helps us personalize your experience. You can update this anytime.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="preferredLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Language *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Español (Spanish)</SelectItem>
                      <SelectItem value="French">Français (French)</SelectItem>
                      <SelectItem value="Hindi">हिन्दी (Hindi)</SelectItem>
                      <SelectItem value="Swahili">Kiswahili (Swahili)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter your age" 
                      {...field} 
                      value={field.value === undefined ? '' : field.value}
                      onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} 
                      disabled={isSubmitting} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="genderIdentity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender Identity *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender identity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Woman">Woman</SelectItem>
                      <SelectItem value="Man">Man</SelectItem>
                      <SelectItem value="Non-binary">Non-binary</SelectItem>
                      <SelectItem value="Self-describe">Prefer to self-describe</SelectItem>
                      <SelectItem value="Not-say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Weight (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Enter your weight (e.g., in kg or lbs)" 
                      {...field}
                      value={field.value === undefined ? '' : field.value}
                      onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} 
                      disabled={isSubmitting} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="dietaryHabits"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Dietary Habits (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your primary diet style" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unspecified">Unspecified / No specific diet</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="low-carb">Low-Carb</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian</SelectItem>
                      <SelectItem value="vegan">Vegan</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>This helps in generating diet-related insights.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sleepHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Average Sleep Per Night (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g., 7.5" 
                      {...field}
                      value={field.value === undefined ? '' : field.value}
                      onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))} 
                      disabled={isSubmitting} 
                      step="0.5"
                    />
                  </FormControl>
                  <FormDescription>Enter your average hours of sleep.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="exerciseFrequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exercise Frequency (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select how often you exercise" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="unspecified">Unspecified</SelectItem>
                      <SelectItem value="never">Rarely / Never</SelectItem>
                      <SelectItem value="1-2_times_week">1-2 times a week</SelectItem>
                      <SelectItem value="3-4_times_week">3-4 times a week</SelectItem>
                      <SelectItem value="5-7_times_week">5-7 times a week</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>This helps in generating fitness-related insights.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="knownDiseases"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Known Diseases/Conditions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Hypertension, Type 2 Diabetes, Asthma" 
                      {...field} 
                      disabled={isSubmitting} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>Please list any significant ongoing health conditions.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allergies"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Allergies (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Penicillin, Peanuts, Pollen" 
                      {...field} 
                      disabled={isSubmitting} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>List any known allergies to medications, food, or environmental factors.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="currentMedications"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Medications (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Lisinopril 10mg daily, Metformin 500mg twice daily, Albuterol inhaler as needed" 
                      {...field} 
                      disabled={isSubmitting} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>Include prescription, over-the-counter drugs, and supplements if any.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consentDataProcessing"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Consent to Data Processing *
                    </FormLabel>
                    <FormDescription>
                      By checking this box, you consent to the storage and processing of your personal data as described in our Privacy Policy, necessary for the app to function.
                    </FormDescription>
                     <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="consentShareAnonymizedDataForResearch"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Consent to Share Anonymized Data (Optional)
                    </FormLabel>
                    <FormDescription>
                      You can help us improve our services by allowing us to use your anonymized (de-identified) data for research and product development. Your personal identity will not be revealed.
                    </FormDescription>
                     <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Profile Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isSubmitting || !form.formState.isValid && form.formState.isSubmitted} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save and View Insights
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
         <p className="text-xs text-muted-foreground">
            Your information is handled with care. For details, see our Privacy Policy.
          </p>
      </CardFooter>
    </Card>
  );
}
