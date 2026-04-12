'use client';

import React, { memo } from 'react';
import { useClock } from '@/hooks/useClock';
import { useApp } from '@/context/TradeNewsCastContext';
import type { AppState } from '@/types';

// ── Status pill ───────────────────────────────────────────────────────────

const statusStyles: Record<AppState['parseStatus'], string> = {
  live:    'border-tnc-green/30 text-tnc-green',
  parsing: 'border-tnc-accent/30 text-tnc-accent animate-blink',
  error:   'border-tnc-red/30   text-tnc-red',
};

/* function StatusPill() {
  const { parseStatus, parseStatusText } = useApp();
  return (
    <div
      className={
        `flex items-center gap-[5px] font-mono text-[10px] tracking-[1px]
         px-[10px] py-[3px] rounded-[3px] border ${statusStyles[parseStatus]}`
      }
    >
      <span className="w-[6px] h-[6px] rounded-full bg-current animate-pulse-dot" />
      <span>{parseStatusText}</span>
    </div>
  );
} */

// ── Main header ───────────────────────────────────────────────────────────

export const AppHeader = memo(function AppHeader() {
  const clock = useClock();

  return (
    <header className="bg-tnc-bg2 border-b border-tnc-border h-12 px-4 flex items-center justify-between flex-shrink-0">
      {/* Logo */}
      <div className="font-mono text-[1.5rem] font-semibold text-white tracking-[-0.5px]">
        Trade<span className="text-tnc-accent">News</span>Cast{' '}
        {/* <span className="text-[10px] text-tnc-text3 font-normal tracking-[0.5px] ml-2">
          VOICE INTELLIGENCE
        </span> */}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* <StatusPill /> */}

        {/* Live feed badge */}
        <div className="flex items-center gap-[5px] font-mono text-[10px] tracking-[1px] px-[10px] py-[3px] rounded-[3px] border border-tnc-green/30 text-tnc-green">
          <span className="w-[6px] h-[6px] rounded-full bg-current animate-pulse-dot" />
          <span>LIVE FEED</span>
        </div>

        <span className="font-mono text-[11px] text-tnc-text2 tracking-[0.5px]">
          {clock}
        </span>
      </div>
    </header>
  );
});
