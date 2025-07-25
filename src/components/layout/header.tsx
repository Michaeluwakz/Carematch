
"use client";

import Link from 'next/link';
import { Home, Zap, Brain, ShieldCheck, Menu, Settings as SettingsIcon, BriefcaseMedical, Compass, LogIn, UserPlus, LogOut, UserCog, BellRing, Inbox, NotebookText, Award, HeartPulse, Bot, Lightbulb, Activity, AlertTriangle, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase/config';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet"; 
import * as React from "react";
import { ThemeToggleButton } from './theme-toggle';
import { useState, useEffect } from 'react';
import EmergencyInfoCard from '@/components/ui/emergency-info-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function Header() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [lowPower, setLowPower] = useState(false);
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState<any[]>(userProfile?.emergencyContacts || []);
  const [editingContact, setEditingContact] = useState<any | null>(null);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });

  useEffect(() => {
    const stored = localStorage.getItem('lowPowerMode');
    if (stored) setLowPower(stored === 'true');
  }, []);
  useEffect(() => {
    localStorage.setItem('lowPowerMode', String(lowPower));
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('low-power', lowPower);
    }
  }, [lowPower]);

  useEffect(() => {
    setEmergencyContacts(userProfile?.emergencyContacts || []);
  }, [userProfile]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); 
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const handleSaveContacts = async () => {
    // Save to user profile (implement save logic as needed)
    // Optionally show a toast
    setShowEmergencyDialog(false);
  };

  const getInitials = (email?: string | null) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  const navLinks = [
    { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
    { href: "/health-assistant", label: "AI Companion", icon: <Zap className="h-5 w-5" /> },
    { href: "/ai-coach-dashboard", label: "AI Coach Dashboard", icon: <Award className="h-5 w-5 text-yellow-500" /> },
    { href: "/mental-health-companion", label: "Mental Health", icon: <Brain className="h-5 w-5" /> },
    { href: "/document-parser", label: "Tools", icon: <BriefcaseMedical className="h-5 w-5" /> },
    { href: "/care-navigator", label: "Care Navigator", icon: <Compass className="h-5 w-5" /> },
    { href: "/centres", label: "Centres Directory", icon: <BriefcaseMedical className="h-5 w-5 text-blue-700" /> },
    { href: "/resources", label: "Resources", icon: <Lightbulb className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <SettingsIcon className="h-5 w-5" /> },
  ];

  const userAccountLinks = [ 
    { href: "/profile", label: "Health Profile", icon: <UserCog className="h-5 w-5" /> },
    { href: "/health-profile", label: "Health Analytics", icon: <Lightbulb className="h-5 w-5" /> },
    { href: "/ai-coach-dashboard", label: "AI Coach Dashboard", icon: <Award className="h-5 w-5 text-yellow-500" /> },
    { href: "/my-health-record", label: "My Health Record", icon: <NotebookText className="h-5 w-5" /> },
    { href: "/reminders", label: "My Reminders", icon: <BellRing className="h-5 w-5" /> },
    { href: "/notifications", label: "My Notifications", icon: <Inbox className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <SettingsIcon className="h-5 w-5" /> },
  ];

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

  function CarouselInfoCards() {
    const [index, setIndex] = useState(0);
    const tip = healthTips[index];
    const goLeft = () => setIndex(i => (i === 0 ? healthTips.length - 1 : i - 1));
    const goRight = () => setIndex(i => (i === healthTips.length - 1 ? 0 : i + 1));
    return (
      <div className="mb-4 flex flex-col items-center">
        <div className={`w-full max-w-xs ${tip.color} rounded-lg border-2 shadow-md p-4 transition-all duration-300 select-none`}>
          <div className="flex items-center justify-between mb-2">
            <button onClick={goLeft} className="text-lg font-bold px-2 py-1 hover:bg-gray-200 rounded">&#8592;</button>
            <span className="font-semibold text-base">{tip.title}</span>
            <button onClick={goRight} className="text-lg font-bold px-2 py-1 hover:bg-gray-200 rounded">&#8594;</button>
          </div>
          <div className="text-sm text-gray-700">{tip.description}</div>
        </div>
        <div className="flex gap-1 mt-2">
          {healthTips.map((_, i) => (
            <span key={i} className={`h-2 w-2 rounded-full ${i === index ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <header className="bg-card border-b shadow-sm sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-4">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-primary">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 flex flex-col">
                <SheetTitle className="sr-only">Main Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  A list of main navigation links for the CareMatch AI application.
                </SheetDescription>
                <div className="p-4 border-b">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-primary"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <HeartPulse className="h-7 w-7" />
                    <h2 className="text-xl font-semibold">CareMatch AI</h2>
                  </Link>
                </div>
                
                <div className="flex-grow overflow-y-auto">
                  <nav className="flex flex-col space-y-1 p-4">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          {link.icon}
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                    {user && (
                      <>
                        <div className="my-2 border-t border-border -mx-4"></div>
                        <p className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">My Account</p>
                        {userAccountLinks.filter(l => l.href !== "/onboarding").map((link) => ( 
                           <SheetClose asChild key={link.href}>
                             <Link
                               href={link.href}
                               className="flex items-center gap-3 px-3 py-2.5 rounded-md text-base font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                             >
                              {link.icon}
                              {link.label}
                            </Link>
                           </SheetClose>
                        ))}
                      </>
                    )}
                  </nav>
                </div>

                <div className="p-4 border-t">
                    {!loading && (
                      <>
                        {!user ? (
                          <div className="space-y-2">
                              <SheetClose asChild>
                                  <Button asChild className="w-full bg-primary hover:bg-primary/90">
                                      <Link href="/login">
                                          <LogIn className="mr-2 h-4 w-4" /> Log In
                                      </Link>
                                  </Button>
                              </SheetClose>
                              <SheetClose asChild>
                                  <Button asChild variant="secondary" className="w-full">
                                      <Link href="/signup">
                                          <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                                      </Link>
                                  </Button>
                              </SheetClose>
                          </div>
                        ) : (
                          <SheetClose asChild>
                              <Button variant="ghost" onClick={handleLogout} className="w-full justify-start flex items-center gap-3 px-3 py-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive">
                                  <LogOut className="h-5 w-5" />
                                  Log out
                              </Button>
                          </SheetClose>
                        )}
                      </>
                    )}
                </div>
              </SheetContent>
            </Sheet>
            
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <HeartPulse className="h-8 w-8" />
              <h1 className="text-xl sm:text-2xl font-semibold">CareMatch AI</h1>
            </Link>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <ThemeToggleButton />
            <button
              className={`ml-4 px-3 py-1 rounded border text-xs
                ${lowPower
                  ? 'bg-yellow-100 border-yellow-400 text-yellow-900 dark:bg-yellow-900 dark:border-yellow-400 dark:text-yellow-100'
                  : 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100'
                }
              `}
              onClick={() => setLowPower(v => !v)}
              title="Toggle Low Power Mode"
            >
              {lowPower ? 'Low Power: ON' : 'Low Power: OFF'}
            </button>
            {!loading && (
              <>
                {user && (
                  <div className="ml-4 flex items-center">
                    <Button variant="outline" size="icon" onClick={() => setShowEmergencyDialog(true)} title="View Emergency Info">
                      <AlertTriangle className="text-red-500 h-5 w-5" />
                    </Button>
                    <Dialog open={showEmergencyDialog} onOpenChange={setShowEmergencyDialog}>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>Emergency Info</DialogTitle>
                        </DialogHeader>
                        <CarouselInfoCards />
                        <EmergencyInfoCard userProfile={userProfile && userProfile.uid ? { ...userProfile, emergencyContacts } : null} />
                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">Edit Emergency Contacts</span>
                            <Button variant="ghost" size="icon" onClick={() => setNewContact({ name: '', phone: '', relation: '' })}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
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
                        </div>
                        <DialogFooter>
                          <Button onClick={handleSaveContacts} className="w-full mt-2" variant="default">Save Emergency Contacts</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
                {user ? (
                  <>
                    {userProfile && userProfile.healthPoints !== undefined && (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-amber-500 font-semibold mr-1 sm:mr-2 px-2 py-1 bg-amber-500/10 rounded-full">
                        <Award className="h-4 w-4" />
                        {userProfile.healthPoints} pts
                      </div>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full">
                          <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                            <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user.displayName || userProfile?.preferredName || user.email?.split('@')[0]}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                         {userProfile && userProfile.healthPoints !== undefined && (
                          <>
                            <DropdownMenuItem disabled className="opacity-100 cursor-default">
                              <div className="flex items-center gap-2 text-amber-600">
                                <Award className="h-4 w-4" />
                                Health Points: {userProfile.healthPoints}
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        {userAccountLinks.map(link => (
                           <DropdownMenuItem asChild key={link.href}>
                            <Link
                              href={link.href}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              {link.icon}
                              {link.label}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                          <LogOut className="h-4 w-4" />
                          Log out
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <>
                    {/* Desktop Buttons */}
                    <Button variant="ghost" asChild size="sm" className="hidden sm:inline-flex">
                      <Link
                        href="/login"
                        className="flex items-center gap-1 text-xs sm:text-sm"
                      >
                        <LogIn className="h-4 w-4" />
                        Login
                      </Link>
                    </Button>
                    <Button variant="default" asChild size="sm" className="hidden sm:inline-flex bg-primary hover:bg-primary/90">
                      <Link
                        href="/signup"
                        className="flex items-center gap-1 text-xs sm:text-sm"
                      >
                        <UserPlus className="h-4 w-4" />
                        Sign Up
                      </Link>
                    </Button>

                    {/* Mobile Icon Buttons */}
                    <Button variant="ghost" asChild size="icon" className="sm:hidden">
                      <Link href="/login">
                        <LogIn className="h-5 w-5" />
                        <span className="sr-only">Login</span>
                      </Link>
                    </Button>
                    <Button asChild size="icon" className="sm:hidden bg-primary hover:bg-primary/90">
                      <Link href="/signup">
                        <UserPlus className="h-5 w-5" />
                        <span className="sr-only">Sign Up</span>
                      </Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
