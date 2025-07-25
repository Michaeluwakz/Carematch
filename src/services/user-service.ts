
import { db } from '@/lib/firebase/config';
import { doc, setDoc, serverTimestamp, getDoc, FirestoreError, runTransaction, Timestamp, collection } from 'firebase/firestore';
import type { UserProfile, VisitSummary, ImmunizationRecord, LabResult } from '@/lib/types'; 

type UserProfileCreationData = Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'> & {
  createdAt?: any; 
  updatedAt?: any; 
};


export async function saveUserProfile(userId: string, data: UserProfileCreationData) {
  if (!userId) throw new Error("User ID is required to save profile.");

  const userDocRef = doc(db, 'users', userId);
  try {
    const firestoreData: { [key: string]: any } = { ...data };

    Object.keys(firestoreData).forEach(key => {
      if (firestoreData[key] === undefined) {
        delete firestoreData[key];
      }
    });

    firestoreData.updatedAt = serverTimestamp();
    const docSnap = await getDoc(userDocRef);
    if (!docSnap.exists() || !docSnap.data()?.createdAt) {
      firestoreData.createdAt = serverTimestamp();
    }

    if (data.healthPoints === undefined) {
      firestoreData.healthPoints = docSnap.data()?.healthPoints || 0;
    }
    
    // Ensure EHR fields are initialized as arrays if not present
    if (data.visitSummaries === undefined && !(docSnap.data()?.visitSummaries)) {
        firestoreData.visitSummaries = [];
    }
    if (data.immunizationRecords === undefined && !(docSnap.data()?.immunizationRecords)) {
        firestoreData.immunizationRecords = [];
    }
    if (data.labResults === undefined && !(docSnap.data()?.labResults)) {
        firestoreData.labResults = [];
    }


    await setDoc(userDocRef, firestoreData, { merge: true });
    console.log("User profile saved successfully for user:", userId);

  } catch (error) {
    console.error("Error saving user profile:", error);
    let detailedErrorMessage = "An unknown error occurred while saving the profile.";
    if (error instanceof FirestoreError) {
      detailedErrorMessage = `Firestore error (${error.code}): ${error.message}`;
    } else if (error instanceof Error) {
      detailedErrorMessage = error.message;
    }
    throw new Error(`Could not save user profile to database. ${detailedErrorMessage}`);
  }
}

// Add a helper to serialize Firestore Timestamps to ISO strings
function serializeTimestamps(obj: any) {
  if (!obj || typeof obj !== 'object') return obj;
  const out: any = Array.isArray(obj) ? [] : {};
  for (const key in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
    const value = obj[key];
    if (value && typeof value === 'object' && typeof value.toDate === 'function') {
      out[key] = value.toDate().toISOString();
    } else if (Array.isArray(value)) {
      out[key] = value.map(serializeTimestamps);
    } else if (value && typeof value === 'object') {
      out[key] = serializeTimestamps(value);
    } else {
      out[key] = value;
    }
  }
  return out;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!userId) {
    console.warn("User ID is required to get profile.");
    return null;
  }

  const userDocRef = doc(db, 'users', userId);
  try {
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      const profileData = docSnap.data();
      const healthPoints = profileData.healthPoints === undefined ? 0 : profileData.healthPoints;
      // Ensure EHR fields are arrays, defaulting to empty if not present
      const visitSummaries = Array.isArray(profileData.visitSummaries) ? profileData.visitSummaries : [];
      const immunizationRecords = Array.isArray(profileData.immunizationRecords) ? profileData.immunizationRecords : [];
      const labResults = Array.isArray(profileData.labResults) ? profileData.labResults : [];

      const plainProfile = serializeTimestamps({ 
        uid: docSnap.id, 
        ...profileData, 
        healthPoints,
        visitSummaries,
        immunizationRecords,
        labResults
      });
      return plainProfile as UserProfile;
    } else {
      console.log("No such user profile for user:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    let detailedErrorMessage = "An unknown error occurred while fetching the profile.";
     if (error instanceof FirestoreError) {
      detailedErrorMessage = `Firestore error (${error.code}): ${error.message}`;
    } else if (error instanceof Error) {
      detailedErrorMessage = error.message;
    }
    throw new Error(`Could not fetch user profile from database. ${detailedErrorMessage}`);
  }
}


export async function awardHealthPoints(userId: string, pointsToAward: number): Promise<void> {
  if (!userId) throw new Error("User ID is required to award points.");
  if (pointsToAward <= 0) throw new Error("Points to award must be positive.");

  const userDocRef = doc(db, 'users', userId);
  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        transaction.set(userDocRef, {
            healthPoints: pointsToAward,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log(`Created profile and awarded ${pointsToAward} points to user ${userId}`);
      } else {
        const currentPoints = userDoc.data()?.healthPoints || 0;
        const newPoints = currentPoints + pointsToAward;
        transaction.update(userDocRef, { 
            healthPoints: newPoints,
            updatedAt: serverTimestamp(),
        });
        console.log(`Awarded ${pointsToAward} points to user ${userId}. New total: ${newPoints}`);
      }
    });
  } catch (error) {
    console.error(`Error awarding health points to user ${userId}:`, error);
    let detailedErrorMessage = "An unknown error occurred while awarding points.";
    if (error instanceof FirestoreError) {
      detailedErrorMessage = `Firestore error (${error.code}): ${error.message}`;
    } else if (error instanceof Error) {
      detailedErrorMessage = error.message;
    }
    throw new Error(`Could not award points. ${detailedErrorMessage}`);
  }
}

type HealthRecordEntry = VisitSummary | ImmunizationRecord | LabResult;
type HealthRecordType = 'visitSummaries' | 'immunizationRecords' | 'labResults';

// Overloads for type safety
export async function addHealthRecordEntry(
  userId: string,
  recordType: 'visitSummaries',
  entryData: Omit<VisitSummary, 'id' | 'createdAt' | 'visitDate'> & { visitDate?: Date | Timestamp, status?: VisitSummary['status'], source?: VisitSummary['source'] }
): Promise<string>;
export async function addHealthRecordEntry(
  userId: string,
  recordType: 'immunizationRecords',
  entryData: Omit<ImmunizationRecord, 'id' | 'createdAt'>
): Promise<string>;
export async function addHealthRecordEntry(
  userId: string,
  recordType: 'labResults',
  entryData: Omit<LabResult, 'id' | 'createdAt'>
): Promise<string>;

// Implementation
export async function addHealthRecordEntry(
  userId: string,
  recordType: HealthRecordType,
  entryData:
    | (Omit<VisitSummary, 'id' | 'createdAt' | 'visitDate'> & { visitDate?: Date | Timestamp, status?: VisitSummary['status'], source?: VisitSummary['source'] })
    | Omit<ImmunizationRecord, 'id' | 'createdAt'>
    | Omit<LabResult, 'id' | 'createdAt'>
): Promise<string> {
  if (!userId) throw new Error("User ID is required to add a health record.");
  if (!entryData) throw new Error("Entry data is required.");

  const userDocRef = doc(db, 'users', userId);

  try {
    const newEntryId = doc(collection(db, 'users')).id; // Generate a unique ID
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw new Error("User profile does not exist.");
      }
      const profileData = userDoc.data() as UserProfile;
      const existingRecords = (profileData[recordType] as HealthRecordEntry[] | undefined) || [];
      
      let newEntryWithMetadata: any;
      if (recordType === 'visitSummaries') {
        const vs = entryData as Omit<VisitSummary, 'id' | 'createdAt' | 'visitDate'> & { visitDate?: Date | Timestamp, status?: VisitSummary['status'], source?: VisitSummary['source'] };
        const { clinicName, reasonForVisit, ...rest } = vs;
        if (!clinicName || !reasonForVisit) {
          throw new Error('clinicName and reasonForVisit are required for VisitSummary');
        }
      let visitDateTimestamp: Timestamp | undefined;
        if (rest.visitDate) {
          if (rest.visitDate instanceof Date) {
            visitDateTimestamp = Timestamp.fromDate(rest.visitDate);
          } else if (rest.visitDate instanceof Timestamp) {
            visitDateTimestamp = rest.visitDate;
        } else {
            const parsedDate = new Date(rest.visitDate as any);
          if (!isNaN(parsedDate.getTime())) {
            visitDateTimestamp = Timestamp.fromDate(parsedDate);
          } else {
              visitDateTimestamp = Timestamp.now();
            }
          }
        }
        newEntryWithMetadata = {
          ...rest,
          clinicName,
          reasonForVisit,
          id: newEntryId,
          createdAt: Timestamp.now(),
          visitDate: visitDateTimestamp || Timestamp.now(),
          status: rest.status || 'completed',
          source: rest.source || 'manual',
        };
      } else if (recordType === 'immunizationRecords') {
        newEntryWithMetadata = {
          ...(entryData as Omit<ImmunizationRecord, 'id' | 'createdAt'>),
          id: newEntryId,
          createdAt: Timestamp.now(),
        };
      } else if (recordType === 'labResults') {
        newEntryWithMetadata = {
          ...(entryData as Omit<LabResult, 'id' | 'createdAt'>),
        id: newEntryId,
          createdAt: Timestamp.now(),
        };
      } else {
        throw new Error('Invalid record type');
      }

      const updatedRecords = [...existingRecords, newEntryWithMetadata];
      transaction.update(userDocRef, {
        [recordType]: updatedRecords,
        updatedAt: serverTimestamp(),
      });
    });
    console.log(`${recordType} entry added successfully with ID ${newEntryId} for user ${userId}`);
    return newEntryId;
  } catch (error) {
    console.error(`Error adding ${recordType} entry for user ${userId}:`, error);
    let detailedErrorMessage = `An unknown error occurred while adding the ${recordType} entry.`;
    if (error instanceof FirestoreError) {
      detailedErrorMessage = `Firestore error (${error.code}): ${error.message}`;
    } else if (error instanceof Error) {
      detailedErrorMessage = error.message;
    }
    throw new Error(`Could not add ${recordType} entry. ${detailedErrorMessage}`);
  }
}
