
'use server';
/**
 * @fileOverview An AI Health Coach providing personalized lifestyle advice.
 *
 * - aiHealthCoachFlow - Generates diet, exercise, sleep, and stress management advice.
 * - AiHealthCoachInput - Input type for the flow.
 * - AiHealthCoachOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import {z} from 'genkit';
import type { UserProfile } from '@/lib/types'; // Assuming UserProfile is defined here
import OpenAI from 'openai';

// Re-define a Zod schema for UserProfile to be used in the flow input
// This avoids directly importing a complex type that might have issues in Genkit's schema generation
// Only include fields relevant to the health coach
const UserProfileSchemaForAI = z.object({
  age: z.number().optional().describe('User\'s age.'),
  genderIdentity: z.string().optional().describe('User\'s gender identity.'),
  weight: z.number().optional().describe('User\'s weight. (Unit context may be needed, e.g. kg or lbs)'),
  knownDiseases: z.string().optional().describe('User\'s known diseases or chronic conditions (e.g., "Type 2 Diabetes, Hypertension").'),
  allergies: z.string().optional().describe('User\'s known allergies (e.g., "Peanuts, Penicillin").'),
  currentMedications: z.string().optional().describe('User\'s current medications (e.g., "Metformin 500mg, Lisinopril 10mg").'),
  // Height would be useful for BMI, but not currently in UserProfile
  // height: z.number().optional().describe('User\'s height (e.g., in cm or inches).')
}).describe('Relevant parts of the user\'s health profile.');


const ResourceLinkSchema = z.object({
  title: z.string().describe('The display title for the resource link.'),
  url: z.string().describe('The URL to the resource. This can be an external link (https://...) or an internal app route (e.g., /care-navigator).'),
});

const AiHealthCoachInputSchema = z.object({
  userProfile: UserProfileSchemaForAI.describe('The user\'s health profile data.'),
  userGoals: z.string().min(5, {message: "Please describe your health goals in a bit more detail."}).describe('The user\'s stated health goals (e.g., "I want to lose 10 pounds and have more energy").'),
  specificQuery: z.string().optional().describe('An optional specific question the user has for the health coach (e.g., "What are some good low-impact exercises for knee pain?").'),
  language: z.string().optional().describe('The preferred language for the advice. Defaults to English. (e.g., "English", "Spanish", "French", "Hindi", "Swahili")'),
});
export type AiHealthCoachInput = z.infer<typeof AiHealthCoachInputSchema>;

const AiHealthCoachOutputSchema = z.object({
  personalizedSummary: z.string().describe('A brief summary of how the advice is tailored to the user, acknowledging their profile and goals.'),
  dietAdvice: z.string().describe('Personalized dietary recommendations. Should consider conditions, allergies, and goals.'),
  exerciseAdvice: z.string().describe('Personalized exercise suggestions. Should consider conditions, weight, and goals. Suggest general types and frequencies.'),
  sleepAdvice: z.string().describe('General tips for improving sleep hygiene, potentially linked to stated goals like "more energy".'),
  stressManagementAdvice: z.string().describe('General techniques for stress reduction, relevant if goals mention stress.'),
  disclaimer: z.string().describe('A standard disclaimer stating this is not medical advice and to consult professionals.'),
  timetable: z.any().optional().describe('A JSON array of objects representing a weekly timetable for either exercises or nutrition, with day, time, and activity.'),
  resourceLinks: z.array(ResourceLinkSchema).optional().describe('Optional links to relevant resources (external or internal app pages). Recommend up to 3 only if helpful for the user\'s query.'),
});
export type AiHealthCoachOutput = z.infer<typeof AiHealthCoachOutputSchema>;

export async function aiHealthCoachFlow(input: AiHealthCoachInput): Promise<AiHealthCoachOutput> {
  const targetLanguage = input.language || 'English';
  // Construct the prompt text
  let promptText = `You are a helpful, articulate, and engaging AI assistant. Your responses should be clear, concise, and tailored to the user’s needs. Prioritize accuracy, relevance, and natural language—avoid robotic or overly technical phrasing unless requested. Maintain a polite and professional tone, adapting to context when appropriate (e.g., casual for informal queries, structured for complex topics).

Focus on delivering value: answer questions thoroughly, offer insights when useful, and avoid unnecessary repetition. If clarification is needed, ask follow-up questions politely. Always uphold ethical guidelines, avoiding harmful, biased, or misleading content.

When listing information, use bullet points or numbers and bold headings (with <b> tags, not markdown). Do not use *, **, or ##.

Your goal is to assist users effectively while ensuring a smooth, human-like interaction.

If the user would benefit from a trusted resource, you may recommend up to 3 relevant resources. These can be:
- External reputable health sites (e.g., CDC, WHO, Mayo Clinic, MedlinePlus, etc.)
- Internal app features (e.g., /care-navigator, /document-parser, /my-health-record, /reminders, /onboarding, /notifications)
For each, provide a clear title and a direct link (full URL for external, or app route for internal). Only include resourceLinks if truly helpful for the user’s query; omit otherwise.

User's Health Profile:
- Age: ${input.userProfile.age || 'Not provided'}
- Gender Identity: ${input.userProfile.genderIdentity || 'Not provided'}
- Weight: ${input.userProfile.weight ? `${input.userProfile.weight} (unit assumed from input, e.g. kg or lbs)` : 'Not provided'}
- Known Diseases/Conditions: ${input.userProfile.knownDiseases || 'None reported'}
- Allergies: ${input.userProfile.allergies || 'None reported'}
- Current Medications: ${input.userProfile.currentMedications || 'None reported'}

User's Stated Goals: "${input.userGoals}"
${input.specificQuery ? `User's Specific Question: "${input.specificQuery}"` : ''}
Preferred Language for Response: ${targetLanguage}

Your Task:
Generate a personalized health plan covering the following areas. Ensure advice is safe and considers the user's profile.
**Remember to provide the entire response in ${targetLanguage}.**

1.  **Personalized Summary:** Start with a brief summary acknowledging the user's key profile points and goals, and how your advice connects to them. (In ${targetLanguage})
2.  **Diet Advice:**
    *   Provide specific, actionable dietary recommendations. (In ${targetLanguage})
    *   If known diseases (e.g., diabetes, hypertension) are listed, tailor advice accordingly (e.g., low-GI foods for diabetes, DASH diet principles for hypertension).
    *   Consider allergies. Do NOT recommend foods the user is allergic to.
    *   Align with user goals (e.g., calorie deficit for weight loss, balanced macros for energy).
    *   Suggest general meal ideas or food types rather than strict meal plans.
3.  **Exercise Advice:**
    *   Recommend types of physical activity suitable for the user. (In ${targetLanguage})
    *   If known conditions affect mobility (e.g., arthritis, knee pain - infer if not explicitly stated but related to diseases), suggest low-impact exercises.
    *   Consider weight and goals (e.g., cardio for weight loss, strength training for muscle gain).
    *   Suggest a general frequency and duration (e.g., "aim for 30 minutes of moderate activity, 5 days a week").
4.  **Sleep Advice:**
    *   Provide general tips for improving sleep hygiene (e.g., consistent schedule, cool dark room, limit screen time before bed). (In ${targetLanguage})
    *   Connect to goals if relevant (e.g., for "more energy").
5.  **Stress Management Advice:**
    *   Offer general, safe techniques for stress reduction (e.g., mindfulness, deep breathing, hobbies). (In ${targetLanguage})
    *   Address if goals relate to stress or mental well-being.
6.  **Timetable:**
    *   Based on the user's goals and preferences, generate a sample weekly timetable as a JSON array for either exercise or nutrition (whichever is most relevant to their goals). Each entry should have a 'day', 'time', and 'activity'.
    *   Example:
        [
          { "day": "Monday", "time": "7:00 AM", "activity": "30 min brisk walk" },
          { "day": "Monday", "time": "12:30 PM", "activity": "Grilled chicken salad for lunch" },
          { "day": "Tuesday", "time": "7:00 AM", "activity": "Yoga session" },
          { "day": "Tuesday", "time": "12:30 PM", "activity": "Quinoa bowl for lunch" }
        ]
    *   If the user is focused on exercise, make the timetable about workouts. If focused on nutrition, make it about meals. If both, include a mix.
    *   Output this timetable as a JSON array in the 'timetable' field of your response object.
7.  **Disclaimer:** ALWAYS conclude with the following disclaimer, translated accurately into ${targetLanguage}: "This information is for educational purposes only and is not a substitute for professional medical advice and diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read here."

Guidelines:
*   Be empathetic, encouraging, and positive.
*   Focus on actionable, realistic, and sustainable changes.
*   Avoid overly restrictive or extreme recommendations.
*   If user information is missing (e.g., height for BMI), acknowledge this limitation and provide general advice or advice based on stated weight goals.
*   If a specific query is provided, try to address it within the relevant section of your advice.
*   Output must be a JSON object adhering to the AiHealthCoachOutputSchema. **All textual content within the JSON object must be in ${targetLanguage}.**
`;

  if (input.userProfile.weight && !input.userProfile.knownDiseases?.toLowerCase().includes("eating disorder")) {
    // A very rough estimation. In a real app, height would be needed for BMI.
    // This is just to give the AI some context if weight is high or low.
    // This logic is highly simplistic and for demonstration only.
    if (input.userProfile.age && input.userProfile.age > 18) { // Adults
        // Assume average height for rough context if not provided
        // For example, if weight is > 100kg (220lbs) or < 40kg (88lbs) for an adult, it's notable
        if (input.userProfile.weight > 100) {
            promptText += `\nNote: User's weight is over 100 (unit not specified, but notable if kg). Consider this in energy balance discussions for weight management if a goal. (This note is for AI context, not for user output).\n`;
        } else if (input.userProfile.weight < 40) {
             promptText += `\nNote: User's weight is under 40 (unit not specified, but notable if kg). If user goals are not about gaining weight, ensure advice is sensitive and doesn't promote further loss if underweight. (This note is for AI context, not for user output).\n`;
        }
    }
  }


  const llmResponse = await ai.generate({
    model: gemini15Flash,
    prompt: promptText,
    output: {
      format: 'json',
      schema: AiHealthCoachOutputSchema,
    },
    config: {
      safetySettings: [
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        // Other safety settings as needed
      ],
    }
  });

  const output = llmResponse.output;
  if (!output) {
    throw new Error('AI response did not contain the expected output structure for health coach.');
  }
  // Ensure disclaimer is always present and correctly starts (AI will handle translation).
  // The check here is to ensure the AI *attempted* to provide a disclaimer.
  const requiredDisclaimerStart = "This information is for educational purposes only";
  const translatedDisclaimerStart = targetLanguage === 'Spanish' ? "Esta información es solo para fines educativos"
                                 : targetLanguage === 'French' ? "Ces informations sont fournies à des fins éducatives uniquement"
                                 : targetLanguage === 'Hindi' ? "यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है"
                                 : targetLanguage === 'Swahili' ? "Habari hii ni kwa madhumuni ya kielimu pekee"
                                 : requiredDisclaimerStart; // Default to English if other language

  if (!output.disclaimer || !output.disclaimer.toLowerCase().startsWith(translatedDisclaimerStart.substring(0,20).toLowerCase())) {
    // If AI failed to include a proper disclaimer in the target language, fallback to English
    // (or ideally, have pre-translated disclaimers)
    console.warn(`AI failed to provide a suitable disclaimer in ${targetLanguage}. Falling back to English. AI output: ${output.disclaimer}`);
    output.disclaimer = `This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read here. (Disclaimer provided in English due to translation issue).`;
  }

  return output as AiHealthCoachOutput;
}

/**
 * DeepSeek-powered AI Health Coach (OpenRouter)
 */
export async function aiHealthCoachDeepSeekFlow(input: AiHealthCoachInput): Promise<AiHealthCoachOutput> {
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000',
      'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'CareMatch AI',
    },
  });
  const profileSummary = `User Profile:\n- Age: ${input.userProfile.age || 'Not provided'}\n- Gender: ${input.userProfile.genderIdentity || 'Not provided'}\n- Weight: ${input.userProfile.weight || 'Not provided'}\n- Known Diseases: ${input.userProfile.knownDiseases || 'None reported'}\n- Allergies: ${input.userProfile.allergies || 'None reported'}\n- Current Medications: ${input.userProfile.currentMedications || 'None reported'}`;
  const systemPrompt = `You are a helpful, articulate, and engaging AI assistant. Your responses should be clear, concise, and tailored to the user’s needs. Prioritize accuracy, relevance, and natural language—avoid robotic or overly technical phrasing unless requested. Maintain a polite and professional tone, adapting to context when appropriate (e.g., casual for informal queries, structured for complex topics).

Focus on delivering value: answer questions thoroughly, offer insights when useful, and avoid unnecessary repetition. If clarification is needed, ask follow-up questions politely. Always uphold ethical guidelines, avoiding harmful, biased, or misleading content.

When listing information, use bullet points or numbers and clear section headings. Never use *, **, ##, ###, or any markdown/HTML formatting. Use only plain text for headings and lists. Use appropriate, uplifting or calming emojis to make responses more friendly and clear, but do not overuse them.

Your goal is to assist users effectively while ensuring a smooth, human-like interaction.

${profileSummary}`;
  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.userGoals + (input.specificQuery ? (' ' + input.specificQuery) : '') },
      ],
      temperature: 0.5,
      max_tokens: 1024,
    });
    const responseText = (completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.')
      .replace(/\*\*|##+|\*/g, '');
    // Return in the same output schema as Gemini (best effort)
    return {
      personalizedSummary: responseText,
      dietAdvice: '',
      exerciseAdvice: '',
      sleepAdvice: '',
      stressManagementAdvice: '',
      disclaimer: "This information is for educational purposes only and is not a substitute for professional medical advice. For urgent or serious concerns, consult a healthcare provider.",
      timetable: [],
      resourceLinks: []
    } as AiHealthCoachOutput;
  } catch (error: any) {
    console.error('DeepSeek API error:', error);
    return {
      personalizedSummary: `DeepSeek API error: ${error?.message || error?.toString() || 'Unknown error.'}`,
      dietAdvice: '',
      exerciseAdvice: '',
      sleepAdvice: '',
      stressManagementAdvice: '',
      disclaimer: "This information is for educational purposes only and is not a substitute for professional medical advice. For urgent or serious concerns, consult a healthcare provider.",
      timetable: [],
      resourceLinks: []
    } as AiHealthCoachOutput;
  }
}
