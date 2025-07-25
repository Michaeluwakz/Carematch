
import { db } from '@/lib/firebase/config';
import type { EscalationRequest } from '@/lib/types';
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  FirestoreError,
  getDocs
} from 'firebase/firestore';
import { getUserProfile } from './user-service'; // To fetch user's email/name

const escalationsCollection = collection(db, 'escalationRequests');

// Define the type for data specifically passed to this function
// It can be a subset or include all fields of EscalationRequest, minus id, timestamps, etc.
interface RequestEscalationData {
  notes?: string;
  contactPreference?: 'phone' | 'email' | 'video';
  chatHistory?: Array<{ sender: string; text: string; timestamp: string }>;
  symptomsDescription?: string;
  aiAnalysisSummary?: string;
  aiUrgencyAssessment?: string;
  aiReasoning?: string;
  source?: 'HealthAssistant' | 'SymptomChecker' | 'Other';
}


/**
 * Creates a new escalation request in Firestore.
 */
export async function requestEscalation(userId: string, data: RequestEscalationData): Promise<string> {
  if (!userId) throw new Error("User ID is required to request escalation.");

  try {
    // Fetch user profile to get name/email and other profile details
    const userProfile = await getUserProfile(userId);

    const escalationDoc: Omit<EscalationRequest, 'id' | 'requestTimestamp' | 'updatedAt'> = {
      userId,
      userName: userProfile?.preferredName || userProfile?.email?.split('@')[0] || 'N/A',
      userEmail: userProfile?.email || 'N/A',
      status: 'pending',
      ...data, // Spread the provided data from the source (e.g., Symptom Checker)
      // Add patient profile snapshot fields
      patientAge: userProfile?.age,
      patientGenderIdentity: userProfile?.genderIdentity,
      patientWeight: userProfile?.weight,
      patientKnownDiseases: userProfile?.knownDiseases,
      patientAllergies: userProfile?.allergies,
      patientCurrentMedications: userProfile?.currentMedications,
    };

    const docRef = await addDoc(escalationsCollection, {
      ...escalationDoc,
      requestTimestamp: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("Escalation request created successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating escalation request:", error);
    if (error instanceof FirestoreError) {
      throw new Error(`Could not save escalation request: Firestore error (${error.code}) - ${error.message}`);
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while saving the escalation request.";
    throw new Error(`Could not save escalation request to the database. ${errorMessage}`);
  }
}

/**
 * Fetches all escalation requests from Firestore.
 */
export async function getAllEscalationRequests(): Promise<EscalationRequest[]> {
  const snapshot = await getDocs(escalationsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as EscalationRequest[];
}

/**
 * Logs when the AI references escalation metrics in its response.
 * @param userId The user ID (if available)
 * @param metrics The escalation metrics object: { total, pending, avgResolutionTime }
 * @param context Optional context or message
 */
export function logEscalationMetricsReference(userId: string | null, metrics: { total: number; pending: number; avgResolutionTime: number }, context?: string) {
  const logEntry = {
    userId: userId || 'anonymous',
    metrics,
    context: context || '',
    timestamp: new Date().toISOString(),
  };
  // For now, just log to the console. Replace with Firestore or analytics as needed.
  console.log('[EscalationMetricsReference]', logEntry);
}

// Future functions could include:
// - getEscalationRequestById(id: string)
// - updateEscalationRequestStatus(id: string, status: EscalationRequest['status'])
// - getEscalationRequestsForUser(userId: string)
// - getAllPendingEscalationRequests (for an admin dashboard)

