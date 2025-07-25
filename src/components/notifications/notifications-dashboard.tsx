
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getNotifications, updateNotification } from '@/services/notification-service';
import type { Notification, NotificationType } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { formatDistanceToNow } from 'date-fns';
import { BellRing, Loader2, AlertCircle, Eye, EyeOff, MessageSquarePlus, CheckCircle, Bell, MailWarning } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';

const getNotificationIcon = (type: NotificationType) => {
  switch(type) {
    case 'reminder': return <Bell className="h-5 w-5 text-blue-500" />;
    case 'appointment': return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'update': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    case 'check-in': return <MessageSquarePlus className="h-5 w-5 text-purple-500" />;
    case 'general': return <MailWarning className="h-5 w-5 text-gray-500" />;
    default: return <BellRing className="h-5 w-5 text-gray-500" />;
  }
};


export default function NotificationsDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchUserNotifications();
  }, [user, authLoading, router]);

  const fetchUserNotifications = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const userNotifications = await getNotifications(user.uid);
      setNotifications(userNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      const errorMessage = err instanceof Error ? err.message : "Could not fetch notifications.";
      setError(errorMessage);
      toast({ title: "Error fetching notifications", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRead = async (notification: Notification) => {
    if (!user || !notification.id) { 
        toast({ title: "Error", description: "Cannot update notification without an ID or if not logged in.", variant: "destructive" });
        return;
    }
    const newIsReadStatus = !notification.isRead;
    try {
      await updateNotification(notification.id, { isRead: newIsReadStatus });
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: newIsReadStatus } : n));
      toast({ title: "Notification Updated", description: `Notification marked as ${newIsReadStatus ? 'read' : 'unread'}.` });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Could not update notification status.";
      toast({ title: "Error Updating Notification", description: errorMessage, variant: "destructive" });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your notifications...</p>
      </div>
    );
  }

  if (error) {
    let displayError = `Error loading notifications: ${error}`;
    const lowerCaseError = error.toLowerCase();
    if (lowerCaseError.includes("offline") || lowerCaseError.includes("unavailable") || lowerCaseError.includes("could not reach cloud firestore backend")) {
      displayError = "Could not connect to the database. Please check your internet connection and ensure Firebase services are operational. The application might be in offline mode.";
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] text-destructive p-4">
        <AlertCircle className="h-12 w-12" />
        <p className="mt-4 text-center">{displayError}</p>
        <Button onClick={fetchUserNotifications} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">Try Again</Button>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
          <BellRing className="h-8 w-8" /> My Notifications
        </h1>
      </div>

      {notifications.length === 0 && !isLoading && (
        <Card className="text-center py-8 shadow-md">
          <CardContent>
            <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">You have no notifications yet.</p>
            <p className="text-sm text-muted-foreground">Notifications about reminders and account updates will appear here.</p>
          </CardContent>
        </Card>
      )}

      {unreadNotifications.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Unread Notifications</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {unreadNotifications.map(notification => (
              <Card key={notification.id} className={`shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col`}>
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                     <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <CardTitle className="text-lg text-primary">{notification.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="capitalize text-sm pt-2">
                    Type: {notification.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs mt-2 text-muted-foreground">
                    {formatDistanceToNow((notification.createdAt as Timestamp).toDate(), { addSuffix: true })}
                  </p>
                  {notification.linkTo && (
                    <Button asChild variant="link" className="p-0 h-auto mt-2">
                      <Link href={notification.linkTo}>
                        View Details
                      </Link>
                    </Button>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`read-${notification.id}`}
                      checked={notification.isRead}
                      onCheckedChange={() => handleToggleRead(notification)}
                      aria-label="Mark as read"
                    />
                    <Label htmlFor={`read-${notification.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Mark as Read
                    </Label>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {readNotifications.length > 0 && (
        <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Read Notifications</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {readNotifications.map(notification => (
              <Card key={notification.id} className="opacity-70 bg-card/70 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start gap-2">
                     <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <CardTitle className="text-lg text-muted-foreground">{notification.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="capitalize text-sm pt-2">
                    Type: {notification.type}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs mt-2 text-muted-foreground">
                    {formatDistanceToNow((notification.createdAt as Timestamp).toDate(), { addSuffix: true })}
                  </p>
                  {notification.linkTo && (
                     <Button asChild variant="link" className="p-0 h-auto mt-2">
                        <Link href={notification.linkTo}>
                            View Details
                        </Link>
                     </Button>
                  )}
                </CardContent>
                <CardFooter>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`read-${notification.id}`}
                      checked={notification.isRead}
                      onCheckedChange={() => handleToggleRead(notification)}
                      aria-label="Mark as unread"
                    />
                    <Label htmlFor={`read-${notification.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Mark as Unread
                    </Label>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
