
'use server';
/**
 * @fileOverview Generates personalized health insights based on user-provided data.
 * - generateHealthInsights - Generates diet, sleep, and exercise recommendations.
 * - HealthInsightsInput - Input type for the flow.
 * - HealthInsightsOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import {z} from 'genkit';

const HealthInsightsInputSchema = z.object({
  dietaryHabits: z.string().optional().describe("User's primary dietary style (e.g., 'balanced', 'low-carb', 'vegetarian')."),
  sleepHours: z.number().optional().describe("User's average hours of sleep per night."),
  exerciseFrequency: z.string().optional().describe("How often the user exercises per week (e.g., 'never', '1-2_times_week')."),
  knownDiseases: z.string().optional().describe("User's known chronic conditions to consider for safety."),
  userGoals: z.string().optional().describe("User's general health goals for more tailored advice."),
});
export type HealthInsightsInput = z.infer<typeof HealthInsightsInputSchema>;

const HealthInsightsOutputSchema = z.object({
  dietInsight: z.string().describe('Personalized recommendation based on dietary habits.'),
  sleepInsight: z.string().describe('Personalized recommendation based on sleep hours.'),
  exerciseInsight: z.string().describe('Personalized recommendation based on exercise frequency.'),
  overallSummary: z.string().describe('A brief, encouraging summary of the insights provided.'),
  disclaimer: z.string().describe('A standard disclaimer stating this is not medical advice.'),
});
export type HealthInsightsOutput = z.infer<typeof HealthInsightsOutputSchema>;

export async function generateHealthInsights(input: HealthInsightsInput): Promise<HealthInsightsOutput> {
  const promptText = `
You are an AI Health Advisor. Your role is to provide personalized, supportive, and actionable health insights based on the user's diet, sleep, and exercise data. You must consider their known health conditions for safety.

User's Health Data:
- Dietary Habits: ${input.dietaryHabits?.replace(/_/g, ' ') || 'Not provided'}
- Average Sleep per Night: ${input.sleepHours !== undefined ? `${input.sleepHours} hours` : 'Not provided'}
- Exercise Frequency: ${input.exerciseFrequency?.replace(/_/g, ' ') || 'Not provided'}
- Known Conditions: ${input.knownDiseases || 'None reported'}
- User Goals: ${input.userGoals || 'General improvement'}

Your Task:
Generate a set of personalized insights. Keep the advice positive, encouraging, and easy to understand.

1.  **Diet Insight:** Based on their dietary habits, provide one key suggestion. For example, if they are 'vegetarian', suggest a good source of plant-based protein. If 'low-carb', suggest a healthy fat source. If not provided or 'unspecified', give a general tip for a balanced diet.
2.  **Sleep Insight:** Based on their average sleep hours, provide a recommendation. If sleep is low (e.g., < 6 hours), suggest a tip for improving sleep hygiene. If sleep is good (e.g., 7-9 hours), praise them and offer a tip for maintaining consistency. If not provided, give a general tip about the importance of sleep.
3.  **Exercise Insight:** Based on their exercise frequency, provide an encouraging tip. If 'never', suggest a simple way to start, like a 10-minute walk. If '1-2 times a week', suggest adding another day or trying a new activity. If frequent, praise them and suggest listening to their body to avoid overtraining. If not provided or 'unspecified', give a general tip on the benefits of regular movement.
4.  **Overall Summary:** Write a brief, positive summary of the insights, encouraging the user on their health journey based on the data provided.
5.  **Disclaimer:** ALWAYS conclude with the following disclaimer: "This information is for educational purposes only and is not a substitute for professional medical advice. Always consult with a qualified healthcare provider for any health concerns."

Ensure your response is a JSON object strictly adhering to the HealthInsightsOutputSchema.
`;

  const llmResponse = await ai.generate({
    model: gemini15Flash,
    prompt: promptText,
    output: {
      format: 'json',
      schema: HealthInsightsOutputSchema,
    },
     config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ]
      }
  });

  const output = llmResponse.output;
  if (!output) {
    throw new Error('AI response did not contain the expected output structure for health insights.');
  }
  return output as HealthInsightsOutput;
}
