import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats an AI response for display by:
 * - Adding clear paragraph breaks and extra spacing for readability
 * - Grouping sentences into paragraphs (split at double newlines or after 2-3 sentences)
 * - Removing any leftover markdown/HTML tags and special characters
 * - Ensuring no markdown/HTML formatting remains
 *
 * @param text The raw AI response string
 * @returns The formatted string with clear paragraphs and spacing
 */
export function formatAiResponseWithSpacing(text: string): string {
  if (!text) return '';
  // Remove HTML tags
  let cleaned = text.replace(/<[^>]+>/g, '');
  // Remove markdown and special formatting
  cleaned = cleaned.replace(/[*_`#~\[\]()\|>]/g, '');
  // Normalize whitespace
  cleaned = cleaned.replace(/\r\n|\r/g, '\n');
  // Ensure section headings (ending with colon) start a new paragraph
  cleaned = cleaned.replace(/(^|\n)([^\n:]{2,}:)/g, '\n\n$2');
  // Ensure emojis at the start of a line/section start a new paragraph
  cleaned = cleaned.replace(/(^|\n)([\p{Emoji}])/gu, '\n\n$2');
  // Ensure bullet points start a new paragraph
  cleaned = cleaned.replace(/(\n)?([\u2022\-•])\s+/g, '\n\n$2 ');
  // Split into sentences
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  // Group sentences into paragraphs of 2-3 sentences
  const paragraphs = [];
  let para = '';
  let count = 0;
  for (const sentence of sentences) {
    para += sentence.trim() + ' ';
    count++;
    if (count >= 3 || sentence.match(/\n{2,}/)) {
      paragraphs.push(para.trim());
      para = '';
      count = 0;
    }
  }
  if (para.trim()) paragraphs.push(para.trim());
  // Remove any accidental triple+ newlines
  let result = paragraphs.join('\n\n').replace(/\n{3,}/g, '\n\n');
  // Remove any leftover markdown/HTML
  result = result.replace(/[*_`#~\[\]()\|>]/g, '');
  // Trim and return
  return result.trim();
}

// Recursively convert Firestore Timestamps to ISO strings for safe serialization
export function serializeTimestamps(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(serializeTimestamps);
  }
  if (obj && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      if (
        obj[key] &&
        typeof obj[key] === 'object' &&
        typeof obj[key].seconds === 'number' &&
        typeof obj[key].nanoseconds === 'number'
      ) {
        // Firestore Timestamp
        newObj[key] = new Date(obj[key].seconds * 1000 + obj[key].nanoseconds / 1e6).toISOString();
      } else {
        newObj[key] = serializeTimestamps(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
}
