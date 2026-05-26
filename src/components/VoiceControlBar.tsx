'use client';

import React, { memo } from 'react';
import { useApp } from '@/context/TradeNewsCastContext';
import { VoiceWave } from './VoiceWave';

const Sep = () => (
  <div className="w-px h-6 bg-tnc-border2 flex-shrink-0" />
);

const Btn = memo(function Btn({
  onClick, className = '', children, title, ariaLabel,
}: {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
  title?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={ariaLabel ?? title}
      className={
        `font-mono text-[10px] font-medium tracking-[0.5px] px-3 h-7
         rounded-[3px] border border-tnc-border2 bg-transparent text-tnc-text
         cursor-pointer transition-all duration-150 whitespace-nowrap
         hover:border-tnc-accent hover:text-tnc-accent ${className}`
      }
    >
      {children}
    </button>
  );
});

export const VoiceControlBar = memo(function VoiceControlBar() {
  const {
    autoOn, isPlaying, isPaused,
    activeFeedItem, allItems,
    toggleAuto, togglePause, stopAll, replayLast, skipCurrent,
    openSettings, setMobileSidebarOpen,
  } = useApp();

  const nowReadingItem = allItems.find(i => i._id === activeFeedItem);
  const nowReadingText = nowReadingItem
    ? nowReadingItem.headline.slice(0, 65) + '…'
    : '—';

  return (
    <div className="bg-tnc-bg3 border-b border-tnc-border px-4 py-[6px] flex items-center gap-[10px] flex-wrap flex-shrink-0 min-h-[44px]">
      <button
        type="button"
        aria-label={autoOn ? 'Turn auto read off' : 'Turn auto read on'}
        onClick={toggleAuto}
        className={`
          font-mono text-[10px] font-medium tracking-[0.5px] px-3 h-7
          rounded-[3px] border cursor-pointer transition-all duration-150 whitespace-nowrap
          ${autoOn
            ? 'bg-tnc-green border-tnc-green text-black font-semibold hover:opacity-90'
            : 'border-tnc-green text-tnc-green hover:bg-tnc-green hover:text-black'
          }
        `}
      >
        {autoOn ? '▶ AUTO READ' : '⏹ AUTO OFF'}
      </button>

      {autoOn && (
        <button
          type="button"
          aria-label={isPaused ? 'Resume reading' : 'Pause reading'}
          onClick={togglePause}
          className="font-mono text-[10px] font-medium tracking-[0.5px] px-3 h-7 rounded-[3px] border border-tnc-border2 bg-transparent text-tnc-text cursor-pointer hover:border-tnc-accent hover:text-tnc-accent transition-all duration-150 whitespace-nowrap"
        >
          {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
      )}

      {isPlaying && (
        <button
          type="button"
          aria-label="Stop reading and clear queue"
          onClick={stopAll}
          className="font-mono text-[10px] font-medium tracking-[0.5px] px-3 h-7 rounded-[3px] border border-tnc-red text-tnc-red bg-transparent cursor-pointer hover:bg-tnc-red hover:text-white transition-all duration-150 whitespace-nowrap"
        >
          ■ STOP
        </button>
      )}

      <Btn onClick={replayLast} title="Replay last (Left arrow)" ariaLabel="Replay last item">↩ REPLAY</Btn>
      <Btn onClick={skipCurrent} title="Skip current (Right arrow)" ariaLabel="Skip current item">⏭ SKIP</Btn>

      <Sep />

      <div className="hidden sm:flex items-center gap-2 flex-1 min-w-0 max-w-[360px]">
        <VoiceWave visible={isPlaying && !isPaused} />
        <span className="font-mono text-[9px] text-tnc-muted tracking-[1.5px] whitespace-nowrap">
          NOW READING
        </span>
        <span className="font-mono text-[10px] text-tnc-accent whitespace-nowrap overflow-hidden text-ellipsis flex-1">
          {nowReadingText}
        </span>
      </div>

      <Sep />

      <Btn
        onClick={() => setMobileSidebarOpen(true)}
        title="Open queue, history, and watchlist"
        ariaLabel="Open sidebar panels"
        className="lg:hidden"
      >
        ☰ PANELS
      </Btn>

      <Btn onClick={openSettings} title="Open rules and settings" ariaLabel="Open rules and settings">
        <span className="text-[18px] leading-none" aria-hidden>⚙</span> RULES
      </Btn>

      <span className="hidden xl:inline font-mono text-[8px] text-tnc-text3 tracking-[0.5px] whitespace-nowrap">
        Space pause · ← replay · → skip · M mute 5m
      </span>
    </div>
  );
});
