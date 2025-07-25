'use client';

import { useState } from 'react';
import { MentalHealthChatScreen } from '@/components/mental-health/mental-health-chat';
import { Button } from '@/components/ui/button';
import { ElevenLabsWidget } from '@/components/mental-health/ElevenLabsWidget';

export default function MentalHealthCompanionPage() {
  const [showVoice, setShowVoice] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold mb-2 text-primary">AI Mental Health Companion</h1>
      <p className="mb-6 text-muted-foreground">A supportive space to share your thoughts and feelings. Not a replacement for professional help. Choose between text chat and our voice AI companion.</p>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowVoice(v => !v)} variant="outline">
          {showVoice ? 'Switch to Chat' : 'Switch to Voice Companion'}
        </Button>
      </div>
      {showVoice ? (
        <section>
          <h2 className="text-lg font-semibold mb-2">AI Voice Companion (Powered by ElevenLabs)</h2>
          <ElevenLabsWidget />
        </section>
      ) : (
        <MentalHealthChatScreen />
      )}
      <div className="mt-8 p-4 rounded-md bg-destructive/10 border border-destructive/30">
        <p className="text-xs text-destructive">
          Please remember, I am an AI companion and not a substitute for professional medical advice, diagnosis, or treatment. If you are experiencing significant distress or a mental health crisis, please consult with a qualified healthcare professional or a crisis support service immediately.
        </p>
      </div>
    </div>
  );
}
