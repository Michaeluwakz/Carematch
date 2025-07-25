
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getNotificationsForUser, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  type Notification // Make sure Notification type is exported and imported
} from '@/services/notification-service'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Bell, CheckCircle, AlertCircle, Loader2, MailWarning, Eye, EyeOff, Inbox } from 'lucide-react';
import { formatDistanceToNowStrict } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import type { Timestamp } from 'firebase/firestore';

export default function NotificationsList() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserNotifications = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const userNotifications = await getNotificationsForUser(user.uid);
      setNotifications(userNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      const errorMessage = err instanceof Error ? err.message : "Could not fetch notifications.";
      setError(errorMessage);
      toast({ title: "Error fetching notifications", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchUserNotifications();
  }, [user, authLoading, router, fetchUserNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    if (!user || !notificationId) return;
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
      toast({ title: "Notification marked as read." });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Could not update notification.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    try {
      await markAllNotificationsAsRead(user.uid);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast({ title: "All notifications marked as read." });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Could not mark all as read.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  };
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch(type) {
      case 'reminder': return <Bell className="h-5 w-5 text-blue-500" />;
      case 'appointment': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'update': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'general': return <MailWarning className="h-5 w-5 text-gray-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
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
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Loading Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button onClick={fetchUserNotifications} className="mt-4">Try Again</Button>
      </Alert>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Inbox className="h-8 w-8" /> My Notifications
        </h1>
        {notifications.some(n => !n.isRead) && (
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" /> Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="text-center py-12 shadow-md">
           <CardHeader>
            <MailWarning className="mx-auto h-16 w-16 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardTitle className="text-xl">No New Notifications</CardTitle>
            <CardDescription className="mt-2">You're all caught up!</CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map(notification => (
            <Card 
              key={notification.id} 
              className={cn(
                "shadow-md hover:shadow-lg transition-shadow duration-200",
                notification.isRead ? "bg-card/70 opacity-70" : "bg-card"
              )}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <h3 className={cn(
                      "font-semibold",
                      !notification.isRead ? "text-primary" : "text-foreground/80"
                    )}>
                      {notification.title}
                    </h3>
                     <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {notification.createdAt instanceof Timestamp ? 
                       formatDistanceToNowStrict(notification.createdAt.toDate(), { addSuffix: true }) : 
                       'Recently'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  {notification.linkTo && (
                     <Link href={notification.linkTo} className="text-sm text-primary hover:underline mt-2 inline-block">
                      View Details
                    </Link>
                  )}
                </div>
                {!notification.isRead && notification.id && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary flex-shrink-0"
                          onClick={() => notification.id && handleMarkAsRead(notification.id)}
                        >
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Mark as read</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
