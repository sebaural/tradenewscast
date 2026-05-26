'use client';

import React, { memo } from 'react';
import { useApp } from '@/context/TradeNewsCastContext';
import { PriorityBadge } from './PriorityBadge';

export const QueueList = memo(function QueueList() {
  const { readQueue, clearQueue } = useApp();

  return (
    <div className="border-b border-tnc-border">
      <div className="px-3 py-[7px] font-mono text-[9px] font-semibold tracking-[2px] uppercase text-tnc-muted bg-tnc-bg border-b border-tnc-border flex justify-between items-center">
        <span>READ QUEUE</span>
        <button
          type="button"
          aria-label="Clear read queue"
          onClick={clearQueue}
          className="text-[9px] text-tnc-text3 cursor-pointer bg-transparent border-none font-mono hover:text-tnc-accent"
        >
          CLEAR
        </button>
      </div>

      <div className="overflow-y-auto max-h-40 scrollbar-thin scrollbar-thumb-tnc-border2">
        {readQueue.length === 0 ? (
          <div className="px-3 py-[10px] font-mono text-[10px] text-tnc-text3">
            Queue empty
          </div>
        ) : (
          readQueue.slice(0, 8).map((item, i) => (
            <div
              key={item._id}
              className="px-3 py-[7px] border-b border-tnc-border flex gap-[7px] items-start"
            >
              <span
                className={`font-mono text-[9px] w-[14px] flex-shrink-0 pt-[2px] ${
                  i === 0 ? 'text-tnc-accent' : 'text-tnc-text3'
                }`}
              >
                {i === 0 ? '▶' : i + 1}
              </span>
              <span className="text-[11px] text-tnc-text2 leading-[1.35] flex-1">
                {item.headline.slice(0, 72)}…
              </span>
              <div className="ml-auto flex-shrink-0">
                <PriorityBadge priority={item.priority} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
