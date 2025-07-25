
"use client";

import { useState, useEffect, useRef, type FormEvent, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { aiHealthAssistant, aiHealthAssistantDeepSeek, type AiHealthAssistantInput, type AiHealthAssistantOutput } from '@/ai/flows/ai-health-assistant';
import { addNotification } from '@/services/notification-service'; 
import { useAuth } from '@/hooks/use-auth'; 
import { requestEscalation, getAllEscalationRequests, logEscalationMetricsReference } from '@/services/escalation-service';
import { Loader2, Send, User, Bot, Mic, Zap, LifeBuoy, MessageCircleQuestion, Languages, ExternalLink } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { Timestamp } from 'firebase/firestore';
import { useSearchParams, useRouter } from 'next/navigation';
import { getUserProfile } from '@/services/user-service';
import { calculateHealthScore, getRiskFlag, getAIRecommendations } from '@/app/health-profile/page';
import {
  calculateTrend, calculateGoalProgress, calculateStreak,
  getUpcomingScreenings, getMedicationAdherence, getChronicConditionRisk,
  getDietQualityScore, getHydrationStatus, getStressLevel,
  getLonelinessStatus, getEnvironmentalRisk, getVaccinationStatus, getUpcomingPreventiveReminders,
  getRecentActionPlans, getMotivationalFeedback, getMoodPattern, getBurnoutRisk,
  getAppEngagement, getRecommendationFollowRate
} from '@/lib/analytics';
import { formatAiResponseWithSpacing } from '@/lib/utils';
import { serializeTimestamps } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Image as ImageIcon, Stethoscope } from 'lucide-react';
import React from 'react';
import { allHealthcareCentres, HealthcareCentre } from '@/data/healthcare-centres';


interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  appointmentOffer?: AiHealthAssistantOutput['appointmentOffer'];
  bookingConfirmation?: string;
  reminderConfirmation?: string;
  clarifyingQuestions?: string[];
  resourceLinks?: { title: string; url: string }[];
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

function HealthAssistantChatInternal() {
  const { user } = useAuth(); 
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [model, setModel] = useState<'gemini' | 'deepseek'>('gemini');
  
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any | null>(null);
  
  const { toast } = useToast();
  const [isEscalating, setIsEscalating] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Escalation metrics state
  const [escalationMetrics, setEscalationMetrics] = useState({
    total: 0,
    avgResolutionTime: 0,
    pending: 0,
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  const [isOffline, setIsOffline] = useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [symptomInput, setSymptomInput] = useState('');
  const [symptomImage, setSymptomImage] = useState<File | null>(null);
  const [symptomResults, setSymptomResults] = useState<any>(null);
  const [symptomLoading, setSymptomLoading] = useState(false);
  const [symptomError, setSymptomError] = useState<string | null>(null);


  useEffect(() => {
    const initialAiMessage: Message = {
      id: 'initial-ai-message',
      sender: 'ai',
      text: "Hello! I'm your Autonomous AI Health Companion. I can help answer your health questions, understand medical documents, assist with finding care or booking appointments, and more, all in your preferred language. How can I assist you today?",
      timestamp: new Date(),
    };
    
    const checkInMessage = searchParams?.get('checkInMessage');
    if (checkInMessage) {
        const aiCheckIn: Message = {
            id: `ai-check-in-${Date.now()}`,
            sender: 'ai',
            text: decodeURIComponent(checkInMessage ?? ''),
            timestamp: new Date(),
        };
        setMessages([initialAiMessage, aiCheckIn]);
        const newUrl = window.location.pathname;
        router.replace(newUrl, { scroll: false });
    } else {
        setMessages([initialAiMessage]);
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev ? `${prev} ${transcript}` : transcript);
      };
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        toast({ title: "Voice Input Error", description: `Recognition failed: ${event.error}`, variant: "destructive" });
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }

  }, [toast, searchParams, router]);

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
    if (recognitionRef.current) {
      let bcp47lang = language.toLowerCase();
      if (language === 'English') bcp47lang = 'en-US';
      else if (language === 'Spanish') bcp47lang = 'es-ES';
      else if (language === 'French') bcp47lang = 'fr-FR';
      else if (language === 'Hindi') bcp47lang = 'hi-IN';
      else if (language === 'Swahili') bcp47lang = 'sw-KE';
      recognitionRef.current.lang = bcp47lang;
    }
  }, [language]);

  useEffect(() => {
    async function fetchEscalationMetrics() {
      try {
        const escalations = await getAllEscalationRequests();
        const total = escalations.length;
        const pending = escalations.filter(e => e.status === 'pending').length;
        const resolved = escalations.filter(e => e.status === 'resolved');
        let avgResolutionTime = 0;
        if (resolved.length > 0) {
          const totalTime = resolved.reduce((sum, e) => {
            if (e.requestTimestamp && e.updatedAt) {
              const start = e.requestTimestamp.seconds * 1000;
              const end = e.updatedAt.seconds * 1000;
              return sum + (end - start);
            }
            return sum;
          }, 0);
          avgResolutionTime = totalTime / resolved.length;
        }
        setEscalationMetrics({
          total,
          avgResolutionTime,
          pending,
        });
      } catch (err) {
        // Optionally handle error
      }
    }
    fetchEscalationMetrics();
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const stored = localStorage.getItem('lowPowerMode');
    setLowPower((stored ?? 'false') === 'true');
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: inputValue,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    const currentQuery = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      let userProfile = undefined;
      let userAnalytics = undefined;
      if (user && user.uid) {
        const fetchedProfile = await getUserProfile(user.uid);
        if (fetchedProfile) {
          userProfile = serializeTimestamps(fetchedProfile);
          // Compute analytics
          const healthScore = calculateHealthScore(fetchedProfile);
          const riskFlag = getRiskFlag(fetchedProfile);
          const aiRecs = typeof getAIRecommendations === 'function' ? getAIRecommendations(fetchedProfile) : [];
          // --- Trends ---
          const weightTrend = calculateTrend(fetchedProfile.biometrics?.weight || []);
          const heartRateTrend = calculateTrend(fetchedProfile.biometrics?.heartRate || []);
          const sleepTrend = calculateTrend(fetchedProfile.biometrics?.sleepHours || []);
          const stepsTrend = calculateTrend(fetchedProfile.biometrics?.steps || []);

          // --- Goal Progress ---
          const weightGoal = fetchedProfile.goals?.weight;
          const currentWeight = fetchedProfile.biometrics?.weight?.slice(-1)[0]?.value;
          const weightProgress = weightGoal && currentWeight ? calculateGoalProgress(currentWeight, weightGoal) : null;

          const stepGoal = fetchedProfile.goals?.steps;
          const stepData = (fetchedProfile.biometrics?.steps || []).map(d => typeof d === 'number' ? d : d.value);
          const stepStreak = stepGoal ? calculateStreak(stepData, stepGoal) : 0;
          const stepProgress = stepGoal && stepData.length > 0 ? calculateGoalProgress(stepData[stepData.length - 1], stepGoal) : null;

          userAnalytics = {
            healthScore,
            riskFlag,
            aiRecommendations: aiRecs,
            trends: {
              weight: weightTrend,
              heartRate: heartRateTrend,
              sleep: sleepTrend,
              steps: stepsTrend,
            },
            goalProgress: {
              weight: weightProgress,
              steps: { streak: stepStreak, ...stepProgress },
            },
            riskAlerts: {
              upcomingScreenings: getUpcomingScreenings(fetchedProfile.screenings || []),
              medicationAdherence: getMedicationAdherence(fetchedProfile.medications || []),
              chronicConditionRisks: getChronicConditionRisk(fetchedProfile),
            },
            lifestyle: {
              dietQualityScore: getDietQualityScore(fetchedProfile),
              hydration: getHydrationStatus(fetchedProfile.hydration || []),
              stressLevel: getStressLevel(fetchedProfile.stressLevel || []),
            },
            social: {
              loneliness: getLonelinessStatus(fetchedProfile.socialSupport || []),
              environmentalRisk: getEnvironmentalRisk(fetchedProfile.environmentalRisks || []),
            },
            preventive: {
              vaccination: getVaccinationStatus(fetchedProfile.immunizationRecords || [], ['Influenza', 'COVID-19', 'Tetanus', 'Hepatitis B']),
              reminders: getUpcomingPreventiveReminders(fetchedProfile.preventiveReminders || []),
            },
            actionPlans: getRecentActionPlans(fetchedProfile.aiActionPlans || []),
            motivationalFeedback: getMotivationalFeedback(userAnalytics),
            mentalHealth: {
              moodPattern: getMoodPattern(fetchedProfile.moodLog || []),
              burnoutRisk: getBurnoutRisk(fetchedProfile.burnoutRisk || []),
            },
            engagement: {
              appEngagement: getAppEngagement(fetchedProfile.appUsage || []),
              recommendationFollowRate: getRecommendationFollowRate(fetchedProfile.recommendationResponses || []),
            },
          };
        }
      }
      let aiInput: any = { query: currentQuery, language };
      if (userProfile) {
        aiInput.userProfile = userProfile;
        aiInput.userAnalytics = userAnalytics;
      }
      aiInput.escalationMetrics = escalationMetrics;
      let result: AiHealthAssistantOutput;
      if (model === 'gemini') {
        result = await aiHealthAssistant(aiInput);
      } else {
        result = await aiHealthAssistantDeepSeek(aiInput);
      }
      
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.response,
        timestamp: new Date(),
        appointmentOffer: result.appointmentOffer,
        bookingConfirmation: result.bookingConfirmation,
        reminderConfirmation: result.reminderConfirmation,
        clarifyingQuestions: result.clarifyingQuestions,
        resourceLinks: result.resourceLinks,
      };
      setMessages(prev => [...prev, aiMessage]);

      // Log if AI referenced escalation metrics
      if (
        result.response &&
        (
          result.response.includes('Escalated Cases') ||
          result.response.includes('Pending Escalations') ||
          result.response.includes('Avg. Resolution Time')
        )
      ) {
        logEscalationMetricsReference(user ? user.uid : null, escalationMetrics, 'AI referenced escalation metrics in response');
      }

      // Handle Notifications and Toasts
      const bookingMsg = result.bookingConfirmation === null ? undefined : result.bookingConfirmation;
      const reminderMsg = result.reminderConfirmation === null ? undefined : result.reminderConfirmation;
      if (bookingMsg && user) {
        addNotification(user.uid, { title: "Appointment Update", message: bookingMsg, type: 'appointment' }).catch(e => console.error(e));
      }
      if (reminderMsg && user) {
        addNotification(user.uid, { title: "Reminder Update", message: reminderMsg, type: 'reminder', linkTo: '/reminders' }).catch(e => console.error(e));
      }
      if (result.emergencyDetected && result.emergencyAdvice) {
        toast({ title: "Potential Emergency Detected", description: result.emergencyAdvice, variant: "destructive", duration: 10000 });
        if (result.informationSummaryForEmergency) {
          toast({ title: "Summary for Emergency Services", description: result.informationSummaryForEmergency, variant: "default", duration: 15000 });
        }
      }
      if (result.followUp && user) {
        const { delayHours, checkInMessage } = result.followUp;
        const now = new Date();
        // The notification is "created" in the future from a user perspective.
        // We'll use Firestore's serverTimestamp for the actual creation time.
        const expiresAt = new Date(now.getTime() + (delayHours + 24) * 60 * 60 * 1000); // Expires 24h after it's meant to be seen
        
        // This is a simplified client-side delay for demonstration.
        // A robust solution would use a server-side scheduler (e.g., Cloud Functions).
        setTimeout(() => {
            if (!user) return;
            const notification: any = {
                title: "A Check-in from Your AI Companion",
                message: checkInMessage,
                type: 'check-in',
            };
            if (checkInMessage) {
                notification.linkTo = `/health-assistant?checkInMessage=${encodeURIComponent(checkInMessage)}`;
            }
            if (expiresAt instanceof Date) {
                notification.expiresAt = Timestamp.fromDate(expiresAt);
            }
            addNotification(user.uid, notification).catch(e => console.error("Failed to schedule check-in notification", e));
        }, delayHours * 60 * 60 * 1000);

        toast({
            title: "Check-in Scheduled",
            description: `I'll check in with you in about ${delayHours} hours.`,
        });
      }

      // After receiving the AI response (result), check severity before suggesting a centre
      const aiText = result?.text?.toLowerCase() || '';
      const severeKeywords = [
        'severe', 'emergency', 'urgent', 'critical', 'hospitalize',
        'see a doctor', 'visit a hospital', 'seek immediate care', 'life-threatening', 'dangerous', 'immediately', 'admit', 'specialist', 'consult', 'refer', 'medical attention', 'high risk', 'serious', 'worsening', 'unresponsive', 'collapse', 'bleeding', 'chest pain', 'difficulty breathing', 'loss of consciousness', 'stroke', 'heart attack', 'sepsis', 'infection', 'uncontrolled', 'acute', 'hospital', 'doctor', 'clinic', 'practitioner'
      ];
      const isSevere = severeKeywords.some(k => aiText.includes(k));
      const directRequestKeywords = [
        'what clinic', 'what hospital', 'what healthcare practitioner', 'suggest me for', 'recommend a clinic', 'recommend a hospital', 'recommend a practitioner', 'which hospital', 'which clinic', 'which practitioner', 'where can i go for', 'where should i go for', 'can you suggest', 'can you recommend'
      ];
      const userQueryLower = String(currentQuery).toLowerCase();
      const isDirectRequest = directRequestKeywords.some(k => userQueryLower.includes(k));
      if (isSevere || isDirectRequest) {
        // Suggest a healthcare centre based on illness, location, and specialty
        let userLocation = '';
        if (userProfile) {
          const address = userProfile.address ?? '';
          const state = userProfile.state ?? '';
          userLocation = String(address) + String(state);
        }
        let userIllness = String(currentQuery).toLowerCase();
        const illnessKeywords = [
          { keyword: 'eye', specialty: 'Eye' },
          { keyword: 'psychiatr', specialty: 'Neuro-Psychiatric' },
          { keyword: 'orthop', specialty: 'Orthopaedic' },
          { keyword: 'fistula', specialty: 'Obstetric Fistula' },
          { keyword: 'ear', specialty: 'Ear' },
          { keyword: 'cancer', specialty: 'Oncology' },
          { keyword: 'maternity', specialty: 'Maternity' },
          { keyword: 'teaching', specialty: 'Teaching Hospital' },
        ];
        let matchedSpecialty = illnessKeywords.find(k => userIllness.includes(k.keyword));
        let filteredCentres = allHealthcareCentres;
        if (matchedSpecialty) {
          filteredCentres = filteredCentres.filter(c => c.services.some(s => s.toLowerCase().includes(matchedSpecialty.specialty.toLowerCase())) || c.category.toLowerCase().includes(matchedSpecialty.specialty.toLowerCase()));
        }
        if (userLocation) {
          filteredCentres = filteredCentres.filter(c => c.address.toLowerCase().includes(userLocation.toLowerCase()));
        }
        if (filteredCentres.length === 0 && matchedSpecialty) {
          filteredCentres = allHealthcareCentres.filter(c => c.services.some(s => s.toLowerCase().includes(matchedSpecialty.specialty.toLowerCase())) || c.category.toLowerCase().includes(matchedSpecialty.specialty.toLowerCase()));
        }
        const suggestedCentre = filteredCentres[0];
        if (suggestedCentre) {
          const suggestionMessage: Message = {
            id: `ai-suggestion-${Date.now()}`,
            sender: 'ai',
            text: `Based on your symptoms, you may want to visit: <b>${suggestedCentre.name}</b><br/>${suggestedCentre.address}<br/>Category: ${suggestedCentre.category}<br/><a href='/centres'>View in Directory</a>`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, suggestionMessage]);
        }
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({ title: "Voice Input Not Supported", description: "Your browser does not support voice input.", variant: "destructive" });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleRequestEscalation = async () => {
    if (!user) {
      toast({ title: "Authentication Required", description: <p>Please <Link href="/login" className="underline">log in</Link> or <Link href="/signup" className="underline">sign up</Link> to request assistance.</p>, variant: "destructive" });
      return;
    }
    setIsEscalating(true);
    try {
      const chatHistoryForEscalation = messages.slice(-10).map(m => ({ sender: m.sender, text: m.text, timestamp: m.timestamp.toISOString() }));
      await requestEscalation(user.uid, { chatHistory: chatHistoryForEscalation, notes: "Escalation from AI Health Companion.", source: "HealthAssistant" });
      toast({ title: "Request Submitted", description: "A care provider will contact you shortly." });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ title: "Escalation Failed", description: `Could not submit request: ${errorMessage}`, variant: "destructive" });
    } finally {
      setIsEscalating(false);
    }
  };

  // Symptom Checker Handler
  const handleSymptomCheck = async () => {
    setSymptomLoading(true);
    setSymptomResults(null);
    setSymptomError(null);
    try {
      let imageDataUri = null;
      if (symptomImage) {
        imageDataUri = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(symptomImage);
        });
      }
      let aiInput: any = {
        query: `User symptoms: ${symptomInput}${symptomImage ? ' [Image attached]' : ''}.

Please act as a symptom checker. Cross-reference with trusted medical databases (e.g., Mayo Clinic, PubMed).

If an image is attached, analyze it for visible symptoms (e.g., rashes, wounds, swelling, discoloration, etc.) and include your findings in the possible outcomes.

For your response:
- Use clear, concise paragraphs (2–3 sentences each) with extra blank lines between them.
- Use only numbers for bullet points (no asterisks, no <b> tags, no markdown or HTML formatting).
- Avoid all markdown and HTML formatting.
- Use a professional, friendly, and engaging tone.
- For each possible outcome, present:
  1. A well-written explanation
  2. The likelihood as a percentage
  3. The urgency level (high, mid, low)
  4. The rate and percentage of its severeness
- Separate each outcome with extra blank lines for readability.
- Do NOT give a definitive diagnosis.

Format your answer as if you are the AI health companion chatbot, with excellent paragraphing, spacing, and numbered bullet points only.`,
        language
      };
      if (userProfile) aiInput.userProfile = userProfile;
      aiInput.escalationMetrics = escalationMetrics;
      if (imageDataUri) aiInput.symptomImageDataUri = imageDataUri;
      // Only use Gemini for the symptom checker
      const geminiResult = await aiHealthAssistant(aiInput);
      setSymptomResults({ gemini: geminiResult });
    } catch (err: any) {
      setSymptomError('Sorry, there was a problem running the symptom checker.');
    } finally {
      setSymptomLoading(false);
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
    <Card className="w-full max-w-4xl mx-auto shadow-2xl flex flex-col h-[70vh]">
      {(isOffline || lowPower) && (
        <div className="w-full bg-yellow-100 text-yellow-800 text-center py-2 text-sm font-medium border-b border-yellow-300">
          {isOffline ? 'Offline Mode: AI features are limited. You can view past conversations and resources.' : 'Low Power Mode: AI features are limited to save battery and data.'}
        </div>
      )}
      <CardHeader
        className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-blue-100 flex flex-row items-center justify-between gap-4 shadow-sm"
        style={{ borderTopLeftRadius: '1.25rem', borderTopRightRadius: '1.25rem' }}
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-blue-100 p-2">
            <Zap className="h-6 w-6 text-primary" />
          </span>
          <span className="text-xl font-bold text-primary">AI Health Companion</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSymptomChecker(true)}
            className="border-primary text-primary hover:bg-primary/10 flex items-center gap-1"
            title="AI-Powered Symptom Checker"
          >
            <Stethoscope className="h-4 w-4" />
            Symptom Checker
          </Button>
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleRequestEscalation}
            disabled={isEscalating || !user}
            className="border-primary text-primary hover:bg-primary/10"
            title="Request to connect with a human care provider"
          >
            {isEscalating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LifeBuoy className="mr-2 h-4 w-4" />}
            Request Assistance
          </Button>
        </div>
      </CardHeader>
      {/* Escalation Metrics Section (moved to top) */}
      <div className="w-full px-6 py-3 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-blue-700">{escalationMetrics.total}</span>
          <span className="text-xs text-gray-600">Total Escalated Cases</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-yellow-700">{escalationMetrics.pending}</span>
          <span className="text-xs text-gray-600">Pending Escalations</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold text-green-700">{escalationMetrics.avgResolutionTime > 0 ? `${Math.round(escalationMetrics.avgResolutionTime / 60000)} min` : 'N/A'}</span>
          <span className="text-xs text-gray-600">Avg. Resolution Time</span>
        </div>
      </div>
      <CardContent className="flex-grow p-0 overflow-hidden">
        <ScrollArea className="h-full p-4" style={{ maxHeight: '60vh', overflowY: 'auto' }} ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                {msg.sender === 'ai' && <Avatar className="h-8 w-8 shrink-0"><AvatarFallback><Zap size={18} className="text-primary"/></AvatarFallback></Avatar>}
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
                    {msg.sender === 'ai' && msg.bookingConfirmation && (
                      <div className="mt-2 text-xs text-blue-700 font-medium">{msg.bookingConfirmation ?? ''}</div>
                    )}
                    {msg.sender === 'ai' && msg.reminderConfirmation && (
                      <div className="mt-2 text-xs text-green-700 font-medium">{msg.reminderConfirmation ?? ''}</div>
                    )}
                    {msg.sender === 'ai' && msg.clarifyingQuestions && msg.clarifyingQuestions.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-muted-foreground/20">
                        <p className="text-xs font-medium mb-1.5 flex items-center gap-1"><MessageCircleQuestion size={14} className="text-primary" /> To help me understand better:</p>
                        <ul className="list-disc list-inside text-xs space-y-1">{msg.clarifyingQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
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
                <Avatar className="h-8 w-8"><AvatarFallback><Zap size={18} className="text-primary"/></AvatarFallback></Avatar>
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
          <Button variant="outline" size="icon" type="button" onClick={handleVoiceInput} aria-label={isListening ? "Stop voice input" : "Start voice input"} title={isListening ? "Stop voice input" : "Start voice input"} className={isListening ? 'text-destructive animate-pulse' : ''}>
            <Mic className="h-5 w-5" />
          </Button>
          
          <div className="w-40 hidden sm:block">
            <Select value={language || ''} onValueChange={setLanguage}>
              <SelectTrigger id="language-select-desktop" aria-label="Select language"><div className="flex items-center gap-1"><Languages size={14} /><span className="truncate">{language || ''}</span></div></SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem><SelectItem value="Spanish">Español</SelectItem><SelectItem value="French">Français</SelectItem><SelectItem value="Hindi">हिन्दी</SelectItem><SelectItem value="Swahili">Kiswahili</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Input type="text" placeholder={isListening ? "Listening..." : (isOffline || lowPower ? "AI disabled in offline/low power mode" : "Type your health question...")} value={inputValue || ''} onChange={e => setInputValue(e.target.value)} className="flex-grow" disabled={isLoading || isListening || isOffline || lowPower} aria-label="Health question input" />
          <Button type="submit" disabled={isLoading || !inputValue.trim() || isOffline || lowPower} size="icon" aria-label="Send message">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
      <Dialog open={showSymptomChecker} onOpenChange={setShowSymptomChecker}>
        <DialogContent
          style={{
            width: '700px',
            height: '500px',
            maxWidth: '95vw',
            maxHeight: '95vh',
            margin: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #e0ffe7 0%, #f0f9ff 100%)',
            borderRadius: '2rem',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
            fontFamily: 'Inter, system-ui, sans-serif',
            overflow: 'hidden',
            border: 'none',
          }}
        >
          <DialogHeader>
            <DialogTitle style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '0.02em', color: '#0f5132' }}>
              <span role="img" aria-label="stethoscope">🩺</span> AI-Powered Symptom Checker
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 w-full overflow-y-auto" style={{ maxHeight: '400px', padding: '0 0.5rem' }}>
            {/* Symptom input UI */}
            <form onSubmit={e => { e.preventDefault(); handleSymptomCheck(); }} className="flex flex-col sm:flex-row items-center gap-3 mb-4 w-full">
              <Input
                type="text"
                placeholder="Describe your symptoms (e.g., sore throat, fever, cough)"
                value={symptomInput || ''}
                onChange={e => setSymptomInput(e.target.value)}
                disabled={symptomLoading}
                className="flex-1 rounded-2xl px-4 py-3 text-lg border-2 border-green-200 focus:border-green-400 shadow-sm bg-white/70"
                style={{ minWidth: 0 }}
                aria-label="Symptom description"
              />
              <label className="flex items-center gap-2 text-sm cursor-pointer px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition font-medium shadow-sm">
                <ImageIcon className="h-5 w-5 text-blue-500" />
                <span>Attach Image</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => setSymptomImage(e.target.files?.[0] || null)}
                  disabled={symptomLoading}
                  aria-label="Attach image"
                />
                {symptomImage && <span className="ml-2 text-green-700 text-xs truncate max-w-[100px]">{symptomImage.name}</span>}
              </label>
              <Button
                type="submit"
                disabled={!symptomInput.trim() || symptomLoading}
                className="rounded-2xl px-6 py-3 text-lg font-bold bg-gradient-to-r from-green-400 to-blue-400 text-white shadow-md hover:from-green-500 hover:to-blue-500 transition"
                style={{ minWidth: '160px' }}
                aria-label="Check Symptoms"
              >
                {symptomLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Check Symptoms'}
              </Button>
            </form>
            {symptomError && <div className="text-destructive text-sm mb-2 font-semibold">{symptomError}</div>}
            {/* Modern legend with pill backgrounds and icons */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100/80 border border-green-300 text-green-900 text-sm shadow-sm" style={{ fontWeight: 600 }}>
                <span className="text-xl">🟢🙂</span> Mild
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100/80 border border-yellow-300 text-yellow-900 text-sm shadow-sm" style={{ fontWeight: 600 }}>
                <span className="text-xl">🟡😐</span> Severe
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100/80 border border-red-300 text-red-900 text-sm shadow-sm" style={{ fontWeight: 600 }}>
                <span className="text-xl">🔴🚨</span> Urgent
              </span>
            </div>
            {/* Animated, glassmorphic outcome cards */}
            {symptomResults && symptomResults.gemini && (
              (() => {
                const text = symptomResults.gemini.response || '';
                const outcomeRegex = /\n?\s*\d+\.\s+/g;
                const matches = [...text.matchAll(outcomeRegex)];
                if (matches.length > 0) {
                  // Find intro (before first outcome), outcomes, and outro (after last outcome)
                  const firstIdx = matches[0].index || 0;
                  const lastMatch = matches[matches.length - 1];
                  const lastIdx = lastMatch.index || 0;
                  const intro = text.slice(0, firstIdx).trim();
                  const outcomesRaw = text.slice(firstIdx).split(outcomeRegex).filter(Boolean);
                  const outro = outcomesRaw.length > 0 ? outcomesRaw[outcomesRaw.length - 1].match(/\n?\s*\d+\.\s+/) ? '' : outcomesRaw.pop() : '';
                  const outcomes = outcomesRaw;
                  return (
                    <div className="space-y-6">
                      {intro && <div className="text-base whitespace-pre-wrap text-gray-700 font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{intro}</div>}
                      {outcomes.map((part: string, idx: number) => {
                        let color = 'bg-green-100/60 border-green-300';
                        let emoji = '🟢🙂';
                        let badgeBg = '#bbf7d0', badgeBorder = '#22c55e', badgeText = '#065f46';
                        if (/urgent|high|immediate|critical|emergency/i.test(part)) {
                          color = 'bg-red-100/60 border-red-300';
                          emoji = '🔴🚨';
                          badgeBg = '#fecaca'; badgeBorder = '#f87171'; badgeText = '#991b1b';
                        } else if (/severe|mid|moderate|medium/i.test(part)) {
                          color = 'bg-yellow-100/60 border-yellow-300';
                          emoji = '🟡😐';
                          badgeBg = '#fef9c3'; badgeBorder = '#facc15'; badgeText = '#92400e';
                        }
                        const percentMatch = part.match(/(\d{1,3})%/);
                        const percent = percentMatch ? percentMatch[1] : null;
                        return (
                          <div
                            key={idx}
                            className={`relative rounded-2xl border p-5 flex items-center gap-5 shadow-lg backdrop-blur-md transition-all duration-500 animate-fade-in-up ${color}`}
                            style={{ minHeight: '110px', background: 'rgba(255,255,255,0.55)', borderWidth: 2 }}
                            aria-label={`Outcome ${idx + 1}`}
                          >
                            <span className="text-4xl drop-shadow-lg" style={{ flexShrink: 0 }}>{emoji}</span>
                            <div className="flex-1 whitespace-pre-line text-base leading-relaxed" style={{ color: '#222', fontWeight: 500 }}>{part.trim()}</div>
                            {percent && (
                              <span
                                className="ml-2 px-4 py-2 rounded-full text-lg font-extrabold border shadow-md"
                                style={{ background: badgeBg, borderColor: badgeBorder, color: badgeText, borderWidth: 2, letterSpacing: '0.01em' }}
                                aria-label={`Likelihood: ${percent}%`}
                              >
                                {percent}%
                              </span>
                            )}
                            {/* Divider between outcomes */}
                            {idx < outcomes.length - 1 && (
                              <span className="absolute left-1/2 -bottom-4 w-2/3 h-0.5 bg-gradient-to-r from-transparent via-gray-300 to-transparent rounded-full opacity-60" style={{ transform: 'translateX(-50%)' }}></span>
                            )}
                          </div>
                        );
                      })}
                      {outro && <div className="text-base whitespace-pre-wrap text-gray-700 font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{outro}</div>}
                    </div>
                  );
                } else {
                  return <div className="text-base whitespace-pre-wrap text-gray-700 font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>{text}</div>;
                }
              })()
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSymptomChecker(false)} className="w-full" style={{ fontWeight: 700, fontSize: '1.1rem', borderRadius: '1rem', marginTop: '0.5rem' }}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export function HealthAssistantChat() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <HealthAssistantChatInternal />
    </Suspense>
  );
}
