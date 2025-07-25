"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ListTodo, Sparkles } from "lucide-react";
import { nanoid } from 'nanoid';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, RefreshCw } from 'lucide-react';
import { getUserProfile } from '@/services/user-service';

const initialTasks = [
  { label: "Drink 2L Water", done: false },
  { label: "10-Minute Yoga", done: false },
  { label: "Eat 5 Servings of Veggies", done: false },
  { label: "Log Weight", done: false },
];

export default function InteractiveChecklist() {
  const [tasks, setTasks] = useState(initialTasks.map(t => ({ ...t, id: nanoid() })));
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const allDone = tasks.length > 0 && tasks.every(t => t.done);

  const toggle = (idx: number) => {
    setTasks(tasks => tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t));
  };

  const regenerateChecklist = async () => {
    setLoading(true);
    try {
      let profile = null;
      if (user && user.uid) {
        profile = await getUserProfile(user.uid);
      }
      let userGoals = profile?.healthGoals || '';
      if (!userGoals) {
        userGoals = window.prompt('What is your main health goal for today or this week? (e.g., Lose weight, improve sleep, reduce stress, eat healthier)', '');
        if (!userGoals) throw new Error('Health goal is required for AI checklist');
      }
      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid, userGoals }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate checklist');
      const newTasks = (data.checklist || []).map((label: string) => ({ id: nanoid(), label, done: false }));
      if (!newTasks.length) throw new Error('AI did not return any checklist items.');
      setTasks(newTasks);
      toast({ title: 'Checklist regenerated!', description: 'Your AI Coach checklist is ready.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not regenerate checklist', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 shadow-lg border-0">
      <CardContent className="py-6 flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-green-600" />
            <span className="text-lg font-bold text-green-700">Today's Checklist</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
            onClick={regenerateChecklist}
            disabled={loading}
            aria-label="Regenerate AI Coach Checklist"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {loading ? 'Regenerating...' : 'Regenerate'}
          </Button>
        </div>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30" />
                <div className="h-4 w-2/3 rounded bg-green-100 dark:bg-green-900/30" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task, idx) => (
              <li key={task.id} className="flex items-center gap-3 rounded-lg px-2 py-2 bg-green-50 dark:bg-green-900/20 shadow-sm">
                <Button
                  size="icon"
                  variant={task.done ? "default" : "outline"}
                  className={task.done ? "bg-green-600 text-white" : "border-green-400 text-green-600"}
                  onClick={() => toggle(idx)}
                  aria-label={task.done ? "Mark as not done" : "Mark as done"}
                >
                  <CheckCircle className="h-5 w-5" />
                </Button>
                <span className={`text-base font-medium transition-colors ${task.done ? "line-through text-gray-400" : "text-gray-800 dark:text-gray-100"}`}>{task.label}</span>
              </li>
            ))}
          </ul>
        )}
        {allDone && !loading && (
          <div className="flex items-center gap-2 mt-4 animate-bounce text-green-600 justify-center">
            <Sparkles className="h-6 w-6" />
            <span className="font-semibold">All tasks complete! Great job!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 