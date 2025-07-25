
'use server';
/**
 * @fileOverview An AI mental health companion.
 * This flow provides empathetic responses and general suggestions for users sharing their feelings.
 * It is NOT a replacement for professional mental health support.
 *
 * - mentalHealthCompanionFlow - Analyzes user input and provides supportive responses.
 * - MentalHealthCompanionInput - Input type for the flow.
 * - MentalHealthCompanionOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import {z} from 'genkit';
import OpenAI from 'openai';

const MentalHealthCompanionInputSchema = z.object({
  userInput: z.string().min(5, { message: "Please tell me a little more about how you're feeling." }).describe('The user\'s textual input describing their feelings, thoughts, or current mental state.'),
  userLocation: z.string().optional().describe("The user's current location (e.g., city, state, or zip code) if they are seeking local professionals."),
  specializationKeyword: z.string().optional().describe("Keywords for specialization if looking for a specific type of professional (e.g., 'anxiety', 'trauma', 'family counseling').")
});
export type MentalHealthCompanionInput = z.infer<typeof MentalHealthCompanionInputSchema>;

const ResourceLinkSchema = z.object({
    title: z.string().describe("The display title for the resource link."),
    url: z.string().describe("The URL to the mental health resource. This should be a valid web URL.")
});

const MentalHealthProfessionalSchema = z.object({
    name: z.string().describe("The name of the mental health professional or clinic."),
    specialty: z.string().describe("The professional's specialty or type of service offered."),
    address: z.string().optional().describe("The address of the professional's office (simulated)."),
    contactInfo: z.string().describe("How to find contact information (e.g., 'Search online for contact details')."),
    source: z.string().describe("The source of this information (e.g., 'Simulated Local Directory').")
});

const MentalHealthCompanionOutputSchema = z.object({
  response: z.string().describe('An empathetic and supportive textual response from the AI.'),
  detectedSentiment: z.string().optional().describe('A general sentiment analysis of the user\'s input (e.g., "neutral", "slightly negative", "anxious undertones"). This is a high-level interpretation.'),
  gentleSuggestions: z.array(z.string()).optional().describe('General, safe, and supportive suggestions (e.g., "Taking a few deep breaths can sometimes help center yourself."). Max 3 suggestions.'),
  resourceLinks: z.array(ResourceLinkSchema).optional().describe('Optional links to general, reputable mental health resources.'),
  suggestedProfessionals: z.array(MentalHealthProfessionalSchema).optional().describe("A list of suggested mental health professionals (simulated search)."),
  disclaimer: z.string().describe('A mandatory disclaimer stating this is not therapy or medical advice and to consult professionals for serious concerns.'),
});
export type MentalHealthCompanionOutput = z.infer<typeof MentalHealthCompanionOutputSchema>;

const PREDEFINED_RESOURCES = [
    { title: "National Alliance on Mental Illness (NAMI)", url: "https://www.nami.org" },
    { title: "MentalHealth.gov", url: "https://www.mentalhealth.gov" },
    { title: "Crisis Text Line (Text HOME to 741741)", url: "https://www.crisistextline.org" },
    { title: "The Trevor Project (for LGBTQ youth)", url: "https://www.thetrevorproject.org" },
    { title: "Veterans Crisis Line", url: "https://www.veteranscrisisline.net" }
];

// Simulated Tool for finding professionals
const findMentalHealthProfessionalsTool = ai.defineTool(
    {
        name: 'findMentalHealthProfessionalsTool',
        description: "Simulates a search for local mental health professionals like therapists, counselors, or psychiatrists. Use if the user asks for help finding one or expresses a clear need to talk to a professional.",
        inputSchema: z.object({
            location: z.string().optional().describe("The city, state, or zip code to search within."),
            specializationKeyword: z.string().optional().describe("Optional keyword for specialization (e.g., 'anxiety', 'grief counseling', 'child therapist').")
        }),
        outputSchema: z.array(MentalHealthProfessionalSchema),
    },
    async (input) => {
        console.log('[Tool Called] findMentalHealthProfessionalsTool with input:', input);
        // This is a placeholder. In a real app, this would query a database or external API.
        // For now, it returns a fixed or procedurally generated list.
        const simulatedProfessionals: z.infer<typeof MentalHealthProfessionalSchema>[] = [
            { name: "Dr. Emily Carter, PhD", specialty: "Cognitive Behavioral Therapy (CBT), Anxiety Specialist", address: input.location ? `123 Main St, ${input.location}` : "123 Main St, Anytown, USA", contactInfo: "Search online for 'Dr. Emily Carter Anytown'", source: "Simulated Local Directory" },
            { name: "The Serene Path Counseling Center", specialty: "General Counseling, Relationship Issues", address: input.location ? `456 Oak Ave, ${input.location}` : "456 Oak Ave, Anytown, USA", contactInfo: "Search online for 'The Serene Path Anytown'", source: "Simulated Local Directory" },
            { name: "Dr. Raj Patel, MD (Psychiatrist)", specialty: "Medication Management, Mood Disorders", address: input.location ? `789 Pine Rd, ${input.location}` : "789 Pine Rd, Anytown, USA", contactInfo: "Search online for 'Dr. Raj Patel Psychiatrist Anytown'", source: "Simulated Health Network" },
            { name: "Mindful Growth Therapy Group", specialty: "Mindfulness-Based Stress Reduction, Trauma-Informed Care" + (input.specializationKeyword ? ` (focusing on ${input.specializationKeyword})` : ""), address: input.location ? `101 Wellness Way, ${input.location}` : "101 Wellness Way, Anytown, USA", contactInfo: "Search online for 'Mindful Growth Therapy Anytown'", source: "Simulated Wellness Portal" },
        ];
        // Limit to a few results for demonstration
        return simulatedProfessionals.slice(0, Math.floor(Math.random() * 2) + 2); // Return 2-3 random professionals
    }
);


export async function mentalHealthCompanionFlow(input: MentalHealthCompanionInput): Promise<MentalHealthCompanionOutput> {

  const promptText = `You are a helpful, articulate, and engaging AI assistant. Your responses should be clear, concise, and tailored to the user’s needs. Prioritize accuracy, relevance, and natural language—avoid robotic or overly technical phrasing unless requested. Maintain a polite and professional tone, adapting to context when appropriate (e.g., casual for informal queries, structured for complex topics).

Focus on delivering value: answer questions thoroughly, offer insights when useful, and avoid unnecessary repetition. If clarification is needed, ask follow-up questions politely. Always uphold ethical guidelines, avoiding harmful, biased, or misleading content.

When listing information, use bullet points or numbers and bold headings (with <b> tags, not markdown). Do not use *, **, or ##.

Your goal is to assist users effectively while ensuring a smooth, human-like interaction.

User's input: "${input.userInput}"
${input.userLocation ? `User's location context: "${input.userLocation}" (Use for professional search if requested).` : ''}
${input.specializationKeyword ? `User's specialization interest: "${input.specializationKeyword}" (Use for professional search if requested).` : ''}

Your tasks:
1.  **Acknowledge and Validate:** Start by acknowledging the user's feelings in an empathetic way.
2.  **Provide a Supportive Response:** Offer words of comfort, understanding, and encouragement.
3.  **Analyze Sentiment (High-Level):** Briefly describe the general sentiment you detect in the user's message (e.g., "It sounds like you're going through a tough time," or "I hear that you're feeling overwhelmed."). Store this in 'detectedSentiment'.
4.  **Offer General Tips & Gentle Suggestions (Max 3):**
    *   Based on the input, if the user mentions common concerns like anxiety, stress, sadness, or feeling down, offer 1-2 very general, safe, non-clinical self-care ideas or reflection prompts related to those feelings. Examples:
        *   For anxiety/stress: "Sometimes, focusing on your breath for a few moments can help when things feel overwhelming. Just noticing your inhale and exhale." or "Gentle movement, like a short walk, can sometimes ease feelings of restlessness."
        *   For sadness/feeling down: "It's okay to feel this way. Sometimes, connecting with a small, comforting activity, like listening to music or spending a moment in nature, can offer a little shift." or "Journaling your thoughts, without any judgment, can be a way to process what you're feeling."
    *   Also provide general, safe, and actionable self-care or reflection suggestions as before. Examples: "Remember to be kind to yourself during moments like these." or "Is there a trusted friend or family member you could talk to about how you're feeling?"
    *   Do NOT prescribe actions or make them sound like orders. Keep them very gentle. Store these in 'gentleSuggestions'.
5.  **Professional Help & Tool Use:**
    *   If the user explicitly asks for help finding a therapist, counselor, psychiatrist, or if their message strongly indicates a desire or need to connect with a professional (e.g., "I need to talk to someone professional," "I think I need therapy"), then:
        *   Acknowledge this and affirm that seeking professional help is a positive step.
        *   Use the 'findMentalHealthProfessionalsTool' to simulate a search. Pass the user's location (if provided in 'userLocation') and any specialization keywords (if provided in 'specializationKeyword') to the tool.
        *   Populate the 'suggestedProfessionals' field in your output with the tool's results.
        *   In your main 'response' text, clearly state that you've performed a *simulated search* and the list is for informational purposes only and not an endorsement. Advise the user to do their own research and verification. Example: "Seeking professional support is a really positive step. I've done a simulated search based on what you've shared, and here are a few professionals you might consider looking into. Please remember this is for informational purposes, and it's important to research them further to see if they're a good fit for you."
    *   If not explicitly asked or strongly implied, do not use the tool or populate 'suggestedProfessionals'.
6.  **Offer Resources (Optional):** If appropriate and the user's tone doesn't indicate immediate crisis, you may include 1-2 predefined 'resourceLinks' from the list provided below. Do not invent new resources.
7.  **Crucial Disclaimer:** ALWAYS include the following 'disclaimer' verbatim in your output:
    "Please remember, I am an AI companion and not a substitute for professional medical advice, diagnosis, or treatment. If you are experiencing significant distress or a mental health crisis, please consult with a qualified healthcare professional or a crisis support service immediately."

Guidelines:
*   **Safety First:** If the user expresses thoughts of self-harm, harming others, or indicates a severe crisis, your primary 'response' should be to strongly and clearly encourage them to seek immediate professional help or contact emergency services or a crisis hotline (like texting HOME to 741741 if in the US, or calling a local emergency number). In such cases, minimize other suggestions and prioritize this. You can mention one of the crisis resources from the predefined list.
*   **No Diagnosis:** Do not attempt to diagnose any condition. Do not use clinical terms to label the user's experience unless they use it first and you are reflecting their language.
*   **Non-Prescriptive:** Your suggestions should be gentle and optional, not directives.
*   **Empathetic Tone:** Maintain a warm, understanding, and patient tone throughout.
*   **Brevity:** Keep responses concise yet compassionate.
*   **Output Format:** Ensure your response is a JSON object strictly adhering to the MentalHealthCompanionOutputSchema. If 'gentleSuggestions', 'resourceLinks', or 'suggestedProfessionals' are not applicable, they can be empty arrays or omitted if the schema allows.

Predefined resources you can use for 'resourceLinks' if appropriate:
${PREDEFINED_RESOURCES.map(r => `- ${r.title}: ${r.url}`).join('\n')}

Process the user's input now.
`;

  const llmResponse = await ai.generate({
    model: gemini15Flash,
    prompt: promptText,
    tools: [findMentalHealthProfessionalsTool],
    output: {
      format: 'json',
      schema: MentalHealthCompanionOutputSchema,
    },
    config: { 
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      ],
    }
  });

  const output = llmResponse.output;
  if (!output) {
    throw new Error('AI response did not contain the expected output structure for mental health companion.');
  }
  
  const requiredDisclaimer = "Please remember, I am an AI companion and not a substitute for professional medical advice, diagnosis, or treatment. If you are experiencing significant distress or a mental health crisis, please consult with a qualified healthcare professional or a crisis support service immediately.";
  if (!output.disclaimer || !output.disclaimer.includes("not a substitute for professional medical advice")) {
    output.disclaimer = requiredDisclaimer;
  }
  
  if (output.gentleSuggestions && output.gentleSuggestions.length > 3) {
    output.gentleSuggestions = output.gentleSuggestions.slice(0, 3);
  }
  if (output.resourceLinks && output.resourceLinks.length > 2) {
    output.resourceLinks = output.resourceLinks.slice(0, 2);
  }
  if (output.suggestedProfessionals && output.suggestedProfessionals.length > 3) { // Limit simulated professionals too
    output.suggestedProfessionals = output.suggestedProfessionals.slice(0, 3);
  }


  return output as MentalHealthCompanionOutput;
}

/**
 * DeepSeek-powered Mental Health Companion (OpenRouter)
 */
export async function mentalHealthCompanionDeepSeekFlow(input: MentalHealthCompanionInput): Promise<MentalHealthCompanionOutput> {
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:4000',
      'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'CareMatch AI',
    },
  });
  const profileContext = [
    input.userLocation ? `Location: ${input.userLocation}` : '',
    input.specializationKeyword ? `Specialization: ${input.specializationKeyword}` : ''
  ].filter(Boolean).join('\n');
  const systemPrompt = `You are a helpful, articulate, and engaging AI assistant. Your responses should be clear, concise, and tailored to the user’s needs. Prioritize accuracy, relevance, and natural language—avoid robotic or overly technical phrasing unless requested. Maintain a polite and professional tone, adapting to context when appropriate (e.g., casual for informal queries, structured for complex topics).

Focus on delivering value: answer questions thoroughly, offer insights when useful, and avoid unnecessary repetition. If clarification is needed, ask follow-up questions politely. Always uphold ethical guidelines, avoiding harmful, biased, or misleading content.

When listing information, use bullet points or numbers and clear section headings. Never use *, **, ##, ###, or any markdown/HTML formatting. Use only plain text for headings and lists. Use appropriate, uplifting or calming emojis to make responses more friendly and clear, but do not overuse them.

Your goal is to assist users effectively while ensuring a smooth, human-like interaction.

${profileContext}`;
  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.userInput },
      ],
      temperature: 0.5,
      max_tokens: 1024,
    });
    const responseText = (completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.')
      .replace(/\*\*|##+|\*/g, '');
    return {
      response: responseText,
      disclaimer: "This is not a substitute for professional mental health care. For urgent or serious concerns, consult a mental health professional or crisis service."
    } as MentalHealthCompanionOutput;
  } catch (error: any) {
    console.error('DeepSeek API error:', error);
    return {
      response: `DeepSeek API error: ${error?.message || error?.toString() || 'Unknown error.'}`,
      disclaimer: "This is not a substitute for professional mental health care. For urgent or serious concerns, consult a mental health professional or crisis service."
    } as MentalHealthCompanionOutput;
  }
}

