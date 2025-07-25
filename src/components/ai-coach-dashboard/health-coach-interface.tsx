
"use client";

import { useState, type FormEvent, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { aiHealthCoachFlow, aiHealthCoachDeepSeekFlow, type AiHealthCoachInput, type AiHealthCoachOutput } from '@/ai/flows/ai-health-coach-flow';
import { 
  Loader2, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  ShieldAlert, 
  BookOpen, 
  Zap, 
  BedDouble, 
  Brain, 
  Languages,
  Target,
  Clock,
  Heart,
  Activity,
  Utensils,
  TrendingUp,
  CheckCircle,
  Star,
  ExternalLink,
  User,
  Send
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import type { UserProfile } from '@/lib/types';
import { formatAiResponseWithSpacing } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

// Add a new type for the timetable
export type TimetableEntry = {
  day: string;
  time: string;
  activity: string;
};

// Extend AiHealthCoachOutput to include an optional timetable
export type AiHealthCoachOutputWithTimetable = AiHealthCoachOutput & {
  timetable?: TimetableEntry[];
};

// Helper for unique message IDs
function getUniqueId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function HealthCoachInterface() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [messages, setMessages] = useState([
    { id: 'ai-greeting', sender: 'ai', text: "Hi! I'm your AI Coach.", timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [language, setLanguage] = useState('English');
  const [model, setModel] = useState<'gemini' | 'deepseek'>('gemini');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && user && !userProfile?.onboardingCompleted) {
      setProfileError("Please complete your health profile in the Onboarding section to get personalized advice. Some features may be limited.");
      toast({
        title: "Profile Incomplete",
        description: "Complete your profile for the best AI Coach experience.",
        variant: "default",
        duration: 5000,
      });
    } else {
      setProfileError(null);
    }
  }, [user, userProfile, authLoading, toast]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') || scrollAreaRef.current.firstChild as HTMLElement;
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;
    if (!user || !userProfile) {
      setError("You need to be logged in and have a completed profile to use the AI Coach.");
      toast({ title: "Authentication Required", description: "Please log in and complete your profile.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setError(null);
    const userMessage = {
      id: getUniqueId(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    const profileForAI = {
      age: userProfile?.age,
      genderIdentity: userProfile?.genderIdentity,
      weight: userProfile?.weight,
      knownDiseases: userProfile?.knownDiseases,
      allergies: userProfile?.allergies,
      currentMedications: userProfile?.currentMedications,
    };
    try {
      const input: AiHealthCoachInput = {
        userProfile: profileForAI,
        userGoals: inputValue,
        language: language,
      };
      let coachResult: AiHealthCoachOutput;
      if (model === 'gemini') {
        coachResult = await aiHealthCoachFlow(input);
      } else {
        coachResult = await aiHealthCoachDeepSeekFlow(input);
      }
      const aiMessage = {
        id: getUniqueId(),
        sender: 'ai',
        text: coachResult.personalizedSummary || "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error.";
      setMessages(prev => [...prev, {
        id: getUniqueId(),
        sender: 'ai',
        text: `AI error: ${errorMessage}`,
        timestamp: new Date(),
      }]);
      toast({
        title: "Plan Generation Failed",
        description: `Could not generate your plan. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading your AI Coach...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Card className="max-w-xl mx-auto border-red-200 bg-red-50 dark:bg-red-900/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-red-800 dark:text-red-200">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-red-700 dark:text-red-300 mb-4">
            Please log in or sign up to use the AI Coach.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default" className="bg-red-600 hover:bg-red-700">
              <Link href="/login">Log In</Link>
            </Button>
            <Button asChild variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (profileError) {
     return (
      <Card className="max-w-xl mx-auto border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 dark:bg-yellow-900/50 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-yellow-800 dark:text-yellow-200">Profile Incomplete</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            {profileError}
          </p>
          <Button asChild variant="default" className="bg-yellow-600 hover:bg-yellow-700">
            <Link href="/onboarding">Complete Profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl flex flex-col h-[calc(100vh-12rem)] sm:h-[calc(100vh-10rem)]">
      <CardHeader className="border-b flex flex-row justify-between items-center">
        <CardTitle className="text-xl font-semibold text-pink-600 flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          AI Coach Chat
        </CardTitle>
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-muted-foreground">Model:</span>
          <Select value={model} onValueChange={v => setModel(v as 'gemini' | 'deepseek')}>
            <SelectTrigger className="w-28 h-8 text-xs">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gemini">Gemini</SelectItem>
              <SelectItem value="deepseek">DeepSeek</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'ai' && <Avatar className="h-8 w-8 shrink-0 border-2 border-pink-400"><AvatarFallback><Sparkles size={18} className="text-pink-600"/></AvatarFallback></Avatar>}
                <div className={`flex flex-col max-w-[75%]`}>
                  <div className={`p-3 rounded-xl shadow ${msg.sender === 'user' ? 'bg-pink-600 text-white rounded-br-none ml-auto' : 'bg-secondary text-secondary-foreground rounded-bl-none'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  <div className={`flex items-center mt-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <p className={`text-xs ml-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                      {(typeof msg.timestamp === 'string' ? new Date(msg.timestamp) : msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {msg.sender === 'user' && <Avatar className="h-8 w-8 shrink-0 border-2 border-pink-400"><AvatarFallback><User size={18} className="text-pink-600"/></AvatarFallback></Avatar>}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-end gap-2">
                <Avatar className="h-8 w-8 shrink-0 border-2 border-pink-400"><AvatarFallback><Sparkles size={18} className="text-pink-600"/></AvatarFallback></Avatar>
                <div className="max-w-[70%] p-3 rounded-lg shadow bg-secondary text-secondary-foreground rounded-bl-none">
                  <Loader2 className="h-5 w-5 animate-spin text-pink-600" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t p-2 sm:p-4">
        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
          <Input type="text" placeholder={isLoading ? "AI is thinking..." : "Type your message..."} value={inputValue} onChange={e => setInputValue(e.target.value)} className="flex-grow" disabled={isLoading} aria-label="Your message" />
          <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" aria-label="Send message">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}

