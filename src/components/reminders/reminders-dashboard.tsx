
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { addReminder, getReminders, updateReminder, deleteReminder } from '@/services/reminder-service';
import { awardHealthPoints } from '@/services/user-service'; // Import awardHealthPoints
import { addNotification } from '@/services/notification-service'; // Import addNotification
import type { Reminder, ReminderCategory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle, Trash2, BellRing, Loader2, AlertCircle, Award } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Timestamp } from 'firebase/firestore';
import { addToQueue, useSyncQueue } from '@/hooks/use-offline-queue';


export default function RemindersDashboard() {
  const { user, loading: authLoading, refreshUserProfile } = useAuth(); // Added refreshUserProfile
  const router = useRouter();
  const { toast } = useToast();

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderCategory, setNewReminderCategory] = useState<ReminderCategory>('appointment');
  const [newReminderDate, setNewReminderDate] = useState<Date | undefined>(new Date());
  const [newReminderTime, setNewReminderTime] = useState<string>(format(new Date(), "HH:mm"));
  const [newReminderNotes, setNewReminderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchUserReminders();
  }, [user, authLoading, router]);

  const fetchUserReminders = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const userReminders = await getReminders(user.uid);
      setReminders(userReminders);
    } catch (err) {
      console.error("Error fetching reminders:", err);
      const errorMessage = err instanceof Error ? err.message : "Could not fetch reminders.";
      setError(errorMessage);
      toast({ title: "Error fetching reminders", description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Sync queued reminders when back online
  useSyncQueue(async (action) => {
    if (action.type === 'reminder' && user) {
      await addReminder(user.uid, action.reminder);
      fetchUserReminders();
    }
  });

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newReminderDate || !newReminderTitle.trim()) {
        toast({ title: "Missing Information", description: "Title and date/time are required.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);

    const [hours, minutes] = newReminderTime.split(':').map(Number);
    const reminderDateTime = new Date(newReminderDate);
    reminderDateTime.setHours(hours, minutes, 0, 0);
    const reminderData = {
      title: newReminderTitle,
      category: newReminderCategory,
      reminderDateTime,
      notes: newReminderNotes,
    };
    if (navigator.onLine) {
      try {
        const reminderId = await addReminder(user.uid, reminderData);
        toast({ title: "Reminder Added!", description: "Your new reminder has been saved." });
      
        // Add a notification for the new reminder
        try {
          await addNotification(user.uid, {
            title: `New Reminder: ${newReminderTitle}`,
            message: `A new reminder for "${newReminderCategory}" has been set for ${format(reminderDateTime, "PPP 'at' p")}.`,
            type: 'reminder',
            linkTo: `/reminders#${reminderId}` 
          });
        } catch (notificationError) {
          console.error("Error adding notification for new reminder:", notificationError);
          toast({ title: "Reminder Added, Notification Failed", description: "Reminder saved, but failed to create a notification for it.", variant: "destructive" });
        }

        setIsAddDialogOpen(false);
        resetAddReminderForm();
        fetchUserReminders();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Could not add reminder.";
        toast({ title: "Error Adding Reminder", description: errorMessage, variant: "destructive" });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      addToQueue({ type: 'reminder', reminder: reminderData });
      toast({ title: "Offline Mode", description: "Reminder will be saved when you are back online.", variant: "default" });
      setIsAddDialogOpen(false);
      resetAddReminderForm();
      setIsSubmitting(false);
    }
  };
  
  const resetAddReminderForm = () => {
    setNewReminderTitle('');
    setNewReminderCategory('appointment');
    setNewReminderDate(new Date());
    setNewReminderTime(format(new Date(), "HH:mm"));
    setNewReminderNotes('');
  }

  const handleToggleDone = async (reminder: Reminder) => {
    if (!user || !reminder.id) { 
        toast({ title: "Error", description: "Cannot update reminder without an ID or if not logged in.", variant: "destructive" });
        return;
    }
    const newIsDoneStatus = !reminder.isDone;
    try {
      await updateReminder(reminder.id, { isDone: newIsDoneStatus });
      setReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, isDone: newIsDoneStatus } : r));
      toast({ title: "Reminder Updated", description: `Reminder marked as ${newIsDoneStatus ? 'done' : 'pending'}.` });

      if (newIsDoneStatus) { // Award points only when marking as done
        const pointsToAward = 10; // Example points
        await awardHealthPoints(user.uid, pointsToAward);
        await refreshUserProfile(); // Refresh profile in context to update points in header
        toast({
          title: "Points Awarded!",
          description: (
            <div className="flex items-center">
              <Award className="mr-2 h-5 w-5 text-yellow-500" />
              {`You earned ${pointsToAward} health points for completing a reminder!`}
            </div>
          ),
        });
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Could not update reminder status.";
      toast({ title: "Error Updating Reminder", description: errorMessage, variant: "destructive" });
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!user) { 
        toast({ title: "Authentication Error", description: "You must be logged in to delete reminders.", variant: "destructive" });
        return;
    }
    if (!window.confirm("Are you sure you want to delete this reminder?")) return;
    try {
      await deleteReminder(reminderId);
      setReminders(prev => prev.filter(r => r.id !== reminderId));
      toast({ title: "Reminder Deleted", description: "The reminder has been successfully removed." });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Could not delete reminder.";
      toast({ title: "Error Deleting Reminder", description: errorMessage, variant: "destructive" });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading your reminders...</p>
      </div>
    );
  }

  if (error) {
    let displayError = `Error loading reminders: ${error}`;
    const lowerCaseError = error.toLowerCase();
    if (lowerCaseError.includes("offline") || lowerCaseError.includes("unavailable") || lowerCaseError.includes("could not reach cloud firestore backend")) {
      displayError = "Could not connect to the database. Please check your internet connection and ensure Firebase services are operational. The application might be in offline mode.";
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] text-destructive p-4">
        <AlertCircle className="h-12 w-12" />
        <p className="mt-4 text-center">{displayError}</p>
        <Button onClick={fetchUserReminders} className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">Try Again</Button>
      </div>
    );
  }

  const pendingReminders = reminders.filter(r => !r.isDone).sort((a,b) => (a.reminderDateTime as Timestamp).toMillis() - (b.reminderDateTime as Timestamp).toMillis());
  const completedReminders = reminders.filter(r => r.isDone).sort((a,b) => (b.reminderDateTime as Timestamp).toMillis() - (a.reminderDateTime as Timestamp).toMillis());

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
          <BellRing className="h-8 w-8" /> My Reminders
        </h1>
        <Dialog open={isAddDialogOpen} onOpenChange={(isOpen) => {
          setIsAddDialogOpen(isOpen);
          if (!isOpen) resetAddReminderForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Add New Reminder</DialogTitle>
              <DialogDescription>
                Fill in the details for your new health reminder. All fields marked * are required.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddReminder} className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2 sm:pr-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={newReminderTitle} onChange={(e) => setNewReminderTitle(e.target.value)} placeholder="e.g., Take morning pills" required disabled={isSubmitting} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={newReminderCategory} onValueChange={(value) => setNewReminderCategory(value as ReminderCategory)} required disabled={isSubmitting}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="medication">Medication</SelectItem>
                    <SelectItem value="prescription">Prescription Refill</SelectItem>
                    <SelectItem value="check-up">Check-up</SelectItem>
                    <SelectItem value="surgery">Surgery Prep/Follow-up</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date *</Label>
                   <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={`w-full justify-start text-left font-normal ${!newReminderDate && "text-muted-foreground"}`}
                          disabled={isSubmitting}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newReminderDate ? format(newReminderDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newReminderDate}
                          onSelect={setNewReminderDate}
                          initialFocus
                          disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() -1))} 
                        />
                      </PopoverContent>
                    </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input id="time" type="time" value={newReminderTime} onChange={(e) => setNewReminderTime(e.target.value)} required disabled={isSubmitting} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" value={newReminderNotes} onChange={(e) => setNewReminderNotes(e.target.value)} placeholder="e.g., Remember to fast before appointment" disabled={isSubmitting} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting || !newReminderTitle.trim() || !newReminderDate}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Reminder
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {reminders.length === 0 && !isLoading && (
        <Card className="text-center py-8 shadow-md">
          <CardContent>
            <BellRing className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">You have no reminders yet.</p>
            <p className="text-sm text-muted-foreground">Click "Add Reminder" to get started.</p>
          </CardContent>
        </Card>
      )}

      {pendingReminders.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Pending Reminders</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {pendingReminders.map(reminder => (
              <Card key={reminder.id} className={`shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-primary">{reminder.title}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => reminder.id && handleDeleteReminder(reminder.id)} className="text-destructive hover:text-destructive/80 h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="capitalize text-sm">
                    Category: {reminder.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm">
                    Due: {reminder.reminderDateTime instanceof Timestamp ? format(reminder.reminderDateTime.toDate(), "EEE, MMM d, yyyy 'at' h:mm a") : 'Invalid date'}
                  </p>
                  {reminder.notes && <p className="text-sm mt-2 text-muted-foreground">Notes: {reminder.notes}</p>}
                </CardContent>
                <CardFooter>
                   <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`done-${reminder.id}`}
                        checked={reminder.isDone}
                        onCheckedChange={() => handleToggleDone(reminder)}
                        aria-label="Mark as done"
                      />
                      <Label htmlFor={`done-${reminder.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Mark as Done
                      </Label>
                    </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      )}

      {completedReminders.length > 0 && (
         <section className="mt-12">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Completed Reminders</h2>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {completedReminders.map(reminder => (
              <Card key={reminder.id} className="opacity-70 bg-card/70 shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-muted-foreground line-through">{reminder.title}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => reminder.id && handleDeleteReminder(reminder.id)} className="text-destructive hover:text-destructive/80 h-8 w-8">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="capitalize text-sm">
                    Category: {reminder.category}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm">
                    Completed on: {reminder.reminderDateTime instanceof Timestamp ? format(reminder.reminderDateTime.toDate(), "EEE, MMM d, yyyy 'at' h:mm a") : 'Invalid date'}
                  </p>
                  {reminder.notes && <p className="text-sm mt-2 text-muted-foreground">Notes: {reminder.notes}</p>}
                </CardContent>
                 <CardFooter>
                   <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`done-${reminder.id}`}
                        checked={reminder.isDone}
                        onCheckedChange={() => handleToggleDone(reminder)}
                        aria-label="Mark as pending"
                      />
                      <Label htmlFor={`done-${reminder.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        Mark as Pending
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
