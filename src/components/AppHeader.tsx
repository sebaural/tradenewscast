'use client';

import React, { memo } from 'react';
import Link from 'next/link';
import { useClock } from '@/hooks/useClock';
import { useApp } from '@/context/TradeNewsCastContext';
import type { AppState } from '@/types';

const statusStyles: Record<AppState['parseStatus'], string> = {
  live:    'border-tnc-green/30 text-tnc-green',
  parsing: 'border-tnc-accent/30 text-tnc-accent animate-blink',
  error:   'border-tnc-red/30   text-tnc-red',
};

function StatusPill() {
  const { parseStatus, parseStatusText } = useApp();
  return (
    <div
      className={
        `flex items-center gap-[5px] font-mono text-[10px] tracking-[1px]
         px-[10px] py-[3px] rounded-[3px] border ${statusStyles[parseStatus]}`
      }
    >
      <span className="w-[6px] h-[6px] rounded-full bg-current animate-pulse-dot" />
      <span className="whitespace-nowrap">{parseStatusText}</span>
    </div>
  );
}

export const AppHeader = memo(function AppHeader() {
  const clock = useClock();

  return (
    <header className="main-header bg-tnc-bg2 border-b border-tnc-border h-12 pl-4 pr-0 sm:px-4 flex items-center justify-between flex-shrink-0">
      <Link href="/" className="site-logo font-mono text-[1.5rem] font-semibold text-white tracking-[-0.5px]">
        Trade<span className="text-tnc-accent">News</span>Cast
      </Link>

      <nav aria-label="Primary" className="flex items-center flex-1 justify-end ml-4">
        <Link
          href="/podcasts"
          className="podcasts font-mono text-[14px] uppercase tracking-[1.6px] text-tnc-text hover:text-tnc-accent transition-colors px-2 py-1 mr-2 border border-tnc-text hover:border-tnc-accent rounded-[3px]"
        >
          Podcasts
        </Link>
      </nav>

      <div className="status-block flex items-center gap-2 max-[375px]:gap-1 sm:gap-4 mr-[10px] sm:mr-0">
        <StatusPill />

        <span className="font-mono text-[11px] max-[375px]:text-[10px] text-tnc-text2 tracking-[0.5px] whitespace-nowrap flex-shrink-0">
          {clock}
        </span>
      </div>
    </header>
  );
});
