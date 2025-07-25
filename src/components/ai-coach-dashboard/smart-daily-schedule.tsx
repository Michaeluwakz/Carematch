"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Sun, CheckCircle, TrendingUp, Dumbbell, Salad, RefreshCw, LogIn, ChevronDown, ChevronUp, Bot, Sparkles, PlusCircle, Trash2, ListTodo, Loader2 } from 'lucide-react';
import { getUserProfile } from '@/services/user-service';
import { useAuth } from '@/hooks/use-auth';
import { usePlanner } from '@/contexts/planner-context';
import { Button } from '@/components/ui/button';
import { nanoid } from 'nanoid';
import { serializeTimestamps } from '@/lib/utils';

// Simple weather fetch utility (OpenWeatherMap, replace with your API key)
async function fetchWeather(city = 'New York') {
  const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
  if (!apiKey) return { temp: 75, desc: 'Sunny' };
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`);
    const data = await res.json();
    return { temp: Math.round(data.main.temp), desc: data.weather[0].main };
  } catch {
    return { temp: 75, desc: 'Sunny' };
  }
}

const mealAlternatives = [
  'Grilled Tofu Salad (390 cal)',
  'Quinoa & Black Bean Bowl (410 cal)',
  'Egg White Omelette (320 cal)',
  'Oatmeal with Berries (350 cal)',
  'Chicken Caesar Wrap (420 cal)'
];
const workoutAlternatives = [
  '15-Min Yoga Flow',
  '30-Min Brisk Walk',
  'Strength Training Circuit',
  'Cycling (45 min)',
  'Pilates Core Session'
];

// Helper function to get emoji for planner item type or label
function getPlannerEmoji(type: string, label: string) {
  if (type === 'meal' || /meal|salad|bowl|sandwich|brunch|oatmeal|stir-fry|quinoa|chicken|turkey|salmon|veggie|food|lunch|dinner|breakfast/i.test(label)) return '🥗';
  if (type === 'workout' || /workout|yoga|training|cycling|pilates|hiking|run|walk|exercise|adaptive|strength/i.test(label)) return '🏋️';
  if (/hydration|water|drink/i.test(label)) return '💧';
  if (/mental|meditat|mindful|journal|mood|stress|burnout/i.test(label)) return '🧠';
  if (/doctor|appointment|medical|check|visit|clinic/i.test(label)) return '🩺';
  if (/health|heart|wellness/i.test(label)) return '❤️';
  return '';
}

export default function SmartDailySchedule() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [userGoals, setUserGoals] = useState('');
  const [aiData, setAiData] = useState<any>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [weather, setWeather] = useState<{ temp: number; desc: string }>({ temp: 75, desc: 'Sunny' });
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [lastTimetable, setLastTimetable] = useState<any[]>([]);

  // Interactivity states
  const [hydrated, setHydrated] = useState(false);
  const [meal, setMeal] = useState('High-Protein Chickpea Salad (387 cal)');
  const [showMealSwap, setShowMealSwap] = useState(false);
  const [workoutExpanded, setWorkoutExpanded] = useState(false);
  const [weightLogged, setWeightLogged] = useState(false);
  const [loggedWeight, setLoggedWeight] = useState('');
  const [suggestions, setSuggestions] = useState([
    'Add 10-min nap at 3 PM',
    'Reduce workout intensity by 20%'
  ]);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [swapType, setSwapType] = useState<'meal' | 'workout' | null>(null);
  const [showSwap, setShowSwap] = useState(false);
  const swapRef = useRef<HTMLDivElement>(null);

  // Planner context
  const { mealSuggestion, workoutSuggestion, acceptedMeal, acceptedWorkout, acceptSuggestion, addPlannedItem, plannedItems, removePlannedItem, togglePlannedItemDone } = usePlanner();

  // Group timetable by day for table
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const timetableByDay: Record<string, { time: string; activity: string; type: string }[]> = {};
  // Use aiData for suggestions and timetable
  let aiTimetable = Array.isArray(aiData?.timetable) ? aiData.timetable : [];
  // Fallback: if blank, use lastTimetable or a default sample
  if (!aiTimetable || aiTimetable.length === 0) {
    aiTimetable = lastTimetable.length > 0 ? lastTimetable : [
      { day: 'Monday', time: '7:00 AM', activity: '30 min brisk walk', type: 'workout' },
      { day: 'Monday', time: '12:30 PM', activity: 'Oatmeal with berries', type: 'meal' },
      { day: 'Tuesday', time: '7:00 AM', activity: 'Yoga session', type: 'workout' },
      { day: 'Tuesday', time: '12:30 PM', activity: 'Grilled chicken salad', type: 'meal' },
      { day: 'Wednesday', time: '7:00 AM', activity: 'Strength training', type: 'workout' },
      { day: 'Wednesday', time: '12:30 PM', activity: 'Quinoa bowl', type: 'meal' },
      { day: 'Thursday', time: '7:00 AM', activity: 'Cycling', type: 'workout' },
      { day: 'Thursday', time: '12:30 PM', activity: 'Veggie stir-fry', type: 'meal' },
      { day: 'Friday', time: '7:00 AM', activity: 'Pilates', type: 'workout' },
      { day: 'Friday', time: '12:30 PM', activity: 'Turkey sandwich', type: 'meal' },
      { day: 'Saturday', time: '8:00 AM', activity: 'Hiking', type: 'workout' },
      { day: 'Saturday', time: '1:00 PM', activity: 'Salmon with rice', type: 'meal' },
      { day: 'Sunday', time: '8:00 AM', activity: 'Rest day', type: 'workout' },
      { day: 'Sunday', time: '1:00 PM', activity: 'Family brunch', type: 'meal' },
    ];
  } else {
    setLastTimetable(aiTimetable);
  }
  days.forEach(day => {
    timetableByDay[day] = aiTimetable.filter((item: any) => item.day === day);
  });

  // Handler to add AI suggestion or timetable item to planner
  const handleAddToPlanner = (item: { label: string; day?: string; time?: string; type?: string }) => {
    addPlannedItem({
      id: nanoid(),
      label: item.label,
      day: item.day,
      time: item.time,
      type: item.type,
      source: 'ai',
    });
  };

  // Refactored fetch logic for AI timetable
  const fetchAiTimetable = async (profile: any, goals: string) => {
    setLoadingAI(true);
    setRegenerating(true);
    const res = await fetch('/api/ai-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: JSON.stringify({
          userProfile: serializeTimestamps(profile),
          userGoals: goals,
          language: profile?.preferredLanguage || 'English',
        })
      })
    });
    const data = await res.json();
    try {
      setAiData(JSON.parse(data.reply));
    } catch {
      setAiData(null);
    }
    setLoadingAI(false);
    setRegenerating(false);
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (user && user.uid) {
        const prof = await getUserProfile(user.uid);
        setProfile(prof);
        let goals = '';
        if (prof?.goals) {
          const g = prof.goals;
          const parts = [];
          if (g.weight) parts.push(`Reach weight: ${g.weight}`);
          if (g.steps) parts.push(`Daily steps: ${g.steps}`);
          if (g.sleepHours) parts.push(`Sleep: ${g.sleepHours} hrs/night`);
          goals = parts.join(', ');
        }
        if (!goals) goals = 'Improve my health and energy.';
        setUserGoals(goals);
        await fetchAiTimetable(prof, goals);
      }
      const w = await fetchWeather();
      setWeather(w);
      setLoading(false);
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Fallback/sample data
  const calories = profile?.dailyCalories || 1200;
  const calorieGoal = profile?.calorieGoal || 1500;
  const protein = profile?.dailyProtein || 80;
  const proteinGoal = profile?.proteinGoal || 80;
  const steps = profile?.dailySteps || 4892;
  const stepsGoal = profile?.stepsGoal || 8000;
  const progress = profile?.dailyCompletion || 85;
  const dateStr = new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' });

  // Use aiData for suggestions and timetable
  const aiSuggestions = [
    aiData?.dietAdvice && { type: 'diet', label: aiData.dietAdvice },
    aiData?.exerciseAdvice && { type: 'exercise', label: aiData.exerciseAdvice },
    aiData?.sleepAdvice && { type: 'sleep', label: aiData.sleepAdvice },
    aiData?.stressManagementAdvice && { type: 'stress', label: aiData.stressManagementAdvice },
  ].filter(Boolean);

  // Handlers
  const handleHydration = () => {
    setHydrated(true);
    setSuggestions(prev => prev.filter(s => !s.includes('nap')));
  };
  const handleMealSwap = (alt: string) => {
    setMeal(alt);
    setShowMealSwap(false);
    setSuggestions(prev => [...prev, 'Try a new recipe for dinner!']);
  };
  const handleWorkoutExpand = () => setWorkoutExpanded(v => !v);
  const handleLogWeight = () => {
    if (loggedWeight) setWeightLogged(true);
  };
  const handleSwap = (idx: number, type: 'meal' | 'workout') => {
    setSwapIndex(idx);
    setSwapType(type);
    setShowSwap(true);
  };
  const handleSelectSwap = (alt: string) => {
    if (swapIndex !== null && swapType) {
      const updated = [...plannedItems];
      updated[swapIndex] = {
        ...updated[swapIndex],
        label: alt,
        type: swapType
      };
      removePlannedItem(updated[swapIndex].id);
      addPlannedItem(updated[swapIndex]);
    }
    setShowSwap(false);
    setSwapIndex(null);
    setSwapType(null);
  };

  return (
    <>
      {/* Summary Bar (styled like provided image) */}
      <div className="w-full flex items-center justify-between rounded-2xl shadow-md px-8 py-4 mb-8" style={{ background: 'linear-gradient(90deg, #e3ecff 0%, #f5eaff 100%)' }}>
        <div className="flex flex-col items-start">
          <span className="text-xl font-bold text-blue-700 leading-tight">{dateStr.split(',')[0]},</span>
          <span className="text-lg font-bold text-blue-700 leading-tight">{dateStr.split(',')[1]}</span>
          <span className="text-3xl font-bold text-blue-700 leading-tight">{dateStr.split(',')[2]}</span>
        </div>
        <div className="flex flex-col items-center mx-6">
          <span className="flex items-center gap-1 text-xl font-bold text-orange-600"><span role="img" aria-label="fire">🔥</span> {progress}%</span>
          <span className="text-lg font-bold text-orange-600">Daily</span>
          <span className="text-lg font-bold text-orange-600">Completion</span>
        </div>
        <div className="flex flex-col items-center mx-6">
          <span className="text-base font-semibold">Calories: <span className="font-bold">{calories}</span>/{calorieGoal}</span>
          <span className="text-base font-semibold">Protein: <span className="font-bold">{protein}g</span> <span className="text-green-500">✔️</span></span>
          <span className="text-base font-semibold">Steps: <span className="font-bold">{steps}</span>/{stepsGoal}</span>
        </div>
        <div className="flex flex-col items-end text-orange-700 font-semibold text-lg">
          <span>{weather.temp}°F - {weather.desc} -</span>
          <span className="text-base">✻ Perfect for your 6 PM outdoor run!</span>
        </div>
      </div>
      {/* Regenerate Timetable Button */}
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            if (profile && userGoals) await fetchAiTimetable(profile, userGoals);
          }}
          disabled={regenerating || loadingAI}
          className="flex items-center gap-2"
        >
          {regenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {regenerating ? 'Regenerating...' : 'Regenerate Timetable'}
        </Button>
      </div>
      {/* Main Planner Body */}
      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Main Planner Section */}
        <div className="flex-1 space-y-6">
          {/* AI Coach Suggestions */}
          <Card className="bg-yellow-50/80 border-yellow-200 shadow-md">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg text-yellow-700">AI Coach Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-0">
              {loadingAI && <span className="text-muted-foreground">Loading AI suggestions...</span>}
              {aiSuggestions.length > 0 ? aiSuggestions.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{s.type}:</span> <span>{s.label}</span>
                  <Button size="sm" variant="outline" onClick={() => handleAddToPlanner({ label: s.label, type: s.type })}><PlusCircle className="h-4 w-4 mr-1" />Add</Button>
                </div>
              )) : !loadingAI && <span className="text-muted-foreground">No AI suggestions yet.</span>}
            </CardContent>
          </Card>
          {/* AI-Generated Timetable Table */}
          <Card className="bg-blue-50/80 border-blue-200 shadow-md">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg text-blue-700">AI-Generated Weekly Timetable</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto pt-0">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 bg-blue-100">Day</th>
                    <th className="border px-2 py-1 bg-blue-100">Time</th>
                    <th className="border px-2 py-1 bg-blue-100">Activity</th>
                    <th className="border px-2 py-1 bg-blue-100">Type</th>
                    <th className="border px-2 py-1 bg-blue-100">Add</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map(day => (
                    timetableByDay[day].length > 0 ? timetableByDay[day].map((item, idx) => (
                      <tr key={day + idx}>
                        <td className="border px-2 py-1 font-semibold">{day}</td>
                        <td className="border px-2 py-1">{item.time}</td>
                        <td className="border px-2 py-1">{item.activity}</td>
                        <td className="border px-2 py-1 capitalize">{item.type}</td>
                        <td className="border px-2 py-1">
                          <Button size="sm" variant="outline" onClick={() => handleAddToPlanner({ label: item.activity, day, time: item.time, type: item.type })}><PlusCircle className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    )) : null
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          {/* Planned Items (To-Do List) */}
          <Card className="bg-green-50/80 border-green-200 shadow-md">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
              <ListTodo className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg text-green-700">My Planner</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              {plannedItems.length === 0 && <span className="text-muted-foreground">No planned items yet. Add from above!</span>}
              {plannedItems.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2 border-b py-1">
                  <Button
                    size="icon"
                    variant={item.done ? "default" : "outline"}
                    className={item.done ? "bg-green-600 text-white" : "border-green-400 text-green-600"}
                    onClick={() => togglePlannedItemDone(item.id)}
                    aria-label={item.done ? "Mark as not done" : "Mark as done"}
                  >
                    <CheckCircle className="h-5 w-5" />
                  </Button>
                  <span className={`font-semibold ${item.done ? "line-through text-gray-400" : ""}`}>{getPlannerEmoji(item.type || '', item.label || '')}</span>
                  <span className={item.done ? "line-through text-gray-400" : ""}>{item.label}</span>
                  {item.day && <span className="text-xs text-muted-foreground">({item.day}{item.time ? ', ' + item.time : ''})</span>}
                  <span className="text-xs capitalize text-blue-500">{item.type}</span>
                  {item.source === 'ai' && <Sparkles className="h-4 w-4 text-yellow-400" aria-label="AI suggested" />}
                  {item.type === 'meal' && !item.done && (
                    <Button size="sm" variant="outline" onClick={() => handleSwap(idx, 'meal')}>Swap Meal</Button>
                  )}
                  {item.type === 'workout' && !item.done && (
                    <Button size="sm" variant="outline" onClick={() => handleSwap(idx, 'workout')}>Swap Exercise</Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => removePlannedItem(item.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                </div>
              ))}
              {/* Swap Modal/Dropdown */}
              {showSwap && (
                <div ref={swapRef} className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
                  <div className="bg-white rounded-lg shadow-lg p-6 min-w-[300px]">
                    <div className="mb-4 font-bold text-lg">Select an alternative {swapType === 'meal' ? 'Meal' : 'Exercise'}</div>
                    <div className="flex flex-col gap-2">
                      {(swapType === 'meal' ? mealAlternatives : workoutAlternatives).map((alt, i) => (
                        <Button key={i} variant="outline" onClick={() => handleSelectSwap(alt)}>{alt}</Button>
                      ))}
                    </div>
                    <Button className="mt-4 w-full" variant="secondary" onClick={() => setShowSwap(false)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Right Sidebar */}
        <div className="w-full md:w-80 flex-shrink-0 space-y-6">
          <Card className="bg-gradient-to-br from-yellow-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 shadow border-0">
            <CardHeader>
              <CardTitle className="text-base font-bold text-yellow-700 flex items-center gap-2">💡 Smart Suggestions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">Since you slept 5 hours last night:</div>
              <ul className="list-disc list-inside text-sm ml-4">
                {suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 shadow border-0">
            <CardHeader>
              <CardTitle className="text-base font-bold text-blue-700 flex items-center gap-2">📈 Progress Pulse</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">You’ve been <b>37%</b> more consistent than last week!</div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/*
        In your AI Coach chat component, add this to each AI-generated message:
        <Button size="sm" variant="outline" onClick={() => handleAddToPlanner({ label: message.text, type: 'chat' })}>Add to Planner</Button>
      */}
    </>
  );
} 