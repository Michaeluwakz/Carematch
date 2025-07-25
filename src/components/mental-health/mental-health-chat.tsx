
"use client";

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input'; // Changed from Textarea to Input for single line
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mentalHealthCompanionFlow, mentalHealthCompanionDeepSeekFlow, type MentalHealthCompanionInput, type MentalHealthCompanionOutput } from '@/ai/flows/mental-health-companion-flow';
import { Loader2, Send, User, Sparkles, ShieldAlert, ExternalLink, Bot } from 'lucide-react'; // Sparkles for AI
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatAiResponseWithSpacing } from '@/lib/utils';
import { getUserProfile } from '@/services/user-service';
import { getMoodPattern, getBurnoutRisk } from '@/lib/analytics';
import { useAuth } from '@/hooks/use-auth';
import { serializeTimestamps } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  // AI-specific fields
  detectedSentiment?: string;
  gentleSuggestions?: string[];
  resourceLinks?: MentalHealthCompanionOutput['resourceLinks'];
  disclaimer?: string;
}

interface JournalEntry {
  date: string;
  text: string;
}

function JournalSection({ journalEntries, onAddEntry }: { journalEntries: JournalEntry[]; onAddEntry: (text: string) => void }) {
  const [entry, setEntry] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [entryFeedback, setEntryFeedback] = useState<string | null>(null);
  const [loadingEntryFeedback, setLoadingEntryFeedback] = useState(false);

  useEffect(() => {
    async function analyzeJournal() {
      if (!journalEntries || journalEntries.length === 0) {
        setAiSuggestion(null);
        return;
      }
      setLoadingSuggestion(true);
      const lastEntries = journalEntries.slice(-5).map(j => `- ${j.text}`).join('\n');
      const prompt = `Analyze these journal entries. If the mood is sad or struggling, suggest a short, quick, and concise uplifting message or practical tip to help the user feel better. If the mood is positive, offer a brief encouragement to keep going. Keep your response under 2 sentences.\n\nJournal Entries:\n${lastEntries}`;
      try {
        const result = await mentalHealthCompanionDeepSeekFlow({ userInput: prompt });
        setAiSuggestion(result.response || null);
      } catch {
        setAiSuggestion(null);
      } finally {
        setLoadingSuggestion(false);
      }
    }
    analyzeJournal();
  }, [journalEntries]);

  // Handler for per-entry AI feedback
  const handleEntryFeedback = async (j: JournalEntry) => {
    setSelectedEntry(j);
    setLoadingEntryFeedback(true);
    setEntryFeedback(null);
    const prompt = `Analyze this journal entry. If the mood is sad or struggling, suggest a short, quick, and concise uplifting message or practical tip to help the user feel better. If the mood is positive, offer a brief encouragement to keep going. Keep your response under 2 sentences.\n\nJournal Entry:\n${j.text}`;
    try {
      const result = await mentalHealthCompanionDeepSeekFlow({ userInput: prompt });
      setEntryFeedback(result.response || null);
    } catch {
      setEntryFeedback('AI feedback unavailable.');
    } finally {
      setLoadingEntryFeedback(false);
      setShowSuggestionDialog(true);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="font-bold mb-2">My Journal</h3>
      {/* Removed overall AI encouragement card */}
      <textarea
        className="w-full border rounded p-2 mb-2"
        rows={3}
        value={entry}
        onChange={e => setEntry(e.target.value)}
        placeholder="Write your thoughts or feelings..."
      />
      <button
        className="bg-primary text-white px-4 py-2 rounded"
        onClick={() => {
          if (entry.trim()) {
            onAddEntry(entry.trim());
            setEntry('');
          }
        }}
      >
        Add Entry
      </button>
      <div className="mt-4">
        {journalEntries?.length > 0 ? (
          journalEntries.slice().reverse().map((j: JournalEntry, i: number) => (
            <div key={i} className="mb-2 p-2 bg-gray-50 rounded border flex items-center justify-between gap-2">
              <div>
                <div className="text-xs text-muted-foreground">{new Date(j.date).toLocaleString()}</div>
                <div>{j.text}</div>
              </div>
              <button
                className="ml-2 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1 hover:bg-blue-200 transition"
                title="Get AI feedback for this entry"
                onClick={() => handleEntryFeedback(j)}
              >
                <Sparkles size={14} /> AI
              </button>
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No journal entries yet.</div>
        )}
      </div>
      <Dialog open={showSuggestionDialog} onOpenChange={setShowSuggestionDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>AI Feedback for Journal Entry</DialogTitle>
          </DialogHeader>
          <div className="mb-2 text-xs text-muted-foreground">{selectedEntry?.text}</div>
          <div className="text-base text-blue-900 whitespace-pre-line min-h-[2em]">
            {loadingEntryFeedback ? 'Analyzing...' : entryFeedback}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function MentalHealthChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [model, setModel] = useState<'gemini' | 'deepseek'>('gemini');
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [view, setView] = useState<'chat' | 'journal'>('chat');

  useEffect(() => {
    async function fetchProfile() {
      if (user && user.uid) {
        const prof = await getUserProfile(user.uid);
        setUserProfile(prof);
      }
    }
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const initialAiMessage: ChatMessage = {
      id: 'initial-ai-message',
      sender: 'ai',
      text: "Hello. This is a space where you can share what's on your mind. I'm here to listen and offer support. How are you feeling today?",
      timestamp: new Date(),
      disclaimer: "Please remember, I am an AI companion and not a substitute for professional medical advice, diagnosis, or treatment. If you are experiencing significant distress or a mental health crisis, please consult with a qualified healthcare professional or a crisis support service immediately."
    };
    setMessages([initialAiMessage]);
  }, []);

  useEffect(() => {
    if (userProfile?.journalEntries) {
      setJournalEntries(serializeTimestamps(userProfile.journalEntries));
    }
  }, [userProfile]);

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Smarter health-related detection
      const healthIntentPattern = /(health\b|\bsymptom\b|\bdoctor\b|\bpain\b|\bhelp\b|\badvice\b|\bmedication\b|\btreatment\b|\bcondition\b|\ballergy\b|\bdisease\b|\bdiagnosis\b|\bblood pressure\b|\bheart rate\b|\bweight\b|\bexercise\b|\bdiet\b|\bnutrition\b|\bsleep\b|\bstress\b|\bappointment\b|\bclinic\b|\bhospital\b|\bemergency\b|\binjury\b|\billness\b|\bsick\b|\bwellness\b|\btherapy\b|\bmental\b|\banxiety\b|\bdepression\b|\bmeds\b|\bpill\b|\btablet\b|\bdose\b|\bside effect\b|\bvaccine\b|\bimmunization\b|\blab\b|\btest\b|\bresult\b|\bsurgery\b|\bprocedure\b|\bspecialist\b|\breferral\b|\bconsult\b|\bcheckup\b|\bscreening\b|\bmonitor\b|\btrack\b|\blog\b|\brecord\b|i feel|i have|i am experiencing|i'm experiencing|what should i do|can you help|is it safe|do you recommend|should i|do i need|how can i|what can i do|what do you suggest|what's wrong|what is wrong|my symptoms|my condition|my health|i'm worried|i am worried|i'm concerned|i am concerned|i'm not feeling well|i am not feeling well|i'm sick|i am sick|i'm in pain|i am in pain|i'm hurt|i am hurt|i'm injured|i am injured|i'm anxious|i am anxious|i'm depressed|i am depressed|i'm stressed|i am stressed)/i;
      const includeProfile = healthIntentPattern.test(inputValue);
      let aiInput: any = { userInput: currentInput };
      if (includeProfile && userProfile) {
        aiInput.userProfile = userProfile;
        aiInput.mentalHealthInsights = {
          moodPattern: getMoodPattern(userProfile.moodLog || []),
          burnoutRisk: getBurnoutRisk(userProfile.burnoutRisk || []),
        };
        aiInput.journalEntries = (userProfile.journalEntries || []).slice(-5);
      }
      
      let result: MentalHealthCompanionOutput;
      if (model === 'gemini') {
        result = await mentalHealthCompanionFlow(aiInput);
      } else {
        result = await mentalHealthCompanionDeepSeekFlow(aiInput);
      }
      
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.response,
        timestamp: new Date(),
        detectedSentiment: result.detectedSentiment,
        gentleSuggestions: result.gentleSuggestions,
        resourceLinks: result.resourceLinks,
        disclaimer: result.disclaimer,
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Error calling Mental Health Companion flow:", error);
      const errorMessageText = error instanceof Error ? error.message : "An unknown error occurred.";
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: 'ai',
        text: `I'm sorry, I encountered an issue: ${errorMessageText}. Please try again. If the problem persists, remember that support is available through professional channels.`,
        timestamp: new Date(),
        disclaimer: "Please remember, I am an AI companion and not a substitute for professional medical advice, diagnosis, or treatment. If you are experiencing significant distress or a mental health crisis, please consult with a qualified healthcare professional or a crisis support service immediately."
      };
      setMessages(prev => [...prev, errorMessage]);
      toast({
        title: "Error",
        description: `Could not connect to the AI companion. ${errorMessageText}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddJournalEntry = async (text: string) => {
    if (!user || !userProfile) return;
    const newEntry = { date: new Date().toISOString(), text };
    const updatedEntries = [...(userProfile.journalEntries || []), newEntry];
    setJournalEntries(updatedEntries);
    // Save to backend (Firestore or your backend API)
    try {
      await fetch(`/api/save-journal?uid=${user.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ journalEntries: updatedEntries })
      });
    } catch (err) {
      // Optionally show error
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') || scrollAreaRef.current.firstChild as HTMLElement;
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Card className="w-full max-w-4xl mx-auto shadow-2xl flex flex-col h-[80vh]">
        <div className="px-6 pt-6">
          <div className="flex justify-end mb-4">
            <button
              className="px-5 py-2 rounded-full font-semibold shadow-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-150"
              onClick={() => router.push('/mental-health-companion/journal')}
            >
              Go to Journal
            </button>
          </div>
          <CardHeader
            className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-blue-100 flex flex-row items-center justify-between gap-4 shadow-sm"
            style={{ borderTopLeftRadius: '1.25rem', borderTopRightRadius: '1.25rem' }}
          >
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 p-2">
                <Bot className="h-6 w-6 text-primary" />
              </span>
              <span className="text-xl font-bold text-primary">AI Mental Health Companion</span>
            </div>
            <div className="flex items-center gap-3">
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
            <ScrollArea className="h-[48vh] p-4" style={{ maxHeight: '48vh', overflowY: 'auto' }} ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                    {msg.sender === 'ai' && <Avatar className="h-8 w-8 shrink-0"><AvatarFallback><Bot size={18} className="text-primary"/></AvatarFallback></Avatar>}
                    <div className={`flex flex-col max-w-[75%]`}>
                      <div className={`p-3 rounded-xl shadow ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.sender === 'ai' ? formatAiResponseWithSpacing(msg.text) : msg.text}</p>
                        {msg.sender === 'ai' && Array.isArray(msg.resourceLinks) && msg.resourceLinks.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-muted-foreground/20">
                            <p className="text-xs font-medium mb-1">You might find these resources helpful:</p>
                            <ul className="text-xs space-y-0.5">
                              {msg.resourceLinks.map((link, i) => (
                                <li key={i}>
                                  <Link
                                    href={link.url}
                                    target={link.url.startsWith('http') ? '_blank' : undefined}
                                    rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                                    className="text-primary hover:underline flex items-center gap-1"
                                  >
                                    {link.title} {link.url.startsWith('http') && <ExternalLink size={12} />}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className={`flex items-center mt-1 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <p className={`text-xs ml-1 ${msg.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    {msg.sender === 'user' && <Avatar className="h-8 w-8 shrink-0"><AvatarFallback><User size={18}/></AvatarFallback></Avatar>}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-end gap-2">
                    <Avatar className="h-8 w-8"><AvatarFallback><Bot size={18} className="text-primary"/></AvatarFallback></Avatar>
                    <div className="max-w-[70%] p-3 rounded-lg shadow bg-secondary text-secondary-foreground rounded-bl-none">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t p-2 sm:p-4">
            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
              <Input type="text" placeholder={isLoading ? "Thinking..." : "Share how you're feeling..."} value={inputValue || ''} onChange={e => setInputValue(e.target.value)} className="flex-grow" disabled={isLoading} aria-label="Your message" />
              <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon" aria-label="Send message">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </CardFooter>
        </div>
      </Card>
    </div>
  );
}

export function MentalHealthJournalScreen({ journalEntries, onAddEntry }: { journalEntries: JournalEntry[]; onAddEntry: (text: string) => void }) {
  const router = useRouter();
  return (
    <div className="w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl flex flex-col h-[80vh]">
        <div className="px-6 pt-6">
          <div className="flex justify-end mb-4">
            <button
              className="px-5 py-2 rounded-full font-semibold shadow-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-150"
              onClick={() => router.push('/mental-health-companion/chat')}
            >
              Back to Chat
            </button>
          </div>
          <JournalSection journalEntries={journalEntries} onAddEntry={onAddEntry} />
        </div>
      </Card>
    </div>
  );
}
