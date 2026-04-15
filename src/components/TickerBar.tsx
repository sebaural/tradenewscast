'use client';

import React, { memo } from 'react';
import { TICKER_ITEMS } from '@/lib/seedData';

const dirClass: Record<string, string> = {
  up: 'text-tnc-green',
  dn: 'text-tnc-red',
  fl: 'text-[#aaa]',
};

/**
 * Scrolling market ticker bar at the very top of the app.
 * Items are duplicated in seedData.ts so the CSS animation loops seamlessly.
 */
export const TickerBar = memo(function TickerBar() {
  return (
    <div className="flex h-[32px] flex-shrink-0 items-center overflow-hidden border-b border-[#666] bg-[#06090d] shadow-[inset_0_1px_0_rgba(74,158,255,0.08)]">
      <div className="flex h-full w-[34px] flex-shrink-0 items-center justify-center border-r border-[#1a2331] bg-[#0a0f15]">
        <img className="h-[32px] w-[34px]" src="/TNC_logo.png" alt="TradeNewsCast" />
      </div>

      {/* Scrolling track */}
      <div className="flex-1 overflow-hidden">
        <div className="flex w-max animate-ticker whitespace-nowrap">
          {TICKER_ITEMS.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 border-l border-[#0f4fc9] px-5 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#aeb7c2] first:border-l-0"
            >
              <span className="text-[#b8c1cb]">{item.label}</span>
              <span className={`${dirClass[item.direction]} tabular-nums`}>
                {item.value}
              </span>
              {item.suffix && (
                <span className="text-[#8e98a4]">{item.suffix}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
});
