'use client';

import React, { memo } from 'react';
import { useApp } from '@/context/TradeNewsCastContext';
import { MarketGrid } from './MarketGrid';
import { QueueList } from './QueueList';
import { HistoryList } from './HistoryList';
import { WatchList } from './WatchList';
import { ActiveRules } from './ActiveRules';
import { AudioSettings } from './AudioSettings';

function StatBox({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="py-2 px-3 text-center border-r border-tnc-border last:border-r-0">
      <div className="font-mono text-base font-semibold text-tnc-accent">{value}</div>
      <div className="font-mono text-[8px] text-tnc-text3 tracking-[0.8px] uppercase mt-[2px]">
        {label}
      </div>
    </div>
  );
}

export const Sidebar = memo(function Sidebar() {
  const { allItems, readCount, readQueue } = useApp();
  const p1Count = allItems.filter(i => i.priority === 1).length;

  return (
    <div className="hidden lg:flex flex-col overflow-hidden bg-tnc-bg2">
      {/* Stats row */}
      <div className="grid grid-cols-4 border-b border-tnc-border flex-shrink-0">
        <StatBox value={allItems.length} label="TOTAL"   />
        <StatBox value={readCount}       label="READ"    />
        <StatBox value={p1Count}         label="P1 HOT"  />
        <StatBox value={readQueue.length} label="QUEUE"  />
      </div>

      <MarketGrid />
      <QueueList />
      <HistoryList />
      <WatchList />
      <ActiveRules />
      <AudioSettings />
    </div>
  );
});
