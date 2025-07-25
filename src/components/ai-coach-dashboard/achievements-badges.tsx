"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Sparkles, CheckCircle } from "lucide-react";
import type { UserProfile } from '@/lib/types';

interface AchievementsBadgesProps {
  userProfile?: UserProfile | null;
}

function getUnlockedBadges(userProfile?: UserProfile | null) {
  // Example logic for dynamic unlocking
  const streak = userProfile?.streak || 0; // Replace with real streak logic if available
  const hydration = userProfile?.hydration || [];
  const sleepHours = userProfile?.biometrics?.sleepHours || [];
  const checklistCompletions = userProfile?.appUsage?.filter(u => u.action === 'checklist_complete').length || 0;
  const aiChatUses = userProfile?.appUsage?.filter(u => u.action === 'ai_chat').length || 0;
  const goalsSet = userProfile?.goals ? true : false;

  return [
    { label: "5-Day Streak", unlocked: streak >= 5 },
    { label: "Meal Prep Pro", unlocked: false }, // Example static
    { label: "Consistency Champ", unlocked: streak >= 10 },
    { label: "Hydration Hero", unlocked: hydration.length >= 5 },
    { label: "10-Day Streak", unlocked: streak >= 10 },
    { label: "Early Riser", unlocked: false }, // Add logic if you track sleep times
    { label: "Step Master", unlocked: false }, // Add logic if you track steps
    { label: "Veggie Lover", unlocked: false }, // Add logic if you track meals
    { label: "Weight Logger", unlocked: false }, // Add logic if you track weight logs
    { label: "Hydration Streak", unlocked: hydration.length >= 10 },
    { label: "Sleep Star", unlocked: sleepHours.filter(s => s.value >= 8).length >= 7 },
    { label: "First Checklist Complete", unlocked: checklistCompletions > 0 },
    { label: "AI Chat Engager", unlocked: aiChatUses >= 5 },
    { label: "Goal Setter", unlocked: goalsSet },
  ];
}

export default function AchievementsBadges({ userProfile }: AchievementsBadgesProps) {
  const badges = getUnlockedBadges(userProfile);
  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 shadow-lg border-0">
      <CardContent className="py-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <Award className="h-6 w-6 text-yellow-500 animate-bounce" />
          <span className="text-lg font-bold text-yellow-700">Achievements & Badges</span>
        </div>
        <div className="flex gap-4 flex-wrap justify-center">
          {badges.map((b, i) => (
            <div key={i} className={`flex flex-col items-center gap-1 p-4 rounded-lg shadow-md ${b.unlocked ? "bg-yellow-100 dark:bg-yellow-900/30" : "bg-gray-100 dark:bg-gray-800/30 opacity-60"}`}>
              {b.unlocked ? <CheckCircle className="h-8 w-8 text-green-500 animate-pulse" /> : <Sparkles className="h-8 w-8 text-gray-400" />}
              <span className={`text-base font-semibold ${b.unlocked ? "text-yellow-800" : "text-gray-400"}`}>{b.label}</span>
              {b.unlocked && <span className="text-xs text-green-600 animate-pulse">Unlocked!</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 