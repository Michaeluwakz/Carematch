"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, HeartPulse, Utensils, Dumbbell, BedDouble, Clock, AlertTriangle, Zap, Award } from "lucide-react";

const steps = [
  { label: "Health Goals", icon: <HeartPulse className="h-6 w-6 text-pink-500" /> },
  { label: "Diet Preferences", icon: <Utensils className="h-6 w-6 text-green-500" /> },
  { label: "Fitness Level", icon: <Dumbbell className="h-6 w-6 text-blue-500" /> },
  { label: "Lifestyle", icon: <Clock className="h-6 w-6 text-yellow-500" /> },
  { label: "Biometrics", icon: <Award className="h-6 w-6 text-purple-500" /> },
];

export default function CoachOnboarding({ onComplete }: { onComplete?: (data: any) => void }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    goals: "",
    diet: "",
    allergies: "",
    dislikes: "",
    fitness: "",
    injuries: "",
    equipment: "",
    workoutTime: "",
    sleep: "",
    stress: "",
    weight: "",
    height: "",
    heartRate: "",
  });
  const [completed, setCompleted] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setCompleted(true);
    onComplete?.(form);
  };

  return (
    <Card className="max-w-xl mx-auto mt-10 shadow-2xl border-0 bg-white/90 dark:bg-gray-900/90">
      <CardHeader className="flex flex-col items-center gap-2 pb-2">
        <div className="flex gap-3 items-center">
          {steps.map((s, i) => (
            <div key={s.label} className={`flex flex-col items-center ${i === step ? "" : "opacity-50"}`}>
              {s.icon}
              <span className="text-xs mt-1">{s.label}</span>
            </div>
          ))}
        </div>
        <Progress value={((step + 1) / steps.length) * 100} className="w-full mt-4" />
      </CardHeader>
      <CardContent>
        {!completed ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 0 && (
              <div>
                <Label htmlFor="goals">What are your main health goals?</Label>
                <Input id="goals" value={form.goals} onChange={e => handleChange("goals", e.target.value)} placeholder="e.g. Lose weight, build muscle, reduce stress" required />
              </div>
            )}
            {step === 1 && (
              <div className="space-y-3">
                <Label htmlFor="diet">Dietary Preferences</Label>
                <Input id="diet" value={form.diet} onChange={e => handleChange("diet", e.target.value)} placeholder="e.g. Vegan, keto, low-carb" required />
                <Label htmlFor="allergies">Allergies</Label>
                <Input id="allergies" value={form.allergies} onChange={e => handleChange("allergies", e.target.value)} placeholder="e.g. Peanuts, gluten" />
                <Label htmlFor="dislikes">Disliked Foods</Label>
                <Input id="dislikes" value={form.dislikes} onChange={e => handleChange("dislikes", e.target.value)} placeholder="e.g. Broccoli, fish" />
              </div>
            )}
            {step === 2 && (
              <div className="space-y-3">
                <Label htmlFor="fitness">Fitness Level</Label>
                <Input id="fitness" value={form.fitness} onChange={e => handleChange("fitness", e.target.value)} placeholder="e.g. Beginner, intermediate, advanced" required />
                <Label htmlFor="injuries">Injuries/Limitations</Label>
                <Input id="injuries" value={form.injuries} onChange={e => handleChange("injuries", e.target.value)} placeholder="e.g. Knee pain, back injury" />
                <Label htmlFor="equipment">Available Equipment</Label>
                <Input id="equipment" value={form.equipment} onChange={e => handleChange("equipment", e.target.value)} placeholder="e.g. Dumbbells, resistance bands, none" />
              </div>
            )}
            {step === 3 && (
              <div className="space-y-3">
                <Label htmlFor="workoutTime">Preferred Workout Times</Label>
                <Input id="workoutTime" value={form.workoutTime} onChange={e => handleChange("workoutTime", e.target.value)} placeholder="e.g. Mornings, evenings" />
                <Label htmlFor="sleep">Sleep Schedule</Label>
                <Input id="sleep" value={form.sleep} onChange={e => handleChange("sleep", e.target.value)} placeholder="e.g. 10pm-6am" />
                <Label htmlFor="stress">Stress Triggers</Label>
                <Input id="stress" value={form.stress} onChange={e => handleChange("stress", e.target.value)} placeholder="e.g. Work, family" />
              </div>
            )}
            {step === 4 && (
              <div className="space-y-3">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input id="weight" type="number" value={form.weight} onChange={e => handleChange("weight", e.target.value)} placeholder="e.g. 70" required />
                <Label htmlFor="height">Height (cm)</Label>
                <Input id="height" type="number" value={form.height} onChange={e => handleChange("height", e.target.value)} placeholder="e.g. 175" required />
                <Label htmlFor="heartRate">Resting Heart Rate (bpm)</Label>
                <Input id="heartRate" type="number" value={form.heartRate} onChange={e => handleChange("heartRate", e.target.value)} placeholder="e.g. 60" />
              </div>
            )}
            <div className="flex justify-between mt-8">
              <Button type="button" variant="outline" onClick={prev} disabled={step === 0}>Back</Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={next}>Next</Button>
              ) : (
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">Finish</Button>
              )}
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <h2 className="text-2xl font-bold text-green-700">Onboarding Complete!</h2>
            <p className="text-gray-700 dark:text-gray-200 text-center">Your preferences have been saved. The AI Coach will now generate a personalized plan for you.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 