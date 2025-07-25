import type { NextApiRequest, NextApiResponse } from 'next';

// Uses OpenRouter API key from .env (not .env.local)
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Missing message' });
  }
  // Use only process.env.OPENROUTER_API_KEY from .env
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenRouter API key in .env' });
  }
  try {
    const deepseekRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://your-app-domain.com', // Optional: set to your app domain
        'X-Title': 'Carematch AI Coach',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        messages: [
          { role: 'system', content: 'You are a professional, friendly AI Health Coach. Respond with clear, concise, actionable advice. Use bullet points, numbers, and clear section headings. Do not use markdown, HTML, or special formatting characters. Use appropriate, uplifting emojis.' },
          { role: 'user', content: message },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
    if (!deepseekRes.ok) {
      const errText = await deepseekRes.text();
      return res.status(deepseekRes.status).json({ error: errText });
    }
    const data = await deepseekRes.json();
    const reply = data?.choices?.[0]?.message?.content || 'No response from DeepSeek.';
    return res.status(200).json({ reply });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
} 