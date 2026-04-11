'use client';

import dynamic from 'next/dynamic';
import { TradeNewsCastProvider } from '@/context/TradeNewsCastContext';
import { TickerBar }       from '@/components/TickerBar';
import { AppHeader }       from '@/components/AppHeader';
import { VoiceControlBar } from '@/components/VoiceControlBar';

// Code-split heavy components loaded client-side
const NewsFeed           = dynamic(() => import('@/components/NewsFeed').then(m => ({ default: m.NewsFeed })),           { ssr: false });
const Sidebar            = dynamic(() => import('@/components/Sidebar').then(m => ({ default: m.Sidebar })),             { ssr: false });
const SettingsModal      = dynamic(() => import('@/components/SettingsModal').then(m => ({ default: m.SettingsModal })), { ssr: false });
const NotificationToast  = dynamic(() => import('@/components/NotificationToast').then(m => ({ default: m.NotificationToast })), { ssr: false });

export default function Page() {
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
