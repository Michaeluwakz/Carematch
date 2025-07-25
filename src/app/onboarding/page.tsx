
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { HealthQuestionsForm } from "@/components/onboarding/health-questions";
import { LifestyleQuestionsForm } from "@/components/onboarding/lifestyle-questions";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { saveUserProfile } from "@/services/user-service";
import { User, HeartPulse, Dumbbell } from 'lucide-react';

const steps = [
  "General Profile",
  "Health Questions",
  "Lifestyle Preferences",
  "Review & Submit"
];

export default function MultiStepOnboardingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </div>;
  }

  const handleNext = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => prev - 1);

  const handleFinalSubmit = async () => {
    setIsSaving(true);
    try {
      if (user) {
        await saveUserProfile(user.uid, {
          ...formData,
          onboardingCompleted: true,
        });
        toast({
          title: "Profile updated successfully!",
          description: "You've successfully completed onboarding.",
        });
        router.push("/");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Onboarding</CardTitle>
          <CardDescription>Step {step + 1} of {steps.length}: {steps[step]}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <OnboardingForm
              onSubmit={handleNext}
              defaultValues={formData}
              hideSubmitButton
            />
          )}
          {step === 1 && (
            <HealthQuestionsForm
              onSubmit={handleNext}
              defaultValues={formData}
            />
          )}
          {step === 2 && (
            <LifestyleQuestionsForm
              onSubmit={handleNext}
              defaultValues={formData}
            />
          )}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Review Your Information</h3>
              <div className="space-y-6">
                {/* General Profile */}
                <div className="bg-muted p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-primary flex items-center gap-2"><User className="w-5 h-5" /> General Profile</span>
                    <Button variant="link" size="sm" onClick={() => setStep(0)}>Edit</Button>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><span className="font-medium">Preferred Name:</span> {formData.preferredName || <span className="italic text-muted-foreground">Not set</span>}</div>
                    <div><span className="font-medium">Preferred Language:</span> {formData.preferredLanguage || <span className="italic text-muted-foreground">Not set</span>}</div>
                    <div><span className="font-medium">Age:</span> {formData.age || <span className="italic text-muted-foreground">Not set</span>}</div>
                    <div><span className="font-medium">Gender Identity:</span> {formData.genderIdentity || <span className="italic text-muted-foreground">Not set</span>}</div>
                  </div>
                </div>
                {/* Health Questions */}
                <div className="bg-muted p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-primary flex items-center gap-2"><HeartPulse className="w-5 h-5" /> Health Questions</span>
                    <Button variant="link" size="sm" onClick={() => setStep(1)}>Edit</Button>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><span className="font-medium">Weight:</span> {formData.weight || <span className="italic text-muted-foreground">Not set</span>}</div>
                    <div><span className="font-medium">Known Diseases:</span> {formData.knownDiseases || <span className="italic text-muted-foreground">Not set</span>}</div>
                    <div><span className="font-medium">Allergies:</span> {formData.allergies || <span className="italic text-muted-foreground">Not set</span>}</div>
                    <div><span className="font-medium">Current Medications:</span> {formData.currentMedications || <span className="italic text-muted-foreground">Not set</span>}</div>
                  </div>
                </div>
                {/* Lifestyle Preferences */}
                <div className="bg-muted p-4 rounded">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-primary flex items-center gap-2"><Dumbbell className="w-5 h-5" /> Lifestyle Preferences</span>
                    <Button variant="link" size="sm" onClick={() => setStep(2)}>Edit</Button>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><span className="font-medium">Dietary Habits:</span> {formData.dietaryHabits || <span className="italic text-muted-foreground">Not set</span>}</div>
                    <div><span className="font-medium">Sleep Hours:</span> {formData.sleepHours || <span className="italic text-muted-foreground">Not set</span>}</div>
                    <div><span className="font-medium">Exercise Frequency:</span> {formData.exerciseFrequency || <span className="italic text-muted-foreground">Not set</span>}</div>
                  </div>
                </div>
                    </div>
              <Button onClick={handleFinalSubmit} disabled={isSaving} className="w-full mt-8">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Submit & Finish
              </Button>
                    </div>
          )}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack} disabled={step === 0 || isSaving}>
              Back
            </Button>
            {step < steps.length - 1 && (
              <Button onClick={() => {
                // For steps with forms, the Next button is handled by the form's submit
                // For review step, Next is not shown
              }} disabled>
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
