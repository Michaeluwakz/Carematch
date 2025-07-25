'use client';
import { useEffect, useRef } from 'react';

export function ElevenLabsWidget() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!document.getElementById('elevenlabs-convai-script')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      script.id = 'elevenlabs-convai-script';
      document.body.appendChild(script);
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = '<elevenlabs-convai agent-id="agent_01jxmmmxc2fqsbrqtyayyk4br4"></elevenlabs-convai>';
    }
  }, []);

  return (
    <div className="my-4" ref={containerRef}></div>
  );
} 