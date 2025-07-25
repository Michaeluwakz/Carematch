
'use server';

/**
 * @fileOverview Interprets uploaded documents (insurance cards, prescriptions, lab reports, radiology summaries) to extract and explain information in plain language.
 *
 * - interpretDocument - A function that handles the document interpretation process.
 * - InterpretDocumentInput - The input type for the interpretDocument function.
 * - InterpretDocumentOutput - The return type for the interpretDocument function.
 */

import {ai} from '@/ai/genkit';
import { gemini15Flash } from '@genkit-ai/googleai';
import {z} from 'genkit';

const InterpretDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A photo or PDF of a health-related document (insurance card, prescription, lab report, radiology summary, etc.), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type InterpretDocumentInput = z.infer<typeof InterpretDocumentInputSchema>;

const InterpretDocumentOutputSchema = z.object({
  extractedInformation: z
    .string()
    .describe('The key information extracted from the document (e.g., specific values, findings, medication details, insurance numbers, copay amounts).'),
  plainLanguageExplanation: z
    .string()
    .describe('A plain language explanation of the extracted information, making it understandable for someone with limited healthcare knowledge. For lab/radiology results, this should explain what the findings generally mean, without diagnosing. For insurance details, explain terms like copay or deductible if found.'),
  documentTypeGuess: z
    .string()
    .optional()
    .describe("The AI's best guess of the document type (e.g., 'Insurance Card', 'Prescription', 'Lab Report - Blood Work', 'Radiology Report Summary')."),
  nextStepSuggestion: z
    .string()
    .optional()
    .describe("A brief suggestion for the user on what they might do next with this information, always emphasizing consultation with a doctor for medical results."),
});
export type InterpretDocumentOutput = z.infer<typeof InterpretDocumentOutputSchema>;

export async function interpretDocument(
  input: InterpretDocumentInput
): Promise<InterpretDocumentOutput> {
  return interpretDocumentFlow(input);
}

const interpretDocumentFlow = ai.defineFlow(
  {
    name: 'interpretDocumentFlow',
    inputSchema: InterpretDocumentInputSchema,
    outputSchema: InterpretDocumentOutputSchema,
  },
  async (input: InterpretDocumentInput): Promise<InterpretDocumentOutput> => {
    const promptParts = [
      {
        text: `You are an AI assistant that extracts information from health-related documents and explains it in plain language.
Your goal is to make complex medical information more accessible.

Analyze the document provided in the image.
1.  **Identify Document Type:** First, try to determine what kind of document it is (e.g., 'Insurance Card', 'Prescription', 'Lab Report - Blood Work', 'Radiology Report Summary - X-ray', 'Discharge Summary'). Store this in 'documentTypeGuess'.
2.  **Extract Key Information:** Based on the document type, extract the most relevant information.
    *   For **Insurance Cards**: Member ID, Group Number, Payer Name, contact numbers, plan name, and specifically look for details like **copay amounts** for different services (e.g., primary care, specialist, emergency), deductible information, and out-of-pocket maximums if visible.
    *   For **Prescriptions**: Medication name, dosage, frequency, quantity, doctor's name, date.
    *   For **Lab Reports (e.g., blood work, urinalysis, malaria tests)**: Identify key tests performed, the reported values, units, and any provided normal/reference ranges. Extract specific findings or abnormalities mentioned.
    *   For **Radiology Report Summaries (text-based summaries of X-rays, CTs, ultrasounds, etc.)**: Extract the main findings, impressions, or conclusions stated in the report's text. Do NOT attempt to interpret raw images directly if visible; focus on the textual summary.
    *   For other document types, extract the most salient points.
    Store this in 'extractedInformation'.
3.  **Plain Language Explanation:** Provide a clear, simple explanation of the extracted information.
    *   For general documents, simplify jargon.
    *   For **Insurance Cards**: If copay amounts, deductibles, or out-of-pocket maximums are found, explain what these terms mean in a simple way. For example, "A copay is a fixed amount you pay for covered health care services after you've paid your deductible."
    *   For **Lab Reports**: Explain what each key test generally measures and what a high, low, or abnormal result *might* generally indicate, using simple analogies if helpful. For example: "Your report shows a 'White Blood Cell Count' of 12.0 x 10^9/L, and the normal range is typically 4.0-11.0 x 10^9/L. This means your white blood cell count is higher than the typical normal range. White blood cells are part of your immune system, and a high count can often suggest your body is fighting an infection."
    *   For **Radiology Reports**: Explain the main findings in simple terms. For example: "The summary of your chest X-ray mentions 'no acute cardiopulmonary disease.' This generally means the report did not find any new or urgent problems with your heart or lungs based on the X-ray."
    Store this in 'plainLanguageExplanation'.
4.  **Next Step Suggestion:** Provide a very brief, general suggestion for next steps.
    *   For insurance/prescriptions: "You can use this information when contacting your pharmacy, doctor, or insurance provider."
    *   For lab/radiology results: "It's very important to discuss these results and what they mean for your health with your doctor. They have your full medical history and can provide an accurate interpretation and any necessary next steps." This part is CRITICAL.
    Store this in 'nextStepSuggestion'.

**CRITICAL SAFETY INSTRUCTIONS FOR MEDICAL RESULTS (LABS/RADIOLOGY):**
*   **NEVER DIAGNOSE:** You are not a doctor. Do not provide a diagnosis or treatment advice.
*   **GENERAL INTERPRETATION ONLY:** Your explanation of results must be general (e.g., "high X can mean Y") and not specific to the user's personal condition.
*   **ALWAYS ADVISE DOCTOR CONSULTATION:** For any lab or radiology results, your primary 'nextStepSuggestion' and a part of your 'plainLanguageExplanation' must strongly emphasize that the user needs to discuss the results with their healthcare provider for proper interpretation and medical advice.
*   **FOCUS ON TEXT:** If the document is an image of a report, focus on interpreting the text and numbers. Do not attempt to analyze medical images (like X-ray images) directly.

Document:`,
      },
      { media: { url: input.documentDataUri } },
    ];

    const response = await ai.generate({
      model: gemini15Flash,
      prompt: promptParts,
      output: {
        format: 'json',
        schema: InterpretDocumentOutputSchema,
      },
      config: {
        safetySettings: [
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      },
    });

    const outputData = response.output;
    if (!outputData) {
      throw new Error('AI response did not contain the expected output structure.');
    }
    // Ensure critical advice for medical results
    if (outputData.documentTypeGuess?.toLowerCase().includes('lab') || outputData.documentTypeGuess?.toLowerCase().includes('radiology') || outputData.documentTypeGuess?.toLowerCase().includes('test result')) {
        const doctorConsultationAdvice = "It's very important to discuss these results and what they mean for your health with your doctor. They have your full medical history and can provide an accurate interpretation and any necessary next steps.";
        if (!outputData.plainLanguageExplanation.includes("discuss these results") && !outputData.plainLanguageExplanation.includes("consult your doctor")) {
            outputData.plainLanguageExplanation += ` ${doctorConsultationAdvice}`;
        }
        if (!outputData.nextStepSuggestion || !outputData.nextStepSuggestion.toLowerCase().includes("discuss these results")) {
            outputData.nextStepSuggestion = doctorConsultationAdvice;
        }
    }


    return outputData as InterpretDocumentOutput;
  }
);

