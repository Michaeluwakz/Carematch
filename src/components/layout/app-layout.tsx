
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Toaster } from "@/components/ui/toaster";
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useState, useEffect } from 'react';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user } = useAuth();
  const [year, setYear] = useState('');
  useEffect(() => {
    setYear(new Date().getFullYear().toString());
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <Toaster />
      
      {user && (
        <Link href="/reminders" passHref>
          <Button
            aria-label="Add Reminder"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground z-50 flex items-center justify-center"
            size="icon"
            asChild={false} // Important: Button itself is not a child slot here, Link handles the anchor
            onClick={(e) => {
              // This is to ensure Link navigation happens, as Button might try to handle click if not careful
              // No need to preventDefault if Link is wrapping correctly and Button is not asChild.
            }}
          >
            <Plus className="h-7 w-7" />
          </Button>
        </Link>
      )}

      <footer className="bg-card border-t py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} CareMatch AI. All rights reserved.</p>
          <p className="mt-1">Empowering health access for everyone.</p>
        </div>
      </footer>
    </div>
  );
}
