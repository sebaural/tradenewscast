'use client';

import React, { memo } from 'react';
import { useApp } from '@/context/TradeNewsCastContext';
import { VoiceWave } from './VoiceWave';
import type { ReadingMode } from '@/types';

const RATE_OPTIONS = [
  { value: '0.85', label: '0.85×' },
  { value: '0.92', label: '0.92×' },
  { value: '1.0',  label: '1.0×'  },
  { value: '1.1',  label: '1.1×'  },
  { value: '1.25', label: '1.25×' },
];

const MODE_OPTIONS: { value: ReadingMode; label: string }[] = [
  { value: 'headline',  label: 'HEADLINE ONLY'       },
  { value: 'summary',   label: 'HEADLINE + CONTEXT'  },
  { value: 'breaking',  label: 'BREAKING ONLY'       },
  { value: 'watchlist', label: 'WATCHLIST ONLY'      },
  { value: 'full',      label: 'FULL READ'           },
];

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

const SelectEl = memo(function SelectEl({
  value, onChange, children, className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={
        `font-mono text-[10px] bg-tnc-bg text-tnc-text
         border border-tnc-border2 rounded-[3px] px-2 h-7
         cursor-pointer outline-none ${className}`
      }
    >
      {children}
    </select>
  );
});

export const VoiceControlBar = memo(function VoiceControlBar() {
  const {
    autoOn, isPlaying, isPaused, readingMode, voiceSettings, voices,
    activeFeedItem,
    toggleAuto, togglePause, stopAll, replayLast, skipCurrent,
    muteMins, openSettings,
    setReadingMode, setVoiceSettings,
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

      <Sep />

      {/* Reading mode */}
      <SelectEl
        value={readingMode}
        onChange={v => setReadingMode(v as ReadingMode)}
      >
        {MODE_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </SelectEl>

      <Sep />

      {/* Now reading */}
      <div className="flex items-center gap-2 flex-1 min-w-0 max-w-[360px]">
        <VoiceWave visible={isPlaying && !isPaused} />
        <span className="font-mono text-[9px] text-tnc-muted tracking-[1.5px] whitespace-nowrap">
          NOW READING
        </span>
        <span className="font-mono text-[10px] text-tnc-accent whitespace-nowrap overflow-hidden text-ellipsis flex-1">
          {nowReadingText}
        </span>
      </div>

      <Sep />

      <Btn onClick={() => muteMins(5)}>MUTE 5m</Btn>
      <Btn onClick={() => muteMins(15)}>MUTE 15m</Btn>
      <Btn onClick={openSettings}>⚙ RULES</Btn>

      {/* Voice selector */}
      <SelectEl
        value={voiceSettings.selectedVoiceName}
        onChange={v => setVoiceSettings({ selectedVoiceName: v })}
        className="max-w-[140px]"
      >
        {voices.map(v => (
          <option key={v.name} value={v.name}>
            {v.name.replace('Google ', '').replace('Microsoft ', '').slice(0, 26)}
          </option>
        ))}
      </SelectEl>

      {/* Rate selector */}
      <SelectEl
        value={String(voiceSettings.rate)}
        onChange={v => setVoiceSettings({ rate: parseFloat(v) })}
      >
        {RATE_OPTIONS.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </SelectEl>
    </div>
  );
});
