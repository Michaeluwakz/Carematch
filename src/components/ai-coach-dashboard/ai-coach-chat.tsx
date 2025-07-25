"use client";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, User, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatAiResponseWithSpacing } from '@/lib/utils';
import { usePlanner } from '@/contexts/planner-context';
import { getUserProfile } from '@/services/user-service';
import { useAuth } from '@/hooks/use-auth';

const initialMessages = [
  { id: 'ai-greeting', sender: 'ai', text: "Hi! I'm your AI Coach.", timestamp: new Date() }
];

export default function AiCoachChat() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { addSuggestion, acceptSuggestion } = usePlanner();
  const [pendingType, setPendingType] = useState<null | 'meal' | 'workout'>(null);
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<any>(null);

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
    if (chatEndRef.current) {
      chatEndRef.current.scrollTop = 0;
    }
  }, [messages]);

  // Smarter health-related detection
  const healthIntentPattern = /(health|\bsymptom\b|\bdoctor\b|\bpain\b|\bhelp\b|\badvice\b|\bmedication\b|\btreatment\b|\bcondition\b|\ballergy\b|\bdisease\b|\bdiagnosis\b|\bblood pressure\b|\bheart rate\b|\bweight\b|\bexercise\b|\bdiet\b|\bnutrition\b|\bsleep\b|\bstress\b|\bappointment\b|\bclinic\b|\bhospital\b|\bemergency\b|\binjury\b|\billness\b|\bsick\b|\bwellness\b|\btherapy\b|\bmental\b|\banxiety\b|\bdepression\b|\bmeds\b|\bpill\b|\btablet\b|\bdose\b|\bside effect\b|\bvaccine\b|\bimmunization\b|\blab\b|\btest\b|\bresult\b|\bsurgery\b|\bprocedure\b|\bspecialist\b|\breferral\b|\bconsult\b|\bcheckup\b|\bscreening\b|\bmonitor\b|\btrack\b|\blog\b|\brecord\b|i feel|i have|i am experiencing|i'm experiencing|what should i do|can you help|is it safe|do you recommend|should i|do i need|how can i|what can i do|what do you suggest|what's wrong|what is wrong|my symptoms|my condition|my health|i'm worried|i am worried|i'm concerned|i am concerned|i'm not feeling well|i am not feeling well|i'm sick|i am sick|i'm in pain|i am in pain|i'm hurt|i am hurt|i'm injured|i am injured|i'm anxious|i am anxious|i'm depressed|i am depressed|i'm stressed|i am stressed)/i;

  const send = async () => {
    if (!input.trim()) return;
    // Expanded natural language for yes/no
    const yesPattern = /^\s*(yes|yep|sure|please|ok|yeah|add|do it|absolutely|of course|go ahead|sounds good|why not|let's do it|alright|affirmative)\s*$/i;
    const noPattern = /^\s*(no|not now|maybe later|skip|don't|do not|nope|nah|not today|cancel|decline)\s*$/i;
    if (pendingType) {
      if (yesPattern.test(input)) {
        acceptSuggestion(pendingType);
        setMessages(msgs => [...msgs, { id: `user-${Date.now()}`, sender: 'user', text: input, timestamp: new Date() }, { id: `ai-confirm-${Date.now()}`, sender: 'ai', text: `Great! I've added this ${pendingType === 'meal' ? 'meal' : 'exercise'} to your planner.`, timestamp: new Date() }]);
        setPendingType(null);
        setInput("");
        return;
      } else if (noPattern.test(input)) {
        setMessages(msgs => [...msgs, { id: `user-${Date.now()}`, sender: 'user', text: input, timestamp: new Date() }, { id: `ai-decline-${Date.now()}`, sender: 'ai', text: `No problem! I won't add it to your planner. Let me know if you change your mind.`, timestamp: new Date() }]);
        setPendingType(null);
        setInput("");
        return;
      }
    }
    setMessages(msgs => [...msgs, { id: `user-${Date.now()}`, sender: 'user', text: input, timestamp: new Date() }]);
    setInput("");
    // Health-related keyword detection
    const includeProfile = healthIntentPattern.test(input);
    let aiRequestBody: any = { message: input };
    if (includeProfile && userProfile) {
      aiRequestBody.userProfile = userProfile;
    }
    try {
      const aiResponse = await fetch('/api/ai-coach-deepseek', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiRequestBody),
      });
      if (!aiResponse.ok) throw aiResponse;
      const data = await aiResponse.json();
      const aiText = data.reply;
      // Simple parsing for demo: look for food or exercise keywords
      const mealMatch = aiText.match(/(?:eat|meal|salad|chicken|tofu|omelette|bowl|lunch|dinner|breakfast)[:\-]?\s*([A-Za-z0-9\s\-\(\)]+?)([.!?\n]|$)/i);
      if (mealMatch) {
        addSuggestion('meal', mealMatch[1].trim());
        setMessages(msgs => [...msgs, { id: `ai-${Date.now()}`, sender: "ai", text: aiText, timestamp: new Date() }, { id: `ai-followup-${Date.now()}`, sender: 'ai', text: `Would you like me to add this meal to your planner?`, timestamp: new Date() }]);
        setPendingType('meal');
        return;
      }
      const workoutMatch = aiText.match(/(?:workout|exercise|squats|pushups|yoga|run|deadlifts|routine)[:\-]?\s*([A-Za-z0-9\s\-\(\)]+?)([.!?\n]|$)/i);
      if (workoutMatch) {
        addSuggestion('workout', workoutMatch[1].trim());
        setMessages(msgs => [...msgs, { id: `ai-${Date.now()}`, sender: "ai", text: aiText, timestamp: new Date() }, { id: `ai-followup-${Date.now()}`, sender: 'ai', text: `Would you like me to add this exercise to your planner?`, timestamp: new Date() }]);
        setPendingType('workout');
        return;
      }
      setMessages(msgs => [...msgs, { id: `ai-${Date.now()}`, sender: "ai", text: aiText, timestamp: new Date() }]);
      setPendingType(null);
    } catch (err) {
      setMessages(msgs => [...msgs, { id: `ai-error-${Date.now()}`, sender: "ai", text: "The AI is currently overloaded or unavailable. Please try again in a few minutes. 🙏", timestamp: new Date() }]);
      setPendingType(null);
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-gray-900/80 shadow-lg border-0 max-w-2xl mx-auto w-full">
      <CardContent className="py-6 flex flex-col gap-4 min-h-[350px] sm:min-h-[400px] md:min-h-[450px]">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-pink-500" />
            <span className="text-lg font-bold text-pink-700">AI Coach Chat</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 overflow-x-auto">
          {messages.map((msg, idx) => (
            <div key={msg.id} className={`flex ${msg.sender === "ai" ? "justify-start" : "justify-end"}`}>
              <div className={`flex items-center gap-2 max-w-xs px-4 py-2 rounded-2xl shadow ${msg.sender === "ai" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100" : "bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100"}`}>
                {msg.sender === "ai" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                {msg.sender === 'ai' ? (
                  <p className="text-sm whitespace-pre-wrap">{formatAiResponseWithSpacing(msg.text)}</p>
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div className="flex gap-2 mt-2">
          <input
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && send()}
          />
          <Button onClick={send} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white">Send</Button>
        </div>
      </CardContent>
    </Card>
  );
} 