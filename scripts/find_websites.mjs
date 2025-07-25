
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const DATA_FILE = path.join(process.cwd(), 'src', 'data', 'nhia-hcps.json');

async function searchDuckDuckGo(query) {
  const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; CarematchBot/1.0)'
    }
  });
  const html = await res.text();
  const $ = cheerio.load(html);
  // DuckDuckGo HTML SERP: results are in .result__url or .result__a
  const firstResult = $('.result__a').first();
  const href = firstResult.attr('href');
  return href || null;
}

async function main() {
  console.log('Starting web search for first 20 NHIA practitioners...');
  const fileContent = await fs.readFile(DATA_FILE, 'utf-8');
  const practitioners = JSON.parse(fileContent);

  for (let i = 0; i < 20 && i < practitioners.length; i++) {
    const practitioner = practitioners[i];
    const name = practitioner.value.healthcareprovidername;
    const address = practitioner.value.address;
    const query = `${name} ${address} official website`;
    console.log(`\n[${i+1}] Searching: ${query}`);
    try {
      const url = await searchDuckDuckGo(query);
      if (url) {
        console.log(`Found: ${url}`);
      } else {
        console.log('No website found.');
      }
    } catch (err) {
      console.error('Error searching:', err);
    }
    await new Promise(r => setTimeout(r, 1500)); // polite delay
  }
  console.log('\nDone.');
}

main().catch(console.error);

