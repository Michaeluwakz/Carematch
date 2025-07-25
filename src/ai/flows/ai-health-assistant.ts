
'use server';

/**
 * @fileOverview An Autonomous AI Health Companion offering multilingual support, health information,
 * appointment booking assistance, and reminder capabilities. It aims to understand symptoms,
 * assist with document interpretation (by suggesting the user try the 'Document Parser' feature), connect users with care providers,
 * learn from public health data over time, advise on medication persistence, and provide
 * general context-aware health tips if location is mentioned. It can also detect potential
 * emergency situations from user input and advise accordingly, ask clarifying questions in non-emergency scenarios,
 * discuss traditional remedies in a balanced way, and offer gentle AI-driven check-ins for preventive/chronic care if contextually relevant.
 *
 * - aiHealthAssistant - The main function for the companion's capabilities.
 * - AiHealthAssistantInput - The input type for the aiHealthAssistant function.
 * - AiHealthAssistantOutput - The return type for the aiHealthAssistant function.
 */

import {ai} from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import {z} from 'genkit';
import { Timestamp } from 'firebase/firestore'; // Required for date handling
import type { UserProfile } from '@/lib/types';
import OpenAI from 'openai';

const AiHealthAssistantInputSchema = z.object({
  query: z.string().describe('The user query about their symptoms, health concerns, or appointment requests. Can include location context or mention of traditional remedies.'),
  language: z.string().optional().describe('The preferred language of the user. Defaults to English.'),
  userProfile: z.any().optional().describe('The latest user health profile for personalized recommendations.'),
});

export type AiHealthAssistantInput = z.infer<typeof AiHealthAssistantInputSchema> & { userProfile?: UserProfile; symptomImageDataUri?: string; userAnalytics?: any };

const AppointmentOfferSchema = z.object({
  type: z.enum(['booking', 'reminder']).describe('The type of action being offered.'),
  message: z.string().describe('A message from the AI offering to help with booking or a reminder.'),
  requiredDetails: z.array(z.string()).optional().describe('If more details are needed from the user to proceed (e.g., "doctor name", "date and time").'),
});

const DraftVisitSummaryDataSchema = z.object({
    clinicName: z.string().describe("The name of the clinic or hospital for the appointment."),
    doctorName: z.string().optional().describe("The name of the doctor, if specified."),
    reasonForVisit: z.string().describe("The primary reason or purpose of the appointment."),
    // The visitDate will be string from LLM, conversion to Timestamp happens later
    visitDateString: z.string().describe("The date and time of the appointment as a string (e.g., 'July 28th at 3 PM', 'Next Tuesday morning'). The AI should try to resolve this to a specific date if possible from context, otherwise use the textual description."),
}).describe("Data for creating a draft visit summary after a successful booking by a tool.");

const ResourceLinkSchema = z.object({
  title: z.string().describe('The display title for the resource link.'),
  url: z.string().describe('The URL to the resource. This can be an external link (https://...) or an internal app route (e.g., /care-navigator).'),
});

const AiHealthAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s textual response to the user query. This may include empathetic check-in questions if relevant.'),
  appointmentOffer: AppointmentOfferSchema.optional().nullable().describe('If the AI is offering to book an appointment or set a reminder, details are here. If no offer is made, this field should be omitted from the JSON output or be null.'),
  bookingConfirmation: z.string().optional().nullable().describe('Confirmation message if an appointment was successfully booked via a tool.'),
  draftVisitSummaryData: DraftVisitSummaryDataSchema.optional().nullable().describe("If an appointment was booked via a tool, this contains data to pre-fill a draft visit summary. Omit if no booking occurred or if tool failed, or set to null."),
  reminderConfirmation: z.string().optional().nullable().describe('Confirmation message if a reminder was successfully set via a tool.'),
  emergencyDetected: z.boolean().optional().describe("True if the AI suspects an emergency based on user input."),
  emergencyAdvice: z.string().optional().nullable().describe("Direct advice to the user if an emergency is suspected, e.g., to call emergency services."),
  informationSummaryForEmergency: z.string().optional().nullable().describe("A brief summary of the situation for the user to relay to emergency personnel or contacts if an emergency is suspected. This summary should be based on the user's current input and any immediate context. If user profile details (like known critical conditions) are highly relevant AND the AI has been explicitly provided them in a prior turn (not assumed), they can be cautiously included."),
  clarifyingQuestions: z.array(z.string()).optional().describe('If the AI needs more information to understand the user\'s health concern better, especially in a non-emergency context, it can list 1-2 concise clarifying questions here. These are for the user to answer in their next turn.'),
  offerToSummarizeAndTranslateForDoctor: z.boolean().optional().describe("True if the AI is offering to summarize the user's current issue and translate it (e.g., to English) for a doctor."),
  summarizedUserQueryForDoctor: z.string().optional().nullable().describe("A concise summary of the user's health concern, possibly translated, intended for the user to share with their doctor."),
  offerToTranslateDoctorNotes: z.boolean().optional().describe("True if the AI is offering to translate notes or advice the user received from a doctor."),
  translatedDoctorNotes: z.string().optional().nullable().describe("The user's doctor's notes/advice, translated into the user's preferred language."),
  drugHerbInteractionWarning: z.string().optional().nullable().describe("A specific warning if a potential drug-herb interaction is identified based on user input about medications and herbal remedies. This should be general and advise consulting a professional."),
  followUp: z.object({
    delayHours: z.number().describe('The number of hours to wait before sending the check-in.'),
    checkInMessage: z.string().describe('The content of the check-in message.')
  }).optional().nullable().describe('If a follow-up check-in is warranted, details are here.'),
  resourceLinks: z.array(ResourceLinkSchema).optional().describe('Optional links to relevant resources (external or internal app pages). Recommend up to 3 only if helpful for the user\'s query.'),
});

export type AiHealthAssistantOutput = z.infer<typeof AiHealthAssistantOutputSchema>;

const BookAppointmentInputSchema = z.object({
  appointmentDetails: z.string().describe('A descriptive string of the appointment to book, including doctor/clinic, purpose, date, and time. e.g., "Dr. Jane Doe, Annual Checkup, July 28th at 3 PM".'),
  clinicName: z.string().optional().describe("The name of the clinic or hospital. Extract from appointmentDetails if possible."),
  doctorName: z.string().optional().describe("The name of the doctor. Extract from appointmentDetails if possible."),
  reasonForVisit: z.string().optional().describe("The reason for the visit. Extract from appointmentDetails if possible."),
  dateTimeString: z.string().optional().describe("The date and time of the appointment. Extract from appointmentDetails if possible.")
});
const BookAppointmentOutputSchema = z.object({
  confirmationMessage: z.string().describe('A message confirming the booking attempt, e.g., "Appointment for Dr. Jane Doe on July 28th at 3 PM has been requested." or "Booking failed: Slot not available."'),
  bookingId: z.string().optional().describe('A unique ID for the booking if successful.'),
  bookedClinicName: z.string().optional(),
  bookedDoctorName: z.string().optional(),
  bookedReason: z.string().optional(),
  bookedDateTimeString: z.string().optional(),
});

const bookAppointmentTool = ai.defineTool(
  {
    name: 'bookAppointmentTool',
    description: 'Books a medical appointment for the user. Only use this after confirming all necessary details with the user (who, what, when, where). Do not use if an emergency is suspected; prioritize emergency advice. Extract clinicName, doctorName, reasonForVisit, and dateTimeString from the appointmentDetails to pass as distinct fields if possible.',
    inputSchema: BookAppointmentInputSchema,
    outputSchema: BookAppointmentOutputSchema,
  },
  async (input) => {
    console.log('[Tool Called] bookAppointmentTool with input:', input);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (Math.random() > 0.2) { 
        const bookingId = `BK-${Date.now()}`;
        return {
            confirmationMessage: `Placeholder: Appointment for "${input.appointmentDetails}" has been successfully requested. Confirmation ID: ${bookingId}.`,
            bookingId: bookingId,
            bookedClinicName: input.clinicName || "The Clinic (from details)",
            bookedDoctorName: input.doctorName,
            bookedReason: input.reasonForVisit || "Checkup (from details)",
            bookedDateTimeString: input.dateTimeString || "Next available (from details)",
        };
    } else {
        return {
            confirmationMessage: `Placeholder: We encountered an issue trying to book the appointment for "${input.appointmentDetails}". Please try again or contact the clinic directly.`,
        };
    }
  }
);

const SetReminderInputSchema = z.object({
  reminderDetails: z.string().describe('A descriptive string for what the reminder is about, e.g., "Appointment with Dr. Smith for checkup".'),
  remindAtDescription: z.string().describe('When the reminder should be set, e.g., "1 hour before the appointment on July 28th at 3 PM", or "Tomorrow at 10 AM to call the clinic". The AI should derive a specific time if possible.'),
});
const SetReminderOutputSchema = z.object({
  confirmationMessage: z.string().describe('A message confirming the reminder has been set, e.g., "Reminder set for \'Appointment with Dr. Smith\' 1 hour before."'),
  reminderId: z.string().optional().describe('A unique ID for the reminder if successful.'),
});

const setReminderTool = ai.defineTool(
  {
    name: 'setReminderTool',
    description: 'Sets a reminder for the user, typically related to a medical appointment or health task. Confirm details before using. Do not use if an emergency is suspected; prioritize emergency advice.',
    inputSchema: SetReminderInputSchema,
    outputSchema: SetReminderOutputSchema,
  },
  async (input) => {
    console.log('[Tool Called] setReminderTool with input:', input);
    await new Promise(resolve => setTimeout(resolve, 500));
    const reminderId = `REM-${Date.now()}`;
    return {
      confirmationMessage: `Placeholder: Reminder set for "${input.reminderDetails}" around ${input.remindAtDescription}. Reminder ID: ${reminderId}.`,
      reminderId: reminderId,
    };
  }
);


export async function aiHealthAssistant(input: AiHealthAssistantInput & { escalationMetrics?: { total: number; pending: number; avgResolutionTime: number } }): Promise<AiHealthAssistantOutput> {
  return aiHealthAssistantFlow(input);
}

const aiHealthAssistantFlow = ai.defineFlow(
  {
    name: 'aiHealthAssistantFlow',
    inputSchema: AiHealthAssistantInputSchema,
    outputSchema: AiHealthAssistantOutputSchema,
  },
  async (input: AiHealthAssistantInput & { escalationMetrics?: { total: number; pending: number; avgResolutionTime: number } }): Promise<AiHealthAssistantOutput> => {
    const userLanguage = input.language || 'English';
    const userProfile = input.userProfile || {};
    const userAnalytics = input.userAnalytics || {};
    const escalationMetrics = input.escalationMetrics;
    // --- PERSONALIZED PROMPT ---
    const profileSummary = `
User Profile:
- Name: ${userProfile.preferredName || 'Not provided'}
- Age: ${userProfile.age || 'Not provided'}
- Gender: ${userProfile.genderIdentity || 'Not provided'}
- Known Diseases: ${userProfile.knownDiseases || 'None reported'}
- Allergies: ${userProfile.allergies || 'None reported'}
- Current Medications: ${userProfile.currentMedications || 'None reported'}
- Weight: ${userProfile.weight || 'Not provided'}
- Dietary Habits: ${userProfile.dietaryHabits || 'Not provided'}
- Sleep Hours: ${userProfile.sleepHours || 'Not provided'}
- Exercise Frequency: ${userProfile.exerciseFrequency || 'Not provided'}
- Immunizations: ${userProfile.immunizationRecords && userProfile.immunizationRecords.length > 0 ? userProfile.immunizationRecords.map((i: { vaccineName: string }) => i.vaccineName).join(', ') : 'Not provided'}
`;
    // --- HEALTH ANALYTICS SUMMARY ---
    const analyticsSummary = userAnalytics && (userAnalytics.healthScore !== undefined || userAnalytics.riskFlag || (userAnalytics.aiRecommendations && userAnalytics.aiRecommendations.length > 0)) ? `
Health Analytics:
- AI Health Score: ${userAnalytics.healthScore !== undefined ? userAnalytics.healthScore + ' / 100' : 'Not available'}
- Risk Level: ${userAnalytics.riskFlag?.level ? userAnalytics.riskFlag.level : 'Not available'}${userAnalytics.riskFlag?.message ? ' (' + userAnalytics.riskFlag.message + ')' : ''}
- AI Recommendations:${userAnalytics.aiRecommendations && userAnalytics.aiRecommendations.length > 0 ? '\n  - ' + userAnalytics.aiRecommendations.join('\n  - ') : ' None'}
` : '';
    // --- RISK/ALERTS SUMMARY ---
    const riskSummary = userAnalytics?.riskAlerts ? `
Risk & Alerts:
- Upcoming screenings: ${userAnalytics.riskAlerts.upcomingScreenings?.map((s: any) => s.name).join(', ') || 'None'}
- Medication adherence: ${userAnalytics.riskAlerts.medicationAdherence?.adherence || 100}% (missed: ${userAnalytics.riskAlerts.medicationAdherence?.missed || 0})
- Chronic condition risks: ${userAnalytics.riskAlerts.chronicConditionRisks?.join(', ') || 'None'}
` : '';
    // --- LIFESTYLE SUMMARY ---
    const lifestyleSummary = userAnalytics?.lifestyle ? `
Lifestyle & Behavior:
- Diet quality score: ${userAnalytics.lifestyle.dietQualityScore || 0}/100
- Hydration: ${userAnalytics.lifestyle.hydration?.status || 'unknown'} (avg: ${userAnalytics.lifestyle.hydration?.avg || 0} ml/day)
- Stress level: ${userAnalytics.lifestyle.stressLevel || 'unknown'}
` : '';
    // --- SOCIAL/ENVIRONMENTAL SUMMARY ---
    const socialSummary = userAnalytics?.social ? `
Social & Environmental:
- Loneliness status: ${userAnalytics.social.loneliness}
- Environmental risk: ${userAnalytics.social.environmentalRisk}
` : '';
    // --- PREVENTIVE HEALTH SUMMARY ---
    const preventiveSummary = userAnalytics?.preventive ? `
Preventive Health:
- Missing vaccines: ${userAnalytics.preventive.vaccination?.missing?.join(', ') || 'None'}
- Upcoming preventive reminders: ${userAnalytics.preventive.reminders?.map((r: any) => r.name).join(', ') || 'None'}
` : '';
    // --- AI RECOMMENDATIONS SUMMARY ---
    const aiRecSummary = userAnalytics?.aiRecommendations ? `
AI Recommendations:
- Action plans: ${userAnalytics.aiRecommendations.actionPlans?.join('; ') || 'None'}
- Motivational feedback: ${userAnalytics.aiRecommendations.motivationalFeedback}
` : '';
    // --- MENTAL HEALTH INSIGHTS SUMMARY ---
    const mentalHealthSummary = userAnalytics?.mentalHealth ? `
Mental Health Insights:
- Mood pattern: ${userAnalytics.mentalHealth.moodPattern}
- Burnout risk: ${userAnalytics.mentalHealth.burnoutRisk}
` : '';
    // --- ENGAGEMENT SUMMARY ---
    const engagementSummary = userAnalytics?.engagement ? `
Engagement Analytics:
- App engagement: ${userAnalytics.engagement.appEngagement}
- Recommendation follow rate: ${userAnalytics.engagement.recommendationFollowRate}%
` : '';
    // --- ESCALATION METRICS SUMMARY ---
    const escalationSummary = escalationMetrics ? `
Escalation Metrics:
- Total Escalated Cases: ${escalationMetrics.total}
- Pending Escalations: ${escalationMetrics.pending}
- Avg. Resolution Time: ${escalationMetrics.avgResolutionTime > 0 ? Math.round(escalationMetrics.avgResolutionTime / 60000) + ' min' : 'N/A'}
` : '';
    // --- CORE AI HEALTH COMPANION RESPONSIBILITIES ---
    // 1. Help users understand symptoms (explain, clarify, contextualize)
    // 2. Suggest when to seek care (including emergencies, urgent, routine)
    // 3. Provide health education (general info, prevention, chronic care, etc.)
    // 4. Assist with triage/navigation (route to Care Navigator, Document Parser, etc.)
    // 5. Flag possible conditions (never diagnose, but mention what could be considered)
    // These are now made explicit in the prompt below for consistent AI behavior.

    const promptText = `You are a helpful, articulate, and engaging AI assistant. Your responses should be clear, concise, and tailored to the user’s needs. Prioritize accuracy, relevance, and natural language—avoid robotic or overly technical phrasing unless requested. Maintain a polite and professional tone, adapting to context when appropriate (e.g., casual for informal queries, structured for complex topics).

Focus on delivering value: answer questions thoroughly, offer insights when useful, and avoid unnecessary repetition. If clarification is needed, ask follow-up questions politely. Always uphold ethical guidelines, avoiding harmful, biased, or misleading content.

When listing information, use bullet points or numbers and bold headings (with <b> tags, not markdown). Do not use *, **, or ##.

Your goal is to assist users effectively while ensuring a smooth, human-like interaction.

If the user would benefit from a trusted resource, you may recommend up to 3 relevant resources. These can be:
- External reputable health sites (e.g., CDC, WHO, Mayo Clinic, MedlinePlus, etc.)
- Internal app features (e.g., /care-navigator, /document-parser, /my-health-record, /reminders, /onboarding, /notifications)
For each, provide a clear title and a direct link (full URL for external, or app route for internal). Only include resourceLinks if truly helpful for the user’s query; omit otherwise.

${profileSummary}${analyticsSummary}${riskSummary}${lifestyleSummary}${socialSummary}${preventiveSummary}${aiRecSummary}${mentalHealthSummary}${engagementSummary}${escalationSummary}
User's query: "${input.query}"

When discussing escalation, care quality, or user support, reference the latest escalation metrics to provide context and reassurance about the support process (e.g., "Currently, there are X total escalated cases, Y pending, and the average resolution time is Z minutes.").
`;

    // If an image is attached, use a multimodal prompt
    let promptToSend: any = promptText;
    if (input.symptomImageDataUri) {
      promptToSend = [
        { text: promptText + '\n\nAnalyze the attached image for visible symptoms (e.g., rashes, wounds, swelling, discoloration, etc.) and include your findings in the possible outcomes.' },
        { media: { url: input.symptomImageDataUri } }
      ];
    }

    const llmResponse = await ai.generate({
      model: gemini15Flash,
      prompt: promptToSend,
      tools: [bookAppointmentTool, setReminderTool], 
      output: {
        format: 'json',
        schema: AiHealthAssistantOutputSchema,
      },
       config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ]
      }
    });

    const outputData = llmResponse.output;
    if (!outputData) {
      console.error("AI response missing output data. Raw response:", llmResponse);
      return {
          response: "I'm sorry, I encountered an issue processing your request in the expected format. Could you please try rephrasing or asking again later?"
      };
    }
    return outputData as AiHealthAssistantOutput;
  }
);

/**
 * DeepSeek-powered Health Assistant (OpenRouter)
 */
export async function aiHealthAssistantDeepSeek(input: AiHealthAssistantInput): Promise<AiHealthAssistantOutput> {
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000',
      'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'CareMatch AI',
    },
  });
  const userProfile = input.userProfile || {};
  const systemPrompt = `You are a helpful, articulate, and engaging AI assistant. Your responses should be clear, concise, and tailored to the user’s needs. Prioritize accuracy, relevance, and natural language—avoid robotic or overly technical phrasing unless requested. Maintain a polite and professional tone, adapting to context when appropriate (e.g., casual for informal queries, structured for complex topics).

Focus on delivering value: answer questions thoroughly, offer insights when useful, and avoid unnecessary repetition. If clarification is needed, ask follow-up questions politely. Always uphold ethical guidelines, avoiding harmful, biased, or misleading content.

When listing information, use bullet points or numbers and clear section headings. Never use *, **, ##, ###, or any markdown/HTML formatting. Use only plain text for headings and lists. Use appropriate, uplifting or calming emojis to make responses more friendly and clear, but do not overuse them.

Your goal is to assist users effectively while ensuring a smooth, human-like interaction.

User Profile:
- Name: ${userProfile.preferredName || 'Not provided'}
- Age: ${userProfile.age || 'Not provided'}
- Gender: ${userProfile.genderIdentity || 'Not provided'}
- Known Diseases: ${userProfile.knownDiseases || 'None reported'}
- Allergies: ${userProfile.allergies || 'None reported'}
- Current Medications: ${userProfile.currentMedications || 'None reported'}
- Weight: ${userProfile.weight || 'Not provided'}
- Dietary Habits: ${userProfile.dietaryHabits || 'Not provided'}
- Sleep Hours: ${userProfile.sleepHours || 'Not provided'}
- Exercise Frequency: ${userProfile.exerciseFrequency || 'Not provided'}
- Immunizations: ${userProfile.immunizationRecords && userProfile.immunizationRecords.length > 0 ? userProfile.immunizationRecords.map((i: { vaccineName: string }) => i.vaccineName).join(', ') : 'Not provided'}
`;
  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.query },
      ],
      temperature: 0.5,
      max_tokens: 1024,
    });
    const responseText = (completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.')
      .replace(/\*\*|##+|\*/g, '');
    return {
      response: responseText,
      resourceLinks: [], // Add resourceLinks to the fallback return
    } as AiHealthAssistantOutput;
  } catch (error: any) {
    console.error('DeepSeek API error:', error);
    return {
      response: `DeepSeek API error: ${error?.message || error?.toString() || 'Unknown error.'}`,
      resourceLinks: [], // Add resourceLinks to the fallback return
    } as AiHealthAssistantOutput;
  }
}
