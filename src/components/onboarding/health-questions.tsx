
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
  import { Textarea } from "@/components/ui/textarea"
  import * as z from "zod"
  import { zodResolver } from "@hookform/resolvers/zod"
  import { useForm } from "react-hook-form"
  
  const formSchema = z.object({
    weight: z.number().optional().describe('Your weight in kilograms'),
    knownDiseases: z.string().optional().describe('Any known diseases you have'),
    allergies: z.string().optional().describe('Any allergies you have'),
    currentMedications: z.string().optional().describe('Any current medications you are taking'),
  })
  
  interface HealthQuestionsProps {
    defaultValues?: z.infer<typeof formSchema>
    onSubmit: (values: z.infer<typeof formSchema>) => void
  }
  
  export function HealthQuestionsForm({
    defaultValues,
    onSubmit,
  }: HealthQuestionsProps) {
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
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 70" type="number" {...field} />
                </FormControl>
                <FormDescription>
                  Your weight in kilograms.
                </FormDescription>
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
                <FormDescription>
                  Any known diseases you have.
                </FormDescription>
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
                <FormDescription>
                  Any allergies you have.
                </FormDescription>
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
                <FormDescription>
                  Any current medications you are taking.
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
  
