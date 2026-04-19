'use client';

import React, { memo } from 'react';
import { useApp } from '@/context/TradeNewsCastContext';
import { VoiceWave } from './VoiceWave';

const Sep = () => (
  <div className="w-px h-6 bg-tnc-border2 flex-shrink-0" />
);

const Btn = memo(function Btn({
  onClick, className = '', children, title,
}: {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
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
    activeFeedItem,
    toggleAuto, togglePause, stopAll, replayLast, skipCurrent,
    openSettings,
  } = useApp();

  const nowReadingItem = useApp().allItems.find(i => i._id === activeFeedItem);
  const nowReadingText = nowReadingItem
    ? nowReadingItem.headline.slice(0, 65) + '…'
    : '—';

  return (
    <div className="bg-tnc-bg3 border-b border-tnc-border px-4 py-[6px] flex items-center gap-[10px] flex-wrap flex-shrink-0 min-h-[44px]">
      {/* Auto read toggle */}
      <button
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

      {/* Pause — only when auto is on */}
      {autoOn && (
        <button
          onClick={togglePause}
          className="font-mono text-[10px] font-medium tracking-[0.5px] px-3 h-7 rounded-[3px] border border-tnc-border2 bg-transparent text-tnc-text cursor-pointer hover:border-tnc-accent hover:text-tnc-accent transition-all duration-150 whitespace-nowrap"
        >
          {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
        </button>
      )}

      {/* Stop — only when playing */}
      {isPlaying && (
        <button
          onClick={stopAll}
          className="font-mono text-[10px] font-medium tracking-[0.5px] px-3 h-7 rounded-[3px] border border-tnc-red text-tnc-red bg-transparent cursor-pointer hover:bg-tnc-red hover:text-white transition-all duration-150 whitespace-nowrap"
        >
          ■ STOP
        </button>
      )}

      <Btn onClick={replayLast} title="Replay last">↩ REPLAY</Btn>
      <Btn onClick={skipCurrent} title="Skip current">⏭ SKIP</Btn>

      {/* <Sep />

      Now reading
      <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[360px]">
        <VoiceWave visible={isPlaying && !isPaused} />
        <span className="font-mono text-[9px] text-tnc-muted tracking-[1.5px] whitespace-nowrap">
          NOW READING
        </span>
        <span className="font-mono text-[10px] text-tnc-accent whitespace-nowrap overflow-hidden text-ellipsis flex-1">
          {nowReadingText}
        </span>
      </div>

      <Sep /> */}

      <Btn onClick={openSettings}><span className="text-[18px] leading-none">⚙</span> RULES</Btn>
    </div>
  );
});
