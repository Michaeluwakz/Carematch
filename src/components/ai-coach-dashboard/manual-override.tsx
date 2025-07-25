"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Edit, Save, RefreshCw } from "lucide-react";

const initialTasks = [
  { time: "7:00 AM", activity: "5-Minute Mobility Flow" },
  { time: "8:00 AM", activity: "Healthy Breakfast: Oatmeal & Berries" },
  { time: "12:30 PM", activity: "High-Protein Lunch: Grilled Chicken Salad" },
  { time: "6:00 PM", activity: "Home Workout: 3x12 Squats" },
];

export default function ManualOverride() {
  const [tasks, setTasks] = useState(initialTasks);
  const [editing, setEditing] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  // Simple drag-and-drop reorder (placeholder)
  const move = (from: number, to: number) => {
    if (to < 0 || to >= tasks.length) return;
    const updated = [...tasks];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setTasks(updated);
  };

  const startEdit = (idx: number) => {
    setEditing(idx);
    setEditValue(tasks[idx].activity);
  };
  const saveEdit = (idx: number) => {
    setTasks(tasks => tasks.map((t, i) => i === idx ? { ...t, activity: editValue } : t));
    setEditing(null);
  };

  const reschedule = (idx: number) => {
    alert("Reschedule feature coming soon!");
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 shadow-lg border-0">
      <CardContent className="py-6 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-2">
          <GripVertical className="h-6 w-6 text-blue-400" />
          <span className="text-lg font-bold text-blue-700">Manual Override / Edit Tasks</span>
        </div>
        <div className="flex flex-col gap-3">
          {tasks.map((task, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm">
              <Button size="icon" variant="outline" onClick={() => move(idx, idx - 1)} disabled={idx === 0} className="text-blue-400">↑</Button>
              <Button size="icon" variant="outline" onClick={() => move(idx, idx + 1)} disabled={idx === tasks.length - 1} className="text-blue-400">↓</Button>
              {editing === idx ? (
                <>
                  <input
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-2 py-1"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                  />
                  <Button size="icon" onClick={() => saveEdit(idx)} className="bg-green-600 text-white"><Save className="h-4 w-4" /></Button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-base text-gray-800 dark:text-gray-100">{task.time} - {task.activity}</span>
                  <Button size="icon" variant="outline" onClick={() => startEdit(idx)} className="text-blue-400"><Edit className="h-4 w-4" /></Button>
                </>
              )}
              <Button size="icon" variant="outline" onClick={() => reschedule(idx)} className="text-purple-400"><RefreshCw className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 