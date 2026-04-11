'use client';

import React, { memo } from 'react';

/** Animated equaliser wave shown while TTS is active */
export const VoiceWave = memo(function VoiceWave({ visible }: { visible: boolean }) {
  if (!visible) return null;
  const bars = [
    { h: 'h-[6px]',  delay: 'delay-[0ms]' },
    { h: 'h-[12px]', delay: 'delay-[100ms]' },
    { h: 'h-[16px]', delay: 'delay-[180ms]' },
    { h: 'h-[10px]', delay: 'delay-[120ms]' },
    { h: 'h-[5px]',  delay: 'delay-[50ms]' },
  ];
  return (
    <div className="flex items-center gap-[2px] flex-shrink-0">
      {bars.map((b, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-[1px] bg-tnc-accent ${b.h} ${b.delay} [animation:wave_0.7s_ease-in-out_infinite]`}
        />
      ))}
    </div>
  );
});
