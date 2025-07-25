// src/app/settings/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getUserProfile, saveUserProfile } from '@/services/user-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BellRing, Moon, ShieldCheck, Languages, Trash2, User as UserIcon, Info, AlertTriangle, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { useRef } from 'react';
import EmergencyInfoCard from '@/components/ui/emergency-info-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function SettingsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [notificationPrefs, setNotificationPrefs] = useState({ reminders: true, updates: true, promotions: false });
  const [language, setLanguage] = useState('en');
  const { toast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>(profile?.emergencyContacts || []);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.uid).then((data) => {
      setProfile(data);
      setNotifications(data?.notificationsEnabled ?? true);
      setNotificationPrefs({
        reminders: data?.notificationPrefs?.reminders ?? true,
        updates: data?.notificationPrefs?.updates ?? true,
        promotions: data?.notificationPrefs?.promotions ?? false,
      });
      setLanguage(data?.language ?? 'en');
      setAvatarPreview(data?.photoURL || null);
      setLoading(false);
    });
  }, [user]);

  useEffect(() => {
    setEmergencyContacts(profile?.emergencyContacts || []);
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    let photoURL = profile?.photoURL;
    if (avatarFile) {
      // Simulate upload, replace with real upload logic
      photoURL = URL.createObjectURL(avatarFile);
    }
    await saveUserProfile(user.uid, {
      ...profile,
      notificationsEnabled: notifications,
      notificationPrefs,
      language,
      photoURL,
    });
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been updated.',
      variant: 'default',
      duration: 3000,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    await fetch('/api/delete-user-profile', { method: 'POST', body: JSON.stringify({ uid: user.uid }) });
    // Optionally sign out and redirect
  };

  const handleSaveContacts = async () => {
    // Save to user profile (implement save logic as needed)
    setShowEmergencyDialog(false);
  };

  if (loading) return <div className="p-8">Loading settings...</div>;

  return (
    <TooltipProvider>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-2">
        <div className="w-full max-w-2xl space-y-8">
          <Card className="shadow-xl rounded-2xl">
            <CardHeader className="flex flex-col items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-t-2xl">
              <div className="relative">
                <Avatar className="h-20 w-20 mb-2">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="User avatar" />
                  ) : (
                    <AvatarFallback>{profile?.email?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                  )}
                </Avatar>
                <Button
                  size="sm"
                  className="absolute bottom-0 right-0 rounded-full p-1 bg-primary text-white shadow"
                  onClick={() => fileInputRef.current?.click()}
                  variant="default"
                  type="button"
                >
                  <span className="sr-only">Change avatar</span>
                  <UserIcon className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <CardTitle className="text-2xl font-bold text-center">{profile?.displayName || profile?.email || 'User'}</CardTitle>
              <CardDescription className="text-center text-muted-foreground">Manage your account and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 py-8">
              {/* Account Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-semibold">Email</div>
                    <Input value={profile?.email || ''} disabled className="mt-1" />
                  </div>
                </div>
              </div>
              {/* Preferences Section */}
              <Card className="bg-blue-50/60 border-blue-100">
                <CardHeader className="pb-2 flex flex-row items-center gap-2">
                  <BellRing className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BellRing className="h-5 w-5 text-blue-400" />
                      <span className="font-semibold">Enable Notifications</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground ml-1" />
                        </TooltipTrigger>
                        <TooltipContent>Receive important updates and reminders.</TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                  </div>
                  {/* Notification Preferences */}
                  <div className="space-y-2">
                    <div className="font-semibold mb-1 flex items-center gap-2">
                      <BellRing className="h-4 w-4 text-blue-400" /> Notification Preferences
                    </div>
                    <div className="flex flex-col gap-2 ml-6">
                      <label className="flex items-center gap-2">
                        <Checkbox checked={notificationPrefs.reminders} onCheckedChange={v => setNotificationPrefs(p => ({ ...p, reminders: v as boolean }))} />
                        Reminders
                      </label>
                      <label className="flex items-center gap-2">
                        <Checkbox checked={notificationPrefs.updates} onCheckedChange={v => setNotificationPrefs(p => ({ ...p, updates: v as boolean }))} />
                        Updates
                      </label>
                      <label className="flex items-center gap-2">
                        <Checkbox checked={notificationPrefs.promotions} onCheckedChange={v => setNotificationPrefs(p => ({ ...p, promotions: v as boolean }))} />
                        Promotions
                      </label>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Languages className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold">Language</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground ml-1" />
                        </TooltipTrigger>
                        <TooltipContent>Choose your preferred language.</TooltipContent>
                      </Tooltip>
                    </div>
                    <select
                      className="border rounded px-3 py-2 w-full mt-1"
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                  <Button onClick={handleSave} className="mt-2 w-full" variant="default">Save Settings</Button>
                </CardContent>
              </Card>
              {/* Contact Support Section */}
              <Card className="bg-green-50/60 border-green-100 mt-6">
                <CardHeader className="pb-2 flex flex-row items-center gap-2">
                  <Info className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Contact Support</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="text-muted-foreground">Need help or have feedback? Reach out to our support team.</div>
                  <a href="mailto:support@carematch.ai" className="text-blue-600 hover:underline">support@carematch.ai</a>
                </CardContent>
              </Card>
              {/* Danger Zone Section */}
              <Card className="bg-red-50/70 border-red-200 mt-6">
                <CardHeader className="pb-2 flex flex-row items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-lg text-red-600">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-red-400" />
                    <span className="font-semibold text-red-600">Delete Account</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-4 w-4 text-muted-foreground ml-1" />
                      </TooltipTrigger>
                      <TooltipContent>Permanently delete your account and all data.</TooltipContent>
                    </Tooltip>
                  </div>
                  <Button variant="destructive" onClick={handleDeleteAccount} className="w-full mt-2">Delete Account</Button>
                </CardContent>
              </Card>
              {/* Emergency Info Section */}
              <Card className="bg-red-50/60 border-red-200 mt-6">
                <CardHeader className="pb-2 flex flex-row items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-lg text-red-600">Emergency Info</CardTitle>
                  <Button variant="outline" size="icon" className="ml-auto" onClick={() => setShowEmergencyDialog(true)} title="Edit Emergency Contacts">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <EmergencyInfoCard userProfile={{ ...profile, emergencyContacts }} />
                </CardContent>
              </Card>
              {/* Swipeable Health Tips Section */}
              <SwipeableInfoCards />
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Emergency Contacts</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {emergencyContacts.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input value={c.name} onChange={e => {
                  const updated = [...emergencyContacts];
                  updated[i].name = e.target.value;
                  setEmergencyContacts(updated);
                }} placeholder="Name" className="w-1/3" />
                <Input value={c.phone} onChange={e => {
                  const updated = [...emergencyContacts];
                  updated[i].phone = e.target.value;
                  setEmergencyContacts(updated);
                }} placeholder="Phone" className="w-1/3" />
                <Input value={c.relation} onChange={e => {
                  const updated = [...emergencyContacts];
                  updated[i].relation = e.target.value;
                  setEmergencyContacts(updated);
                }} placeholder="Relation" className="w-1/4" />
                <Button variant="ghost" size="icon" onClick={() => setEmergencyContacts(emergencyContacts.filter((_, idx) => idx !== i))}>
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <Input value={newContact.name} onChange={e => setNewContact({ ...newContact, name: e.target.value })} placeholder="Name" className="w-1/3" />
              <Input value={newContact.phone} onChange={e => setNewContact({ ...newContact, phone: e.target.value })} placeholder="Phone" className="w-1/3" />
              <Input value={newContact.relation} onChange={e => setNewContact({ ...newContact, relation: e.target.value })} placeholder="Relation" className="w-1/4" />
              <Button variant="outline" size="icon" onClick={() => {
                if (newContact.name && newContact.phone) {
                  setEmergencyContacts([...emergencyContacts, newContact]);
                  setNewContact({ name: '', phone: '', relation: '' });
                }
              }}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveContacts} className="w-full mt-2" variant="default">Save Emergency Contacts</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

const healthTips = [
  {
    title: 'Stay Hydrated',
    description: 'Drink at least 8 cups of water daily to support your body and mind.',
    color: 'bg-blue-100 border-blue-300',
  },
  {
    title: 'Regular Exercise',
    description: 'Aim for 30 minutes of moderate activity most days of the week.',
    color: 'bg-green-100 border-green-300',
  },
  {
    title: 'Mental Health Matters',
    description: 'Take breaks, talk to someone you trust, and seek help if you feel overwhelmed.',
    color: 'bg-purple-100 border-purple-300',
  },
  {
    title: 'Sleep Well',
    description: '7-9 hours of sleep helps your body recover and your mind stay sharp.',
    color: 'bg-yellow-100 border-yellow-300',
  },
  {
    title: 'Emergency Numbers',
    description: 'Know your local emergency numbers: 911 (US), 112 (EU), 999 (UK), 988 (US Mental Health).',
    color: 'bg-red-100 border-red-300',
  },
];

function SwipeableInfoCards() {
  const [cards, setCards] = useState(healthTips);
  const dragRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleSwipe = (idx: number) => {
    setCards(cards => cards.filter((_, i) => i !== idx));
  };

  // Simple drag-to-dismiss (swipe left) implementation
  const handleDrag = (e: React.DragEvent, idx: number) => {
    if (e.clientX < 100) handleSwipe(idx);
  };

  return (
    <div className="mt-8 flex flex-col gap-4">
      {cards.map((tip, idx) => (
        <div
          key={tip.title}
          draggable
          onDragEnd={e => handleDrag(e, idx)}
          ref={el => dragRefs.current[idx] = el}
          className={`transition-transform duration-300 cursor-grab active:scale-95 ${tip.color}`}
        >
          <Card className={`border-2 ${tip.color} shadow-md hover:shadow-xl`}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{tip.title}</CardTitle>
              <button
                className="ml-2 text-xs text-red-500 hover:underline"
                onClick={() => handleSwipe(idx)}
                title="Dismiss"
              >
                Dismiss
              </button>
            </CardHeader>
            <CardContent className="text-base">{tip.description}</CardContent>
          </Card>
        </div>
      ))}
      {cards.length === 0 && (
        <div className="text-center text-muted-foreground py-8">All tips dismissed. Stay healthy!</div>
      )}
    </div>
  );
} 