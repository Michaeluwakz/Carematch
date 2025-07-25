import type { NextApiRequest, NextApiResponse } from 'next';
import { aiHealthCoachFlow } from '@/ai/flows/ai-health-coach-flow';
import { getUserProfile } from '@/services/user-service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { userId, userGoals } = req.body;
  if (!userId || !userGoals) {
    return res.status(400).json({ error: 'Missing userId or userGoals' });
  }
  try {
    let profile;
    try {
      profile = await getUserProfile(userId);
    } catch (e) {
      profile = null;
    }
    if (!profile) {
      // Fallback: use a default profile for testing/demo
      profile = {
        age: 30,
        genderIdentity: 'Not provided',
        weight: 70,
        knownDiseases: '',
        allergies: '',
        currentMedications: '',
      };
    }
    const aiRes = await aiHealthCoachFlow({
      userProfile: profile,
      userGoals,
      language: (profile as any).preferredLanguage || 'English',
      specificQuery: 'Checklist of healthy habits and self-care tasks for my goal. No meal plans or workout schedules.'
    });
    // Try to extract a checklist from the AI's advice (diet, exercise, sleep, stress, timetable)
    // For now, use the timetable if present, else split advice into actionable items
    let checklist: string[] = [];
    if (Array.isArray(aiRes.timetable) && aiRes.timetable.length > 0) {
      checklist = aiRes.timetable.map((item: any) => item.activity || item.label || item.task || '');
    } else {
      // Fallback: split advice fields into lines
      const allAdvice = [aiRes.dietAdvice, aiRes.exerciseAdvice, aiRes.sleepAdvice, aiRes.stressManagementAdvice].join('\n');
      checklist = allAdvice.split(/\n|\r|\d+\.|•|\*/).map(l => l.trim()).filter(Boolean);
    }
    // Remove empty or duplicate items
    checklist = Array.from(new Set(checklist.filter(Boolean)));
    // For each item, keep up to the first sentence-ending punctuation, or the full line if none
    checklist = checklist.map(item => {
      let phrase = item.trim();
      const match = phrase.match(/^(.*?[.!?])\s|^(.*?[.!?])$/);
      if (match) {
        phrase = match[1] || match[2] || phrase;
      }
      phrase = phrase.charAt(0).toUpperCase() + phrase.slice(1).trim();
      return phrase;
    });
    checklist = checklist.slice(0, 5); // Limit to 5 items
    return res.status(200).json({ checklist });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
} 