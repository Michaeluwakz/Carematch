
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  import { Slider } from "@/components/ui/slider"
  import { Switch } from "@/components/ui/switch"
  import * as z from "zod"
  import { zodResolver } from "@hookform/resolvers/zod"
  import { useForm } from "react-hook-form"
  
  const formSchema = z.object({
    dietaryHabits: z.enum(['unspecified', 'balanced', 'low-carb', 'vegetarian', 'vegan', 'other']).optional().describe('Your dietary habits'),
    sleepHours: z.number().min(0).max(24).optional().describe('Average hours of sleep per night'),
    exerciseFrequency: z.enum(['unspecified', 'never', '1-2_times_week', '3-4_times_week', '5-7_times_week']).optional().describe('How often do you exercise'),
  })
  
  interface LifestyleQuestionsProps {
    defaultValues?: z.infer<typeof formSchema>
    onSubmit: (values: z.infer<typeof formSchema>) => void
  }
  
  export function LifestyleQuestionsForm({
    defaultValues,
    onSubmit,
  }: LifestyleQuestionsProps) {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues,
    })
  
    function handleOnSubmit(values: z.infer<typeof formSchema>) {
      onSubmit(values)
    }
  
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="dietaryHabits"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dietary Habits</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormDescription>
                  Your dietary habits.
                </FormDescription>
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
                  <Slider
                    defaultValue={[field.value || 0]}
                    max={24}
                    step={0.5}
                    onValueChange={(value) => field.onChange(value[0])}
                    aria-label="Sleep hours"
                  />
                </FormControl>
                <FormDescription>
                  Average hours of sleep per night.
                </FormDescription>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <FormDescription>
                  How often do you exercise.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <button type="submit">Submit</button>
        </form>
      </Form>
    )
  }
  
