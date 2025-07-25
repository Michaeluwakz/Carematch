
'use server';
/**
 * @fileOverview A care navigation AI agent.
 * This flow helps users find care options and health information based on their input,
 * acting as a matchmaker to provide clear referral suggestions.
 *
 * - careNavigationFlow - Main function to handle care navigation requests.
 * - CareNavigationInput - Input type for the flow.
 * - CareNavigationOutput - Output type for the flow.
 */

import {ai} from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import {z} from 'genkit';
import {
  fetchNearbyClinics,
  searchHealthTopics,
  getMyHealthfinderData,
  getHealthItemsList,
  type Clinic,
  type TopicSearchResult,
  type MyHealthfinderResult,
  type HealthItem,
  searchHealthcareCentres,
} from '@/services/external-api-service';
import { scrapeWebPage } from '@/services/web-scraper-service';

// Schemas for Tools Output and Main Flow Output
const ClinicSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  services: z.array(z.string()),
  acceptsWalkIn: z.boolean(),
  distanceKm: z.number().optional(),
});
export type ClinicForCareNavigation = z.infer<typeof ClinicSchema>;

const HealthTopicSchema = z.object({
  Title: z.string(),
  Id: z.string(),
  AccessibleVersion: z.string().url().optional(),
  Categories: z.string().optional(),
});
export type HealthTopicForCareNavigation = z.infer<typeof HealthTopicSchema>;

const MyHealthfinderResultItemSchema = z.object({
  Id: z.string(),
  Title: z.string(),
  AccessibleVersion: z.string().url().optional(),
  // Add other fields from MyHealthfinderResult as needed by the LLM/UI
});
export type MyHealthfinderResultItem = z.infer<typeof MyHealthfinderResultItemSchema>;

const HealthListItemSchema = z.object({
  Id: z.string(),
  Title: z.string(),
  // Add other fields from HealthItem as needed by the LLM/UI
});
export type HealthListItem = z.infer<typeof HealthListItemSchema>;


// Input Schema for the Flow
const CareNavigationInputSchema = z.object({
  userInput: z.string().describe('The user\'s description of their health needs, symptoms, or query. This may include a URL to a web page.'),
  userLocation: z.string().optional().describe('Optional: The user\'s reported location (e.g., city, zip code).'),
  preferredLanguage: z.string().optional().describe('Optional: The user\'s preferred language for the response. Defaults to English.'),
  userAge: z.number().optional().describe('Optional: The user\'s age, if provided.'),
  userSex: z.string().optional().describe('Optional: The user\'s sex (e.g., male, female), if provided.'),
});
export type CareNavigationInput = z.infer<typeof CareNavigationInputSchema>;

// Output Schema for the Flow
const CareNavigationOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the AI\'s understanding of the user\'s situation and overall advice, highlighting matchmaking decisions.'),
  suggestedSteps: z.array(z.string()).describe('A list of clear, actionable next steps for the user, framed as referral suggestions. This should include specific recommendations for clinics/hospitals if found, e.g., "For your symptoms, consider visiting XYZ Clinic at 123 Main St (1.2km away – walk-in accepted for assessment)." or "For information on managing condition ABC, a virtual consultation (if available from your provider) or reviewing reliable health resources is suggested."'),
  relevantClinics: z.array(ClinicSchema).optional().describe('A list of relevant clinics, hospitals, doctors, or specialists found. This field should be populated from the getNearbyClinics tool. Its results MUST directly inform the suggestedSteps.'),
  healthInformation: z.array(HealthTopicSchema).optional().describe('A list of relevant health topics or articles found via topic search. This field should be populated from the searchHealthTopics tool.'),
  personalizedRecommendations: z.array(MyHealthfinderResultItemSchema).optional().describe('Personalized health tips or recommendations based on user profile (age/sex). This field should be populated from the getMyHealthfinderData tool.'),
  generalResources: z.array(HealthListItemSchema).optional().describe('List of general health resources or items relevant to the query but not specific topics. This field should be populated from the getHealthItemsList tool.'),
});
export type CareNavigationOutput = z.infer<typeof CareNavigationOutputSchema>;


// Tool: Get Nearby Clinics
const getNearbyClinicsTool = ai.defineTool(
  {
    name: 'getNearbyClinics',
    description: 'Fetches a list of nearby healthcare providers including clinics, hospitals, doctors, and specialists. Use this if the user is asking for local medical services, implies needing in-person care, or provides a location with a health-related query that might require local services.',
    inputSchema: z.object({
      locationQuery: z.string().optional().describe("The location mentioned by the user, if any (e.g., city, zip code). The tool will use a default if this is too vague or missing."),
    }),
    outputSchema: z.array(ClinicSchema),
  },
  async (input) => {
    console.log("getNearbyClinicsTool called with input:", input);
    try {
      // In a real app, input.locationQuery would be used to determine lat/long or pass to the API.
      const clinics = await fetchNearbyClinics({ latitude: 34.0522, longitude: -118.2437 }); // Los Angeles as default
      return clinics.map(clinic => ({
        ...clinic,
        distanceKm: clinic.distanceKm === undefined ? undefined : clinic.distanceKm,
      }));
    } catch (error) {
        console.error("Error in getNearbyClinicsTool:", error);
        return [];
    }
  }
);

// Tool: Search Health Topics
const searchHealthTopicsTool = ai.defineTool(
  {
    name: 'searchHealthTopics',
    description: 'Searches for health topics or articles based on a keyword. Use this to provide information about specific conditions, symptoms, treatments, etc. (from Health.gov). Do not use this if the user has provided a specific URL to analyze.',
    inputSchema: z.object({
      keyword: z.string().describe('The keyword or phrase to search for (e.g., "flu symptoms", "managing diabetes").'),
    }),
    outputSchema: z.array(HealthTopicSchema),
  },
  async (input) => {
    console.log("searchHealthTopicsTool called with input:", input);
    try {
        const response = await searchHealthTopics(input.keyword);
        return response.Result.Resources.Resource.map(topic => ({
            Title: topic.Title,
            Id: topic.Id,
            AccessibleVersion: topic.AccessibleVersion || undefined,
            Categories: topic.Categories || undefined,
        })).slice(0, 3);
    } catch (error) {
        console.error("Error in searchHealthTopicsTool:", error);
        return [];
    }
  }
);

// Tool: Get Personalized Health Recommendations (MyHealthfinder)
const getMyHealthfinderDataTool = ai.defineTool(
  {
    name: 'getMyHealthfinderData',
    description: 'Fetches personalized health recommendations based on age and sex (from Health.gov MyHealthfinder). Use this if the user provides or asks for personalized tips related to their demographic profile.',
    inputSchema: z.object({
      age: z.number().optional().describe('The age of the user.'),
      sex: z.string().optional().describe('The sex of the user (e.g., "male", "female").'),
      // Add other params if the API supports and they are useful
    }),
    outputSchema: z.array(MyHealthfinderResultItemSchema),
  },
  async (input) => {
    console.log("getMyHealthfinderDataTool called with input:", input);
    if (!input.age && !input.sex) {
        // MyHealthfinder might require at least one parameter for meaningful results.
        console.log("getMyHealthfinderDataTool: Insufficient input (age/sex), returning empty.");
        return [];
    }
    try {
      const response = await getMyHealthfinderData(input);
      return response.Result.Resources.Resource.map(item => ({
        Id: item.Id,
        Title: item.Title,
        AccessibleVersion: item.AccessibleVersion || undefined,
      })).slice(0, 3); // Limit results for brevity
    } catch (error) {
      console.error("Error in getMyHealthfinderDataTool:", error);
      return [];
    }
  }
);

// Tool: Get Health Items List
const getHealthItemsListTool = ai.defineTool(
  {
    name: 'getHealthItemsList',
    description: 'Fetches a list of general health items or topics, possibly filtered by category or language (from Health.gov). Use this for broader queries or when a user wants a list of resources on a general subject.',
    inputSchema: z.object({
      category: z.string().optional().describe('The category to filter health items by (e.g., "nutrition", "mental health").'),
      language: z.string().optional().describe('The language for the health items.'),
    }),
    outputSchema: z.array(HealthListItemSchema),
  },
  async (input) => {
    console.log("getHealthItemsListTool called with input:", input);
    try {
      const params: Record<string, string> = {};
      if (input.category) params.category = input.category;
      if (input.language) params.lang = input.language; // Assuming API uses 'lang' for language

      const response = await getHealthItemsList(params);
      return response.Result.Items.Item.map(item => ({
        Id: item.Id,
        Title: item.Title,
      })).slice(0, 5); // Limit results
    } catch (error) {
      console.error("Error in getHealthItemsListTool:", error);
      return [];
    }
  }
);

// Tool: Read Web Page
const readWebPageTool = ai.defineTool(
  {
    name: 'readWebPageTool',
    description: 'Reads the textual content of a given public web page URL. Use this if the user provides a URL and asks for a summary, explanation, or to answer questions based on its content. Also use this tool to read from the list of trusted knowledge base URLs.',
    inputSchema: z.object({
      url: z.string().url().describe("The full URL of the public web page to read."),
    }),
    outputSchema: z.string().describe("The extracted textual content from the web page, or an error message if it could not be read."),
  },
  async (input) => {
    console.log("readWebPageTool called with URL:", input.url);
    try {
      const content = await scrapeWebPage(input.url);
      return content;
    } catch (error) {
        console.error("Error in readWebPageTool:", error);
        if (error instanceof Error) {
            return `Failed to process the web page: ${error.message}`;
        }
        return "An unknown error occurred while processing the web page.";
    }
  }
);


// Main Flow Function
export async function careNavigationFlow(input: CareNavigationInput): Promise<CareNavigationOutput> {
  const { userInput, userLocation, preferredLanguage, userAge, userSex } = input;
  const language = preferredLanguage || 'English';

  // Search the local directory for relevant centres/practitioners
  const searchString = [userInput, userLocation].filter(Boolean).join(' ');
  const directoryResults = await searchHealthcareCentres(searchString);
  // Map to ClinicForCareNavigation type (subset of HealthcareCentre fields)
  const relevantClinics = directoryResults.map(c => ({
    id: c.id,
    name: c.name,
    address: c.address,
    services: c.services,
    acceptsWalkIn: c.acceptsWalkIn,
  }));

  // Compose the output, prioritizing directory results for relevantClinics
  const hasDirectoryResults = relevantClinics.length > 0;

  const prompt = `You are CareMatch AI, a compassionate and highly effective care navigator and referral assistant.

${hasDirectoryResults ? `IMPORTANT: You have been provided with a list of relevant clinics and hospitals from the local CareMatch directory (see the relevantClinics field).
- You MUST use these directory results as your primary source for both the summary and the suggestedSteps.
- Do NOT use the getNearbyClinics tool or reference its results if relevantClinics is not empty.
- Your summary and steps should be based on the directory results, including names, addresses, and services.
` : `No directory results were found. You may use the getNearbyClinics tool as a fallback.`}

Your primary role is to act as an intelligent matchmaker, connecting users to the most appropriate care options and information based on their stated needs.

User's query: "${userInput}"
${userLocation ? `User's reported location: "${userLocation}"` : ''}
${userAge ? `User's age: ${userAge}` : ''}
${userSex ? `User's sex: ${userSex}` : ''}
Preferred language for response: ${language}

Your tasks:
1.  **Understand and Interpret:** Deeply analyze the user's query ("${userInput}"), considering their symptoms, desired services, and any implied urgency. Check if the query contains a URL.
2.  **Strategic Tool Use & Knowledge Base:** Based on your interpretation, decide which of the available tools are most relevant to call.
    *   **Trusted Knowledge Base (Prioritize this information):** You have access to a curated list of trusted web pages. If the user's query is about general health guidelines, wellness, or hospital/provider information (cost, performance), you should **prioritize using the 'readWebPageTool' on the URLs below** to formulate your answer.
        *   **General Health Guidelines URL(s):**
            *   'https://www.example.com/your-trusted-health-guide' // TODO: Replace with your actual URL for health guidelines.
            *   'https://www.example.com/another-health-resource'   // TODO: Add more URLs if needed.
        *   **Hospital & Provider Information URL(s) (Cost, Performance):**
            *   'https://www.example.com/your-hospital-comparison-data' // TODO: Replace with your actual URL for provider data.

    *   If the user's input includes a **specific URL**, prioritize using the 'readWebPageTool' on that user-provided URL. The content from this tool should be used as the primary source of information to formulate your 'summary' and 'suggestedSteps'.
    *   If no URL is provided, and the query is not covered by the trusted knowledge base, use 'searchHealthTopics' for specific conditions, symptoms, or health topics. Populate 'healthInformation' with its results.
    *   Use 'getNearbyClinics' if the user needs in-person care, asks for local medical services (doctors, clinics, hospitals, specialists), or provides a location with a health query that might require local assessment. Populate 'relevantClinics' with its results.
    *   Use 'getMyHealthfinderData' if the user provides age/sex and could benefit from personalized preventive tips. Populate 'personalizedRecommendations' with its results.
    *   Use 'getHealthItemsList' for general resource lists or broader topics. Populate 'generalResources' with its results.
3.  **Synthesize and Matchmake:** Critically evaluate all information (user query, tool results from trusted URLs or other tools). Your goal is to provide the BEST possible referral or guidance. If you used 'readWebPageTool' (either from a user-provided URL or the trusted list), base your summary on the content from that tool.
4.  **Formulate 'summary':** Provide a concise 'summary' of your understanding, highlighting the key factors that led to your referral suggestions.
5.  **Generate Actionable 'suggestedSteps' (Referrals):** This is the most crucial part.
    *   Transform the information into direct, actionable referral steps.
    *   **If the 'getNearbyClinicsTool' was used and returned results, these clinics MUST be directly and clearly incorporated into the 'suggestedSteps'.** For example: "For your described symptoms of [symptom], consider visiting **[Clinic Name]** located at [Address] ([distance] km away). They offer [relevant services] and [accepts/does not accept] walk-ins. This seems appropriate for an initial assessment."
    *   Frame advice based on the source of information (e.g., "According to the trusted health guide at [URL]...").
    *   Make these suggestions specific, empathetic, and easy for the user to act upon. Prioritize clarity.
6.  **Language:** Respond consistently in ${language}.
7.  **Output Schema Adherence:** Ensure the final output strictly follows the CareNavigationOutputSchema. All fields populated by tools must be included, even if a tool returns an empty list (in which case the field value should be an empty array).

If tools return no specific results (e.g., no clinics found for a very remote location), acknowledge this in your summary or suggested steps (e.g., "No clinics were found matching your immediate criteria through our automated search. You may need to broaden your search or contact local health authorities."). The corresponding output field (e.g., 'relevantClinics') should still be an empty array in the JSON.
`;

  const llmResponse = await ai.generate({
    model: gemini15Flash,
    prompt: prompt,
    tools: [
        readWebPageTool,
        getNearbyClinicsTool,
        searchHealthTopicsTool,
        getMyHealthfinderDataTool,
        getHealthItemsListTool
    ],
    output: {
      format: 'json',
      schema: CareNavigationOutputSchema,
    },
  });

  const output = llmResponse.output;
  if (!output) {
    throw new Error('AI response did not contain the expected output structure.');
  }
  // Ensure all optional array fields are present, even if empty, as per the prompt.
  if (!output.relevantClinics) output.relevantClinics = [];
  if (!output.healthInformation) output.healthInformation = [];
  if (!output.personalizedRecommendations) output.personalizedRecommendations = [];
  if (!output.generalResources) output.generalResources = [];

  // Overwrite relevantClinics with directory results if any
  if (relevantClinics.length > 0) {
    output.relevantClinics = relevantClinics;
  }

  return output as CareNavigationOutput;
}
