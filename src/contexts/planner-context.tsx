import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PlannerSuggestion {
  type: 'meal' | 'workout';
  suggestion: string;
}

interface PlannedItem {
  id: string;
  label: string;
  day?: string;
  time?: string;
  type?: string; // e.g., 'meal', 'workout', 'habit', etc.
  source?: 'ai' | 'user';
  done?: boolean; // <-- add this line
}

interface PlannerContextType {
  mealSuggestion: string | null;
  workoutSuggestion: string | null;
  acceptedMeal: string | null;
  acceptedWorkout: string | null;
  addSuggestion: (type: 'meal' | 'workout', suggestion: string) => void;
  acceptSuggestion: (type: 'meal' | 'workout') => void;
  plannedItems: PlannedItem[];
  addPlannedItem: (item: PlannedItem) => void;
  removePlannedItem: (id: string) => void;
  togglePlannedItemDone: (id: string) => void; // <-- add this line
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export function PlannerProvider({ children }: { children: ReactNode }) {
  const [mealSuggestion, setMealSuggestion] = useState<string | null>(null);
  const [workoutSuggestion, setWorkoutSuggestion] = useState<string | null>(null);
  const [acceptedMeal, setAcceptedMeal] = useState<string | null>(null);
  const [acceptedWorkout, setAcceptedWorkout] = useState<string | null>(null);
  const [plannedItems, setPlannedItems] = useState<PlannedItem[]>([]);

  const addSuggestion = (type: 'meal' | 'workout', suggestion: string) => {
    if (type === 'meal') setMealSuggestion(suggestion);
    if (type === 'workout') setWorkoutSuggestion(suggestion);
  };
  const acceptSuggestion = (type: 'meal' | 'workout') => {
    if (type === 'meal' && mealSuggestion) setAcceptedMeal(mealSuggestion);
    if (type === 'workout' && workoutSuggestion) setAcceptedWorkout(workoutSuggestion);
  };
  const addPlannedItem = (item: PlannedItem) => {
    setPlannedItems(prev => [...prev, { ...item, done: false }]); // ensure done is set
  };
  const removePlannedItem = (id: string) => {
    setPlannedItems(prev => prev.filter(item => item.id !== id));
  };
  const togglePlannedItemDone = (id: string) => {
    setPlannedItems(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  return (
    <PlannerContext.Provider value={{ mealSuggestion, workoutSuggestion, acceptedMeal, acceptedWorkout, addSuggestion, acceptSuggestion, plannedItems, addPlannedItem, removePlannedItem, togglePlannedItemDone }}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error('usePlanner must be used within a PlannerProvider');
  return ctx;
} 