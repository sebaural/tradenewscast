'use client';

import React, { memo } from 'react';
import { useApp } from '@/context/TradeNewsCastContext';

export const ActiveRules = memo(function ActiveRules() {
  const { rules } = useApp();

  const on: string[] = [];
  if (rules.interrupt)     on.push('Interrupt for P1');
  if (rules.dedup)         on.push('Dedup');
  if (rules.skipP4)        on.push('Skip P4');
  if (rules.context)       on.push('Market context');
  if (rules.tone)          on.push('Alert tone');
  if (rules.stale)         on.push('Drop stale');
  if (rules.muteDividends) on.push('Mute dividends');
  if (rules.muteSports)    on.push('Mute sports');
  if (rules.muteCrypto)    on.push('Mute crypto');
  if (rules.mutRatings)    on.push('Mute ratings');

  return (
    <div className="flex-1 overflow-hidden flex flex-col border-b border-tnc-border">
      <div className="px-3 py-[7px] font-mono text-[9px] font-semibold tracking-[2px] uppercase text-tnc-muted bg-tnc-bg border-b border-tnc-border">
        ACTIVE RULES
      </div>
      <div className="overflow-y-auto px-3 py-[10px] scrollbar-thin scrollbar-thumb-tnc-border2">
        {on.map(r => (
          <div
            key={r}
            className="font-mono text-[9px] text-tnc-green py-[3px] border-b border-tnc-border tracking-[0.3px] last:border-0"
          >
            ✓ {r}
          </div>
        ))}
      </div>
    </div>
  );
});
