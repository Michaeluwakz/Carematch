
'use server';

import * as cheerio from 'cheerio';

/**
 * Fetches the content of a web page and extracts the main text.
 * @param url The URL of the web page to scrape.
 * @returns The extracted text content of the page.
 */
export async function scrapeWebPage(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script and style elements
    $('script, style, nav, footer, header, aside').remove();
    
    // A simple heuristic to get the main content: look for common main content containers
    let mainContent = $('main').text() || $('article').text() || $('#content').text() || $('#main').text();

    if (!mainContent) {
        // Fallback to getting all body text if specific containers are not found
        mainContent = $('body').text();
    }

    // Clean up the text: remove excessive whitespace and newlines
    const cleanedText = mainContent.replace(/\s\s+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
    
    // Limit the text to a reasonable length for the AI prompt
    const maxLength = 8000; // Approx 8k characters
    return cleanedText.length > maxLength ? cleanedText.substring(0, maxLength) + "..." : cleanedText;

  } catch (error) {
    console.error(`Error scraping URL ${url}:`, error);
    if (error instanceof Error) {
        return `Error: Could not read content from the provided URL. ${error.message}`;
    }
    return `Error: An unknown error occurred while trying to read the URL.`;
  }
}
