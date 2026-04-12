'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { TradeNewsCastProvider } from '@/context/TradeNewsCastContext';
import { TickerBar }       from '@/components/TickerBar';
import { AppHeader }       from '@/components/AppHeader';
import { VoiceControlBar } from '@/components/VoiceControlBar';
import { unlockAudio }     from '@/lib/audioUtils';

// Code-split heavy components loaded client-side
const NewsFeed           = dynamic(() => import('@/components/NewsFeed').then(m => ({ default: m.NewsFeed })),           { ssr: false });
const Sidebar            = dynamic(() => import('@/components/Sidebar').then(m => ({ default: m.Sidebar })),             { ssr: false });
const SettingsModal      = dynamic(() => import('@/components/SettingsModal').then(m => ({ default: m.SettingsModal })), { ssr: false });
const NotificationToast  = dynamic(() => import('@/components/NotificationToast').then(m => ({ default: m.NotificationToast })), { ssr: false });

export default function Page() {
  // Unlock AudioContext on first user gesture so playBeep() works in all browsers.
  useEffect(() => {
    const unlock = () => {
      unlockAudio();
      document.removeEventListener('click',      unlock, true);
      document.removeEventListener('keydown',    unlock, true);
      document.removeEventListener('touchstart', unlock, true);
    };
    document.addEventListener('click',      unlock, { capture: true, once: true });
    document.addEventListener('keydown',    unlock, { capture: true, once: true });
    document.addEventListener('touchstart', unlock, { capture: true, once: true });
    return () => {
      document.removeEventListener('click',      unlock, true);
      document.removeEventListener('keydown',    unlock, true);
      document.removeEventListener('touchstart', unlock, true);
    };
  }, []);

  return (
    <TradeNewsCastProvider>
      {/* Scrolling market ticker */}
      <TickerBar />

      {/* Logo / status / clock */}
      <AppHeader />

      {/* Voice controls */}
      <VoiceControlBar />

      {/* Two-column main area */}
      <main className="grid lg:grid-cols-[1fr_300px] flex-1 overflow-hidden">
        <NewsFeed />
        <Sidebar />
      </main>

      {/* Overlays */}
      <SettingsModal />
      <NotificationToast />
    </TradeNewsCastProvider>
  );
}
