'use client';

import React, { memo } from 'react';
import { TICKER_ITEMS } from '@/lib/seedData';

const dirClass: Record<string, string> = {
  up: 'text-tnc-green',
  dn: 'text-tnc-red',
  fl: 'text-tnc-muted',
};

/**
 * Scrolling market ticker bar at the very top of the app.
 * Items are duplicated in seedData.ts so the CSS animation loops seamlessly.
 */
export const TickerBar = memo(function TickerBar() {
  return (
    <div className="h-[26px] bg-tnc-accent flex items-center flex-shrink-0 overflow-hidden">
      {/* LIVE label */}
      <div className="h-full px-3 bg-black flex items-center flex-shrink-0">
        <span className="font-mono text-[10px] font-semibold text-tnc-accent tracking-[2px] leading-none">
          LIVE
        </span>
      </div>

      {/* Scrolling track */}
      <div className="overflow-hidden flex-1">
        <div className="flex w-max animate-ticker whitespace-nowrap">
          {TICKER_ITEMS.map((item, i) => (
            <span
              key={i}
              className="font-mono text-[10px] font-semibold text-black px-6"
            >
              {item.label}{' '}
              <span className={dirClass[item.direction]}>
                {item.value}
              </span>
              {item.suffix && (
                <span className="text-black/60 ml-1">{item.suffix}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});
