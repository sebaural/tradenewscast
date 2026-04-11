'use client';

import React, { memo } from 'react';
import { useApp } from '@/context/TradeNewsCastContext';

function Slider({
  label,
  min, max, step, value,
  displayValue,
  onChange,
}: {
  label: string;
  min: number; max: number; step: number; value: number;
  displayValue: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-[6px] mb-[6px]">
      <span className="font-mono text-[9px] text-tnc-text2 tracking-[0.3px] w-[70px] flex-shrink-0">
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="flex-1 h-[3px] bg-tnc-border2 rounded-[2px] outline-none cursor-pointer accent-tnc-accent"
      />
      <span className="font-mono text-[10px] text-tnc-accent min-w-[32px] text-right">
        {displayValue}
      </span>
    </div>
  );
}

export const AudioSettings = memo(function AudioSettings() {
  const { voiceSettings, setVoiceSettings } = useApp();
  const { pitch, volume, gap } = voiceSettings;

  return (
    <div className="border-b border-tnc-border">
      <div className="px-3 py-[7px] font-mono text-[9px] font-semibold tracking-[2px] uppercase text-tnc-muted bg-tnc-bg border-b border-tnc-border">
        AUDIO
      </div>
      <div className="px-3 py-2">
        <Slider
          label="PITCH"
          min={0.8} max={1.2} step={0.05} value={pitch}
          displayValue={pitch.toFixed(2)}
          onChange={v => setVoiceSettings({ pitch: v })}
        />
        <Slider
          label="VOLUME"
          min={0.4} max={1} step={0.05} value={volume}
          displayValue={volume.toFixed(2)}
          onChange={v => setVoiceSettings({ volume: v })}
        />
        <Slider
          label="GAP"
          min={0.5} max={5} step={0.5} value={gap}
          displayValue={`${gap}s`}
          onChange={v => setVoiceSettings({ gap: v })}
        />
      </div>
    </div>
  );
});
