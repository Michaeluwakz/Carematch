
import { db } from '@/lib/firebase/config';
import type { Reminder } from '@/lib/types';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  Timestamp,
  FirestoreError // Import FirestoreError
} from 'firebase/firestore';

const remindersCollection = collection(db, 'reminders');

/**
 * Adds a new reminder to Firestore for a specific user.
 */
export async function addReminder(userId: string, reminderData: Omit<Reminder, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isDone'> & { reminderDateTime: Date }): Promise<string> {
  if (!userId) throw new Error("User ID is required to add a reminder.");

  try {
    const docRef = await addDoc(remindersCollection, {
      ...reminderData,
      userId,
      reminderDateTime: Timestamp.fromDate(reminderData.reminderDateTime),
      isDone: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("Reminder added successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding reminder:", error);
    if (error instanceof FirestoreError) {
      throw new Error(`Could not save reminder: Firestore error (${error.code}) - ${error.message}`);
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while saving the reminder.";
    throw new Error(`Could not save reminder to the database. ${errorMessage}`);
  }
}

/**
 * Fetches all reminders for a specific user, ordered by reminderDateTime.
 */
export async function getReminders(userId: string): Promise<Reminder[]> {
  if (!userId) {
    console.warn("User ID is required to fetch reminders.");
    return [];
  }

  try {
    const q = query(
      remindersCollection, 
      where("userId", "==", userId),
      orderBy("reminderDateTime", "asc") 
    );
    const querySnapshot = await getDocs(q);
    const reminders: Reminder[] = [];
    querySnapshot.forEach((doc) => {
      reminders.push({ id: doc.id, ...doc.data() } as Reminder);
    });
    return reminders;
  } catch (error) {
    console.error("Error fetching reminders:", error);
    if (error instanceof FirestoreError) {
      throw new Error(`Could not fetch reminders: Firestore error (${error.code}) - ${error.message}`);
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching reminders.";
    throw new Error(`Could not fetch reminders from the database. ${errorMessage}`);
  }
}

/**
 * Updates a specific reminder in Firestore.
 * Commonly used to mark a reminder as done or not done.
 */
export async function updateReminder(reminderId: string, updates: Partial<Reminder>): Promise<void> {
  if (!reminderId) throw new Error("Reminder ID is required to update.");

  const reminderDocRef = doc(db, 'reminders', reminderId);
  try {
    await updateDoc(reminderDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log("Reminder updated successfully:", reminderId);
  } catch (error) {
    console.error("Error updating reminder:", error);
    if (error instanceof FirestoreError) {
      throw new Error(`Could not update reminder: Firestore error (${error.code}) - ${error.message}`);
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while updating the reminder.";
    throw new Error(`Could not update reminder in the database. ${errorMessage}`);
  }
}

/**
 * Deletes a specific reminder from Firestore.
 */
export async function deleteReminder(reminderId: string): Promise<void> {
  if (!reminderId) throw new Error("Reminder ID is required to delete.");

  const reminderDocRef = doc(db, 'reminders', reminderId);
  try {
    await deleteDoc(reminderDocRef);
    console.log("Reminder deleted successfully:", reminderId);
  } catch (error) {
    console.error("Error deleting reminder:", error);
    if (error instanceof FirestoreError) {
      throw new Error(`Could not delete reminder: Firestore error (${error.code}) - ${error.message}`);
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while deleting the reminder.";
    throw new Error(`Could not delete reminder from the database. ${errorMessage}`);
  }
}
