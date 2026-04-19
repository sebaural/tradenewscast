'use client';

import React, { memo, useMemo } from 'react';
import { useApp } from '@/context/TradeNewsCastContext';
import { NewsItem } from './NewsItem';
import { useTodayLabel } from '@/hooks/useTodayLabel';
import type { FilterType } from '@/types';

// ── Filter buttons ─────────────────────────────────────────────────────────

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all',   label: 'All Categories'       },
  { key: 'oil',   label: 'OIL'       },
  { key: 'iran',  label: 'IRAN/GEO'  },
  { key: 'fed',   label: 'FED'       },
  { key: 'macro', label: 'MACRO'     },
  { key: 'break', label: '🔴 BREAK'  },
];

// ── NewsFeed ───────────────────────────────────────────────────────────────

export const NewsFeed = memo(function NewsFeed() {
  const { allItems, currentFilter, setFilter } = useApp();
  const todayLabel = useTodayLabel();

  const filtered = useMemo(() => {
    if (currentFilter === 'all')   return allItems;
    if (currentFilter === 'break') return allItems.filter(i => i.isBreaking);
    return allItems.filter(i => i.tags.includes(currentFilter));
  }, [allItems, currentFilter]);

  return (
    <div className="flex flex-col overflow-hidden border-r border-tnc-border">
      {/* Column header */}
      <div className="bg-tnc-bg2 border-b border-tnc-border px-[14px] py-1 sm:py-2 flex items-center items-start sm:items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-[10px]">
          <span className="font-mono text-[9px] font-semibold tracking-[2px] uppercase text-tnc-muted">
            INTELLIGENCE FEED
          </span>
          <span className="font-mono text-[9px] bg-tnc-accent/10 text-tnc-accent border border-tnc-accent/20 px-[7px] py-[1px] rounded-[10px] mr-[8px] sm:mr-0 text-center">
            {allItems.length} items
          </span>
        </div>
        <select
          value={currentFilter}
          onChange={e => setFilter(e.target.value as FilterType)}
          className="
            font-mono text-[9px] cursor-pointer
            bg-tnc-bg2 border border-tnc-border2 text-tnc-text2
            rounded-[2px] px-[7px] py-[2px] pr-[20px]
            appearance-none
            focus:outline-none focus:border-tnc-accent focus:text-tnc-accent
            hover:border-tnc-accent hover:text-tnc-accent
            transition-all duration-150
          "
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='5' viewBox='0 0 8 5'%3E%3Cpath d='M0 0l4 5 4-5z' fill='%236b7280'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
        >
          {FILTERS.map(f => (
            <option key={f.key} value={f.key}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Scrollable feed */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-tnc-border2">
        {/* Today divider (sticky) */}
        <div className="sticky top-0 z-[3] px-[14px] py-[5px] font-mono text-[9px] tracking-[2px] text-tnc-text3 bg-tnc-bg uppercase border-b border-tnc-border">
          {todayLabel || '— —'}
        </div>

        {filtered.length === 0 ? (
          <div className="px-[14px] py-4 font-mono text-[10px] text-tnc-text3">
            No items match this filter
          </div>
        ) : (
          filtered.map((item, idx) => (
            <NewsItem
              key={item._id}
              item={item}
              isFresh={item._new && idx === 0}
            />
          ))
        )}
      </div>
    </div>
  );
});
