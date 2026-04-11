'use client';

import React, { memo } from 'react';
import { MARKET_QUOTES } from '@/lib/seedData';

const dirClass: Record<string, string> = {
  up: 'text-tnc-green',
  dn: 'text-tnc-red',
  fl: 'text-tnc-text2',
};

export const MarketGrid = memo(function MarketGrid() {
  return (
    <div className="border-b border-tnc-border">
      <div className="px-3 py-[7px] font-mono text-[9px] font-semibold tracking-[2px] uppercase text-tnc-muted bg-tnc-bg border-b border-tnc-border">
        MARKETS
      </div>
      <div className="grid grid-cols-2">
        {MARKET_QUOTES.map(q => (
          <div
            key={q.name}
            className="px-3 py-2 border-r border-b border-tnc-border odd:border-r even:border-r-0"
          >
            <div className="font-mono text-[9px] text-tnc-text3 tracking-[0.5px] uppercase mb-[2px]">
              {q.name}
            </div>
            <div className="font-mono text-[14px] font-semibold text-white tracking-[-0.3px]">
              {q.price}
            </div>
            <div className={`font-mono text-[9px] mt-[1px] tracking-[0.2px] ${dirClass[q.direction]}`}>
              {q.change}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
