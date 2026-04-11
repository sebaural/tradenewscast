'use client';

import React, { memo, useRef } from 'react';
import { useApp } from '@/context/TradeNewsCastContext';

export const WatchList = memo(function WatchList() {
  const { watchlist, addWatchword, removeWatchword } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return;
    const val = inputRef.current?.value.trim().toUpperCase() ?? '';
    if (val) addWatchword(val);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="border-b border-tnc-border">
      <div className="px-3 py-[7px] font-mono text-[9px] font-semibold tracking-[2px] uppercase text-tnc-muted bg-tnc-bg border-b border-tnc-border">
        WATCHLIST
      </div>
      <div className="px-3 py-2">
        <input
          ref={inputRef}
          type="text"
          placeholder="Add ticker or keyword (ENTER)…"
          onKeyDown={handleKeyDown}
          className="
            font-mono text-[10px] bg-tnc-bg text-tnc-text
            border border-tnc-border2 rounded-[3px] px-2 py-1
            w-full outline-none mb-[6px]
            focus:border-tnc-accent transition-colors
          "
        />
        <div className="flex flex-wrap gap-1">
          {watchlist.map(w => (
            <button
              key={w}
              onClick={() => removeWatchword(w)}
              title="Click to remove"
              className="
                font-mono text-[9px] px-[7px] py-[2px] tracking-[0.5px]
                bg-tnc-purple/10 text-tnc-purple border border-tnc-purple/20
                rounded-[2px] cursor-pointer
                hover:bg-tnc-red/10 hover:text-tnc-red hover:border-tnc-red/20
                transition-colors
              "
            >
              {w}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
