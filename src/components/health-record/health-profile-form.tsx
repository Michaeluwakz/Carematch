"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const healthProfileSchema = z.object({
  preferredName: z.string().optional(),
  preferredLanguage: z.string().min(1, "Preferred language is required."),
  age: z.coerce.number().min(1, "Age is required.").max(120, "Please enter a valid age.").optional().or(z.literal(undefined).transform(() => undefined)).or(z.literal('')),
  genderIdentity: z.string().optional(),
  weight: z.coerce.number().positive("Weight must be a positive number if entered.").optional().or(z.literal(undefined).transform(() => undefined)).or(z.literal('')),
  knownDiseases: z.string().optional(),
  allergies: z.string().optional(),
  currentMedications: z.string().optional(),
  dietaryHabits: z.string().optional(),
  sleepHours: z.coerce.number().min(0, "Cannot be negative.").max(24, "Please enter a valid number of hours (0-24)."),
  exerciseFrequency: z.string().optional(),
  consentDataProcessing: z.boolean().refine(val => val === true, {
    message: "You must consent to data processing to continue.",
  }),
  consentShareAnonymizedDataForResearch: z.boolean().optional(),
});

type HealthProfileFormValues = z.infer<typeof healthProfileSchema>;

type HealthProfileFormProps = {
  defaultValues?: Partial<HealthProfileFormValues>;
  onSubmit: (data: HealthProfileFormValues) => void;
  submitLabel?: string;
};

export function HealthProfileForm({ defaultValues, onSubmit, submitLabel = "Save" }: HealthProfileFormProps) {
  const form = useForm<HealthProfileFormValues>({
    resolver: zodResolver(healthProfileSchema),
    defaultValues: {
      preferredName: defaultValues?.preferredName || '',
      preferredLanguage: defaultValues?.preferredLanguage || '',
      age: defaultValues?.age || undefined,
      genderIdentity: defaultValues?.genderIdentity || '',
      weight: defaultValues?.weight || undefined,
      knownDiseases: defaultValues?.knownDiseases || '',
      allergies: defaultValues?.allergies || '',
      currentMedications: defaultValues?.currentMedications || '',
      dietaryHabits: defaultValues?.dietaryHabits || 'unspecified',
      sleepHours: defaultValues?.sleepHours || undefined,
      exerciseFrequency: defaultValues?.exerciseFrequency || 'unspecified',
      consentDataProcessing: defaultValues?.consentDataProcessing ?? false,
      consentShareAnonymizedDataForResearch: defaultValues?.consentShareAnonymizedDataForResearch ?? false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="preferredName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Preferred Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. John" {...field} />
              </FormControl>
              <FormDescription>This is the name that will be displayed in the app.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
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
                <Input type="number" placeholder="Enter your age" {...field} value={field.value === undefined ? '' : field.value} onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))} disabled={isSubmitting} />
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
              <FormLabel>Gender Identity</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Male, Female, Non-binary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. 70" type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="knownDiseases"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Known Diseases</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. Diabetes, Hypertension" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="allergies"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allergies</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. Pollen, Peanuts" className="resize-none" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currentMedications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Medications</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g. Lisinopril, Metformin" className="resize-none" {...field} />
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
              <FormLabel>Dietary Habits</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a dietary habit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unspecified">Unspecified</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="low-carb">Low Carb</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sleepHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sleep Hours</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Average hours of sleep per night" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="exerciseFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercise Frequency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a frequency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="unspecified">Unspecified</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="1-2_times_week">1-2 times a week</SelectItem>
                  <SelectItem value="3-4_times_week">3-4 times a week</SelectItem>
                  <SelectItem value="5-7_times_week">5-7 times a week</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="consentDataProcessing"
          render={({ field }) => (
            <FormItem className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-4 sm:gap-2">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Consent Data Processing *</FormLabel>
                <FormDescription>Do you consent to processing your data?</FormDescription>
              </div>
              <FormControl>
                <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="consentShareAnonymizedDataForResearch"
          render={({ field }) => (
            <FormItem className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-4 sm:gap-2">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Consent Share Anonymized Data For Research</FormLabel>
                <FormDescription>Do you consent to share anonymized data for research?</FormDescription>
              </div>
              <FormControl>
                <input type="checkbox" checked={field.value} onChange={e => field.onChange(e.target.checked)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
} 