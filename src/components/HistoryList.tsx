'use client';

import React, { memo } from 'react';
import { useApp } from '@/context/TradeNewsCastContext';

export const HistoryList = memo(function HistoryList() {
  const { history, clearHistory, readSingle } = useApp();

  return (
    <div className="border-b border-tnc-border">
      <div className="px-3 py-[7px] font-mono text-[9px] font-semibold tracking-[2px] uppercase text-tnc-muted bg-tnc-bg border-b border-tnc-border flex justify-between items-center">
        <span>SPOKEN HISTORY</span>
        <button
          onClick={clearHistory}
          className="text-[9px] text-tnc-text3 cursor-pointer bg-transparent border-none font-mono hover:text-tnc-accent"
        >
          CLEAR
        </button>
      </div>
      <div className="overflow-y-auto max-h-[140px] scrollbar-thin scrollbar-thumb-tnc-border2">
        {history.length === 0 ? (
          <div className="px-3 py-[10px] font-mono text-[10px] text-tnc-text3">
            Nothing read yet
          </div>
        ) : (
          history.slice(0, 15).map((entry, i) => (
            <div
              key={`${entry.item._id}-${i}`}
              className="px-3 py-[6px] border-b border-tnc-border flex gap-[6px] items-center"
            >
              <span className="font-mono text-[9px] text-tnc-text3 whitespace-nowrap">
                {entry.readAt}
              </span>
              <span className="text-[10px] text-tnc-text2 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {entry.item.headline.slice(0, 55)}…
              </span>
              <button
                onClick={() => readSingle(entry.item._id)}
                className="font-mono text-[8px] text-tnc-text3 cursor-pointer flex-shrink-0 bg-transparent border border-tnc-border rounded-[2px] px-[5px] py-[1px] hover:text-tnc-accent hover:border-tnc-accent"
              >
                ↩
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
});
