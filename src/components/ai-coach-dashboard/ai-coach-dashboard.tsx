import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Award, Bot, ListTodo, TrendingUp, Zap, Menu, Sparkles } from "lucide-react";
import SmartDailySchedule from '@/components/ai-coach-dashboard/smart-daily-schedule';
import InteractiveChecklist from '@/components/ai-coach-dashboard/interactive-checklist';
import ProgressTracking from '@/components/ai-coach-dashboard/progress-tracking';
import AchievementsBadges from '@/components/ai-coach-dashboard/achievements-badges';
import AiCoachChat from '@/components/ai-coach-dashboard/ai-coach-chat';
import ManualOverride from '@/components/ai-coach-dashboard/manual-override';
import { PlannerProvider } from '@/contexts/planner-context';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile } from '@/services/user-service';
import type { UserProfile } from '@/lib/types';
import { useEffect } from 'react';

const navItems = [
  { label: "Planner", icon: <Activity className="h-5 w-5" />, section: "planner" },
  { label: "Checklist", icon: <ListTodo className="h-5 w-5" />, section: "checklist" },
  { label: "Progress", icon: <TrendingUp className="h-5 w-5" />, section: "progress" },
  { label: "Achievements", icon: <Award className="h-5 w-5" />, section: "achievements" },
  { label: "AI Coach", icon: <Bot className="h-5 w-5" />, section: "chat" },
];

export default function AiCoachDashboard() {
  const [section, setSection] = useState("planner");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (user && user.uid) {
        const prof = await getUserProfile(user.uid);
        setUserProfile(prof);
      }
    }
    fetchProfile();
  }, [user]);

  return (
    <PlannerProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Top Navigation Bar */}
        <nav className="fixed top-16 left-0 right-0 z-40 w-full bg-white/30 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg flex items-center justify-between px-4 md:px-12 py-3 border-b border-white/20 dark:border-gray-800/40">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-400/60 to-purple-400/40 rounded-xl p-2 shadow-lg">
              <Zap className="h-8 w-8 text-blue-600 drop-shadow-lg" />
            </div>
            <span className="text-xl md:text-2xl font-extrabold text-blue-700 dark:text-blue-200 tracking-tight">AI Coach</span>
          </div>
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-2">
            {navItems.map((item) => (
              <Button
                key={item.section}
                variant={section === item.section ? "default" : "ghost"}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${section === item.section ? 'bg-blue-600 text-white' : 'text-blue-900 dark:text-blue-100 hover:bg-blue-100/40 dark:hover:bg-blue-800/30'}`}
                onClick={() => setSection(item.section)}
              >
                {item.icon}
                <span>{item.label}</span>
              </Button>
            ))}
          </div>
          {/* Mobile Nav Toggle */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileNavOpen(v => !v)}>
              <Menu className="h-7 w-7" />
            </Button>
          </div>
        </nav>
        {/* Mobile Nav Drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex flex-col" onClick={() => setMobileNavOpen(false)}>
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-xl rounded-b-2xl mx-2 mt-2 p-4 flex flex-col gap-2 animate-slide-down" onClick={e => e.stopPropagation()}>
              {navItems.map((item) => (
                <Button
                  key={item.section}
                  variant={section === item.section ? "default" : "ghost"}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-lg transition-all duration-150 ${section === item.section ? 'bg-blue-600 text-white' : 'text-blue-900 dark:text-blue-100 hover:bg-blue-100/40 dark:hover:bg-blue-800/30'}`}
                  onClick={() => { setSection(item.section); setMobileNavOpen(false); }}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
        {/* Main Content */}
        <main className="flex flex-col items-center justify-start py-10 px-2 sm:px-6 md:px-12 lg:px-24 w-full min-h-[80vh]">
          <div className="h-20" /> {/* Spacer to prevent content from being hidden behind fixed nav */}
          <div className="w-full max-w-3xl md:max-w-4xl lg:max-w-5xl space-y-8">
            {section === "planner" && (
              <>
                <Card className="bg-white/90 dark:bg-gray-900/90 shadow-2xl border-0">
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold text-pink-600 flex items-center gap-2">
                      <Sparkles className="h-7 w-7" />
                      AI Coach Dashboard
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SmartDailySchedule />
                  </CardContent>
                </Card>
              </>
            )}
            {section === "checklist" && (
              <InteractiveChecklist />
            )}
            {section === "progress" && (
              <>
                <ProgressTracking />
              </>
            )}
            {section === "achievements" && (
              <AchievementsBadges userProfile={userProfile} />
            )}
            {section === "chat" && (
              <AiCoachChat />
            )}
          </div>
        </main>
      </div>
    </PlannerProvider>
  );
} 