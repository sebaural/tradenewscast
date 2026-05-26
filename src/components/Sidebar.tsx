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

function SidebarPanels() {
  const { allItems, readCount, readQueue } = useApp();
  const p1Count = allItems.filter(i => i.priority === 1).length;

  return (
    <>
      <div className="grid grid-cols-4 border-b border-tnc-border flex-shrink-0">
        <StatBox value={allItems.length} label="TOTAL" />
        <StatBox value={readCount} label="READ" />
        <StatBox value={p1Count} label="P1 HOT" />
        <StatBox value={readQueue.length} label="QUEUE" />
      </div>
      <MarketGrid />
      <QueueList />
      <HistoryList />
      <WatchList />
      <ActiveRules />
      <AudioSettings />
    </>
  );
}

export const Sidebar = memo(function Sidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useApp();

  return (
    <>
      <div className="hidden lg:flex flex-col overflow-hidden bg-tnc-bg2">
        <SidebarPanels />
      </div>

      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="relative ml-auto w-[min(100%,320px)] h-full flex flex-col overflow-y-auto bg-tnc-bg2 border-l border-tnc-border shadow-xl">
            <div className="flex items-center justify-between px-3 py-2 border-b border-tnc-border flex-shrink-0">
              <span className="font-mono text-[9px] font-semibold tracking-[2px] text-tnc-muted uppercase">
                Terminal Panels
              </span>
              <button
                type="button"
                aria-label="Close panels"
                onClick={() => setMobileSidebarOpen(false)}
                className="font-mono text-[10px] text-tnc-text3 hover:text-tnc-accent px-2 py-1"
              >
                ✕
              </button>
            </div>
            <SidebarPanels />
          </aside>
        </div>
      )}
    </>
  );
});
