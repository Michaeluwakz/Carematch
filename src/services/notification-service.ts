
import { db } from '@/lib/firebase/config';
import type { Notification } from '@/lib/types';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  FirestoreError // Import FirestoreError
} from 'firebase/firestore';

const notificationsCollection = collection(db, 'notifications');

/**
 * Adds a new notification to Firestore for a specific user.
 */
export async function addNotification(userId: string, notificationData: Omit<Notification, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isRead'>): Promise<string> {
  if (!userId) throw new Error("User ID is required to add a notification.");

  try {
    const docRef = await addDoc(notificationsCollection, {
      ...notificationData,
      userId,
      isRead: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("Notification added successfully with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding notification:", error);
    if (error instanceof FirestoreError) {
      throw new Error(`Could not save notification: Firestore error (${error.code}) - ${error.message}`);
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while saving the notification.";
    throw new Error(`Could not save notification to the database. ${errorMessage}`);
  }
}

/**
 * Fetches all non-expired notifications for a specific user, ordered by createdAt timestamp descending.
 */
export async function getNotifications(userId: string): Promise<Notification[]> {
  if (!userId) {
    console.warn("User ID is required to fetch notifications.");
    return [];
  }

  try {
    const q = query(
      notificationsCollection, 
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];
    const now = Timestamp.now();
    
    querySnapshot.forEach((doc) => {
      const notification = { id: doc.id, ...doc.data() } as Notification;
      // Filter out expired notifications on the client-side
      if (notification.expiresAt && notification.expiresAt.toMillis() < now.toMillis()) {
        // Optional: Could delete the notification from Firestore here for cleanup
        // For now, we just won't show it to the user.
        return; 
      }
      notifications.push(notification);
    });
    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    if (error instanceof FirestoreError) {
      throw new Error(`Could not fetch notifications: Firestore error (${error.code}) - ${error.message}`);
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while fetching notifications.";
    throw new Error(`Could not fetch notifications from the database. ${errorMessage}`);
  }
}


/**
 * Updates a specific notification in Firestore.
 * Commonly used to mark a notification as read.
 */
export async function updateNotification(notificationId: string, updates: Partial<Notification>): Promise<void> {
  if (!notificationId) throw new Error("Notification ID is required to update.");

  const notificationDocRef = doc(db, 'notifications', notificationId);
  try {
    await updateDoc(notificationDocRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log("Notification updated successfully:", notificationId);
  } catch (error) {
    console.error("Error updating notification:", error);
    if (error instanceof FirestoreError) {
      throw new Error(`Could not update notification: Firestore error (${error.code}) - ${error.message}`);
    }
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while updating the notification.";
    throw new Error(`Could not update notification in the database. ${errorMessage}`);
  }
}

/**
 * Deletes a specific notification from Firestore.
 */
export async function deleteNotification(notificationId: string): Promise<void> {
    if (!notificationId) throw new Error("Notification ID is required to delete.");
    const notificationDocRef = doc(db, 'notifications', notificationId);
    try {
        await deleteDoc(notificationDocRef);
        console.log("Notification deleted successfully:", notificationId);
    } catch (error) {
        console.error("Error deleting notification:", error);
        if (error instanceof FirestoreError) {
            throw new Error(`Could not delete notification: Firestore error (${error.code}) - ${error.message}`);
        }
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while deleting the notification.";
        throw new Error(`Could not delete notification from the database. ${errorMessage}`);
    }
}
