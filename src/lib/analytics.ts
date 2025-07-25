// src/lib/analytics.ts

export function calculateTrend(data: Array<{ value: number, date?: string } | number>) {
  if (!data || data.length < 2) return { trend: 'no data', change: 0, percent: 0 };
  const values = data.map(d => typeof d === 'number' ? d : d.value);
  const first = values[0];
  const last = values[values.length - 1];
  const change = last - first;
  const percent = first !== 0 ? (change / first) * 100 : 0;
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (change > 0.1) trend = 'increasing';
  else if (change < -0.1) trend = 'decreasing';
  return { trend, change: Math.round(change * 10) / 10, percent: Math.round(percent * 10) / 10 };
}

export function calculateGoalProgress(current: number, goal: number) {
  if (!goal || goal === 0) return { percent: 0, met: false };
  const percent = (current / goal) * 100;
  return { percent: Math.round(percent), met: percent >= 100 };
}

export function calculateStreak(data: number[], goal: number) {
  let streak = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i] >= goal) streak++;
    else break;
  }
  return streak;
}

// Risk/Alert Analytics
export function getUpcomingScreenings(screenings: Array<{ name: string; dueDate: string; completed: boolean }>) {
  const now = new Date();
  return (screenings || []).filter(s => !s.completed && new Date(s.dueDate) <= now);
}

export function getMedicationAdherence(medications: Array<{ name: string; missedDoses: number }>) {
  if (!medications || medications.length === 0) return { adherence: 100, missed: 0 };
  const total = medications.length;
  const missed = medications.reduce((sum, m) => sum + (m.missedDoses || 0), 0);
  const adherence = Math.max(0, 100 - (missed / (total * 7)) * 100); // assuming 1 dose/day/med for 7 days
  return { adherence: Math.round(adherence), missed };
}

export function getChronicConditionRisk(profile: any) {
  const risks = [];
  if (profile.chronicConditions?.includes('diabetes')) risks.push('Diabetes');
  if (profile.chronicConditions?.includes('hypertension')) risks.push('Hypertension');
  // Add more as needed
  return risks;
}

// Lifestyle/Behavior Insights
export function getDietQualityScore(profile: any) {
  if (typeof profile.dietQualityScore === 'number') return profile.dietQualityScore;
  if (profile.dietaryHabits === 'balanced') return 90;
  if (profile.dietaryHabits === 'vegetarian' || profile.dietaryHabits === 'vegan') return 80;
  if (profile.dietaryHabits === 'low-carb') return 75;
  return 60;
}

export function getHydrationStatus(hydration: Array<{ date: string; amount: number }>) {
  if (!hydration || hydration.length === 0) return { avg: 0, status: 'low' };
  const avg = hydration.reduce((sum, h) => sum + h.amount, 0) / hydration.length;
  let status: 'low' | 'adequate' | 'high' = 'adequate';
  if (avg < 1200) status = 'low';
  else if (avg > 3000) status = 'high';
  return { avg: Math.round(avg), status };
}

// Defensive fix for all analytics functions
export function getStressLevel(stress: any) {
  if (!Array.isArray(stress) || stress.length === 0) return 'unknown';
  const levels = stress.map((s: any) => s.level);
  const highCount = levels.filter((l: string) => l === 'high' || l === 'very_high').length;
  if (highCount / levels.length > 0.5) return 'high';
  const modCount = levels.filter((l: string) => l === 'moderate').length;
  if (modCount / levels.length > 0.5) return 'moderate';
  return 'low';
}

// Social/Environmental Analytics
export function getLonelinessStatus(socialSupport: any) {
  if (!Array.isArray(socialSupport) || socialSupport.length === 0) return 'unknown';
  const recent = socialSupport.slice(-7);
  const isolatedCount = recent.filter((s: any) => s.feeling === 'isolated').length;
  if (isolatedCount / recent.length > 0.5) return 'isolated';
  const supportedCount = recent.filter((s: any) => s.feeling === 'supported').length;
  if (supportedCount / recent.length > 0.5) return 'supported';
  return 'neutral';
}

export function getEnvironmentalRisk(environmentalRisks: any) {
  if (!Array.isArray(environmentalRisks) || environmentalRisks.length === 0) return 'none';
  const recent = environmentalRisks.slice(-7);
  const highRisk = recent.find((r: any) => r.level === 'high');
  return highRisk ? `${highRisk.type} (high)` : 'none';
}

// Preventive Health Analytics
export function getVaccinationStatus(immunizationRecords: Array<{ vaccineName: string; dateAdministered: any }>, recommendedVaccines: string[]) {
  const received = (immunizationRecords || []).map(r => r.vaccineName);
  const missing = recommendedVaccines.filter(v => !received.includes(v));
  return { received, missing };
}

export function getUpcomingPreventiveReminders(reminders: Array<{ name: string; dueDate: string; completed: boolean }>) {
  const now = new Date();
  return (reminders || []).filter(r => !r.completed && new Date(r.dueDate) <= now);
}

// AI-Generated Recommendations
export function getRecentActionPlans(aiActionPlans: Array<{ date: string; plan: string }>) {
  return (aiActionPlans || []).slice(-3).map(p => p.plan);
}

export function getMotivationalFeedback(analytics: any) {
  if (analytics?.goalProgress?.steps?.streak >= 7) return 'Amazing streak! Keep up your daily activity!';
  if (analytics?.trends?.weight?.trend === 'decreasing') return 'Great job on your weight loss progress!';
  if (analytics?.trends?.sleep?.trend === 'increasing') return 'Your sleep is improving—keep it up!';
  return 'Keep making healthy choices!';
}

// Mental Health Insights
export function getMoodPattern(moodLog: any) {
  if (!Array.isArray(moodLog) || moodLog.length === 0) return 'unknown';
  const recent = moodLog.slice(-7);
  const moodCounts = recent.reduce((acc: any, m: any) => { acc[m.mood] = (acc[m.mood] || 0) + 1; return acc; }, {});
  const mostCommon = Object.entries(moodCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
  return mostCommon ? mostCommon[0] : 'unknown';
}

export function getBurnoutRisk(burnoutRisk: any) {
  if (!Array.isArray(burnoutRisk) || burnoutRisk.length === 0) return 'unknown';
  const recent = burnoutRisk.slice(-7);
  const highCount = recent.filter((r: any) => r.risk === 'high').length;
  if (highCount / recent.length > 0.5) return 'high';
  const modCount = recent.filter((r: any) => r.risk === 'moderate').length;
  if (modCount / recent.length > 0.5) return 'moderate';
  return 'low';
}

// Engagement Analytics
export function getAppEngagement(appUsage: Array<{ date: string; action: string }>) {
  if (!appUsage || appUsage.length === 0) return 'unknown';
  const recent = appUsage.slice(-14); // last 2 weeks
  const daysUsed = new Set(recent.map(u => u.date)).size;
  if (daysUsed >= 10) return 'high';
  if (daysUsed >= 5) return 'moderate';
  return 'low';
}

export function getRecommendationFollowRate(recommendationResponses: Array<{ followed: boolean }>) {
  if (!recommendationResponses || recommendationResponses.length === 0) return 0;
  const followed = recommendationResponses.filter(r => r.followed).length;
  return Math.round((followed / recommendationResponses.length) * 100);
} 