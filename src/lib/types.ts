
import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email?: string | null;
  preferredLanguage?: string;
  age?: number;
  genderIdentity?: string;
  consentDataProcessing?: boolean;
  consentShareAnonymizedDataForResearch?: boolean;
  identityDocumentUrl?: string | null;
  insuranceCardUrl?: string | null;
  onboardingCompleted?: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;

  weight?: number; 
  knownDiseases?: string; 
  allergies?: string; 
  currentMedications?: string; 
  medicalTestReportUrl?: string | null; 

  healthPoints?: number; 
  preferredName?: string; 

  // Health Tracking for Insights
  dietaryHabits?: 'unspecified' | 'balanced' | 'low-carb' | 'vegetarian' | 'vegan' | 'other';
  sleepHours?: number; // average hours per night
  exerciseFrequency?: 'unspecified' | 'never' | '1-2_times_week' | '3-4_times_week' | '5-7_times_week';

  // EHR Fields
  visitSummaries?: VisitSummary[];
  immunizationRecords?: ImmunizationRecord[];
  labResults?: LabResult[];

  // Biometrics for trends (arrays of { value, date })
  biometrics?: {
    weight?: Array<{ value: number, date: string }>;
    heartRate?: Array<{ value: number, date: string }>;
    sleepHours?: Array<{ value: number, date: string }>;
    steps?: Array<{ value: number, date: string }>;
  };

  // User goals
  goals?: {
    weight?: number;
    steps?: number;
    sleepHours?: number;
  };

  // Risk/alert analytics
  screenings?: Array<{ name: string; dueDate: string; completed: boolean }>;
  medications?: Array<{ name: string; schedule: string; lastTaken: string; missedDoses: number }>;
  chronicConditions?: string[];

  // Lifestyle/behavior
  dietQualityScore?: number; // 0-100
  hydration?: Array<{ date: string; amount: number }>;
  stressLevel?: Array<{ date: string; level: 'low' | 'moderate' | 'high' | 'very_high' }>;

  // Social/Environmental
  socialSupport?: Array<{ date: string; feeling: 'supported' | 'neutral' | 'isolated' }>;
  location?: { city?: string; region?: string; country?: string };
  environmentalRisks?: Array<{ date: string; type: string; level: 'low' | 'moderate' | 'high' }>;

  // Preventive Health
  preventiveReminders?: Array<{ name: string; dueDate: string; completed: boolean }>;

  // AI-Generated Recommendations
  aiActionPlans?: Array<{ date: string; plan: string }>;

  // Mental Health Insights
  moodLog?: Array<{ date: string; mood: 'happy' | 'neutral' | 'sad' | 'anxious' | 'angry' | 'stressed' }>;
  burnoutRisk?: Array<{ date: string; risk: 'low' | 'moderate' | 'high' }>;
  // Mental Health Journal
  journalEntries?: Array<{ date: string; text: string }>;

  // Engagement Analytics
  appUsage?: Array<{ date: string; action: string }>;
  recommendationResponses?: Array<{ date: string; recommendation: string; followed: boolean }>;

  [key: string]: any;
}

export type ReminderCategory = "prescription" | "check-up" | "surgery" | "appointment" | "medication" | "other";

export interface Reminder {
  id?: string; 
  userId: string;
  title: string;
  category: ReminderCategory;
  reminderDateTime: Timestamp; 
  notes?: string;
  isDone: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type NotificationType = "reminder" | "appointment" | "update" | "general" | "check-in";

export interface Notification {
  id?: string; 
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  linkTo?: string; 
  createdAt: Timestamp;
  updatedAt: Timestamp;
  expiresAt?: Timestamp; // For temporary notifications
}

export interface EscalationRequest {
  id?: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  requestTimestamp: Timestamp;
  status: 'pending' | 'in-progress' | 'resolved' | 'cancelled';
  notes?: string;
  contactPreference?: 'phone' | 'email' | 'video';
  chatHistory?: Array<{ sender: string; text: string; timestamp: string }>; 
  updatedAt: Timestamp;
  
  symptomsDescription?: string;
  aiAnalysisSummary?: string;
  aiUrgencyAssessment?: string;
  aiReasoning?: string;
  source?: 'HealthAssistant' | 'SymptomChecker' | 'Other'; 

  patientAge?: number;
  patientGenderIdentity?: string;
  patientWeight?: number;
  patientKnownDiseases?: string;
  patientAllergies?: string;
  patientCurrentMedications?: string;
}

// New EHR Data Types
export interface VisitSummary {
  id: string; // Unique ID for the summary
  visitDate: Timestamp;
  clinicName: string;
  doctorName?: string;
  reasonForVisit: string;
  diagnosis?: string;
  treatmentPlan?: string;
  notes?: string;
  createdAt: Timestamp;
  status?: 'draft' | 'completed'; // New field
  source?: 'manual' | 'ai_draft';   // New field
}

export interface ImmunizationRecord {
  id: string; // Unique ID for the record
  vaccineName: string;
  dateAdministered: Timestamp;
  doseNumber?: string; // e.g., "1st", "Booster"
  administeredBy?: string; // Clinic or health worker
  batchNumber?: string;
  createdAt: Timestamp;
}

export interface LabResult {
  id: string; // Unique ID for the result
  testName: string;
  resultDate: Timestamp;
  value?: string;
  units?: string;
  referenceRange?: string;
  interpretation?: string; // Simple note or flag (e.g., "High", "Normal")
  labName?: string;
  filePath?: string; // Path to an uploaded PDF/image if applicable
  createdAt: Timestamp;
}
