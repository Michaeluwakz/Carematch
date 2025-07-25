"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Award, TrendingUp, HeartPulse, Flame, Droplets, Moon, CheckCircle, Sparkles } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

// Simulated data for demo
const stats = [
  { label: "Streak", value: "7 days", icon: <Flame className="h-6 w-6 text-orange-500" />, color: "from-orange-200 to-orange-400" },
  { label: "Hydration", value: "2.1 L", icon: <Droplets className="h-6 w-6 text-blue-400" />, color: "from-blue-100 to-blue-300" },
  { label: "Sleep", value: "7.5 hrs", icon: <Moon className="h-6 w-6 text-indigo-400" />, color: "from-indigo-100 to-indigo-300" },
  { label: "HRV", value: "58 ms", icon: <HeartPulse className="h-6 w-6 text-pink-500" />, color: "from-pink-100 to-pink-300" },
];

// REMOVED badges array

const weightTrend = [72, 71.8, 71.5, 71.2, 71.1, 70.9, 70.7];

function ProgressRing({ percent, size = 120, stroke = 10, color = "#5DADE2" }: { percent: number, size?: number, stroke?: number, color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size/2} cy={size/2} r={r} stroke="#e5e7eb" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700" />
      <text x="50%" y="54%" textAnchor="middle" fontSize="2.2rem" fontWeight="bold" fill="#2563eb">{percent}</text>
    </svg>
  );
}

function TrendChart({ data, color = '#5DADE2' }: { data: number[], color?: string }) {
  if (!data || data.length === 0) return <div className="text-muted-foreground">No data</div>;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data.map((v: number, i: number) => `${i * 40},${100 - ((v - min) / (max - min || 1)) * 80}`);
  return (
    <svg width={data.length * 40} height={120} className="block">
      <polyline fill="none" stroke={color} strokeWidth="4" points={points.join(' ')} />
      {data.map((v: number, i: number) => (
        <circle key={i} cx={i * 40} cy={100 - ((v - min) / (max - min || 1)) * 80} r="6" fill={color} className="shadow-lg" />
      ))}
    </svg>
  );
}

// Motivational quotes
const quotes = [
  "Every step forward is progress.",
  "Small habits make a big difference.",
  "Consistency beats intensity.",
  "You’re doing better than you think!",
  "Progress, not perfection.",
  "Your health is your wealth.",
];

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

// Placeholder for user data (replace with real user context if available)
const userName = "Friend"; // Replace with user's name if available
const streak = 7; // Replace with real streak value if available
const bestStreak = 12; // Replace with real best streak value if available
const lastWeekScore = 80; // Replace with real last week score if available

export default function ProgressTracking() {
  const [score, setScore] = useState(87); // Simulated health score
  const [quote, setQuote] = useState(getRandomQuote());

  // Calculate improvement
  const improvement = score - lastWeekScore;
  const improvementPercent = lastWeekScore ? Math.round(((score - lastWeekScore) / lastWeekScore) * 100) : 0;

  // Accessibility: Announce improvement
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const liveRegion = document.getElementById('progress-live-region');
      if (liveRegion) {
        liveRegion.textContent = `Your health score is ${score}. ${improvement >= 0 ? 'Up' : 'Down'} ${Math.abs(improvement)} points from last week.`;
      }
    }
  }, [score, improvement]);

  // Prepare chart data
  const chartData = weightTrend.map((v, i) => ({
    day: `Day ${i + 1}`,
    weight: v,
  }));

  return (
    <div className="w-full flex flex-col gap-8 items-center">
      {/* Live region for screen readers */}
      <div id="progress-live-region" aria-live="polite" className="sr-only" />
      {/* Motivational Quote & Streak */}
      <motion.div
        className="w-full max-w-2xl flex flex-col md:flex-row items-center justify-between bg-gradient-to-br from-blue-50 to-pink-100 dark:from-blue-900/40 dark:to-pink-900/30 rounded-2xl shadow-lg p-6 mt-2 mb-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        role="region"
        aria-label="Motivational message and streak"
      >
        <div className="flex-1 text-lg font-semibold text-blue-700 dark:text-blue-200" aria-label="Motivational quote">{quote}</div>
        <div className="flex flex-col items-center ml-6">
          <span className="text-2xl font-bold text-orange-600 flex items-center gap-2" aria-label={`Current streak: ${streak} days`}>
            <Flame className="h-7 w-7 animate-bounce" /> {streak} day streak
          </span>
          <span className="text-xs text-gray-500">Best: {bestStreak} days</span>
        </div>
      </motion.div>
      {/* Progress Ring & Score */}
      <motion.div
        className="relative flex flex-col items-center justify-center mb-2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        role="region"
        aria-label="AI Health Score"
      >
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none">
          <Sparkles className="h-10 w-10 text-blue-300 animate-pulse opacity-60" />
        </div>
        <div className="rounded-2xl bg-white/60 dark:bg-gray-900/60 shadow-xl p-6 backdrop-blur-xl border border-blue-100 dark:border-blue-900/30">
          <ProgressRing percent={score} />
          <div className="text-center mt-2">
            <span className="text-lg font-bold text-blue-700 dark:text-blue-200">AI Health Score</span>
            <div className="text-xs text-muted-foreground">Based on your habits, sleep, hydration, and activity</div>
            <div className="mt-2 text-sm font-medium" aria-label="Score improvement">
              {improvement >= 0 ? (
                <span className="text-green-600">▲ Up {improvement} ({improvementPercent}%) from last week</span>
              ) : (
                <span className="text-red-600">▼ Down {Math.abs(improvement)} ({Math.abs(improvementPercent)}%) from last week</span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      {/* Animated Stat Cards */}
      <div className="flex flex-wrap gap-6 justify-center w-full max-w-3xl">
        {stats.map((s, i) => (
          <motion.button
            key={i}
            className={`flex flex-col items-center gap-2 bg-gradient-to-br ${s.color} dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-5 min-w-[120px] transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400`}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
            tabIndex={0}
            aria-label={`Show more about ${s.label}`}
            title={`Click for more details about ${s.label}`}
            onClick={() => alert(`Show more details about ${s.label} (implement modal or expand here)`)}
          >
            <div className="mb-1">{s.icon}</div>
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white drop-shadow">{s.value}</span>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{s.label}</span>
          </motion.button>
        ))}
      </div>
      {/* Trend Chart (Recharts) */}
      <div className="w-full max-w-2xl bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-2xl shadow-lg p-6 mt-2">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="h-6 w-6 text-blue-500" />
          <span className="font-bold text-blue-700 dark:text-blue-200">Weight Trend (last 7 days)</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} />
            <RechartsTooltip contentStyle={{ fontSize: '14px', borderRadius: '8px' }} />
            <Line type="monotone" dataKey="weight" stroke="#5DADE2" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Personalized encouragement */}
      <div className="w-full max-w-2xl mt-4 text-center text-base font-medium text-green-700 dark:text-green-300" aria-label="Personalized encouragement">
        {`Keep it up, ${userName}! Every healthy choice counts.`}
      </div>
    </div>
  );
} 