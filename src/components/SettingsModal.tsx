'use client';

import React, { memo } from 'react';
import { useApp } from '@/context/TradeNewsCastContext';
import type { InterruptPolicy, ReadingMode, Rules, TraderProfile } from '@/types';

// ── Toggle switch ─────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative w-7 h-[15px] flex-shrink-0 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="sr-only"
      />
      <div
        className={`
          absolute inset-0 rounded-lg transition-colors duration-200
          ${checked ? 'bg-tnc-accent' : 'bg-tnc-border2'}
        `}
      />
      <div
        className={`
          absolute top-[2px] w-[11px] h-[11px] rounded-full transition-all duration-200
          ${checked ? 'left-[14px] bg-black' : 'left-[2px] bg-tnc-text3'}
        `}
      />
    </label>
  );
}

// ── Rule row ──────────────────────────────────────────────────────────────

function RuleRow({
  label, sub, checked, onChange,
}: {
  label: string; sub?: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="bg-tnc-bg3 border border-tnc-border rounded-[4px] p-[8px_10px] flex items-center justify-between gap-2">
      <div>
        <div className="text-[11px] text-tnc-text">{label}</div>
        {sub && <div className="font-mono text-[9px] text-tnc-text3 mt-[2px]">{sub}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ── Policy / profile button ───────────────────────────────────────────────

function PolicyBtn({
  active, onClick, children,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        font-mono text-[10px] font-medium tracking-[0.5px] px-3 h-7
        rounded-[3px] border cursor-pointer transition-all duration-150 whitespace-nowrap
        ${active
          ? 'bg-tnc-accent border-tnc-accent text-black font-semibold'
          : 'border-tnc-border2 bg-transparent text-tnc-text hover:border-tnc-accent hover:text-tnc-accent'
        }
      `}
    >
      {children}
    </button>
  );
}

function SelectEl({
  value, onChange, children, className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={
        `font-mono text-[10px] bg-tnc-bg text-tnc-text
         border border-tnc-border2 rounded-[3px] px-2 h-8
         cursor-pointer outline-none hover:border-tnc-accent focus:border-tnc-accent ${className}`
      }
    >
      {children}
    </select>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────

const INTERRUPT_POLICIES: { value: InterruptPolicy; label: string }[] = [
  { value: 'always',   label: 'ALWAYS INTERRUPT'      },
  { value: 'critical', label: 'P1 ONLY (recommended)' },
  { value: 'never',    label: 'NEVER INTERRUPT'        },
];

const PROFILES: { value: TraderProfile; label: string }[] = [
  { value: 'scalper',   label: 'SCALPER'       },
  { value: 'daytrader', label: 'DAY TRADER'    },
  { value: 'swing',     label: 'SWING'         },
  { value: 'macro',     label: 'MACRO / FOREX' },
];

const RATE_OPTIONS = [
  { value: '0.85', label: '0.85×' },
  { value: '0.92', label: '0.92×' },
  { value: '1.0',  label: '1.0×'  },
  { value: '1.1',  label: '1.1×'  },
  { value: '1.25', label: '1.25×' },
];

const MODE_OPTIONS: { value: ReadingMode; label: string }[] = [
  { value: 'headline',  label: 'HEADLINE ONLY'       },
  { value: 'summary',   label: 'HEADLINE + CONTEXT'  },
  { value: 'breaking',  label: 'BREAKING ONLY'       },
  { value: 'watchlist', label: 'WATCHLIST ONLY'      },
  { value: 'full',      label: 'FULL READ'           },
];

export const SettingsModal = memo(function SettingsModal() {
  const {
    isSettingsOpen, closeSettings,
    readingMode, setReadingMode,
    voiceSettings, setVoiceSettings, voices,
    rules, setRules,
    interruptPolicy, setInterruptPolicy,
    muteMins, unmute,
    setProfile,
  } = useApp();

  if (!isSettingsOpen) return null;

  function patch(key: keyof Rules, value: boolean) {
    setRules({ [key]: value });
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 z-[300] flex items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) closeSettings(); }}
    >
      <div className="bg-tnc-bg2 border border-tnc-border2 rounded-[6px] w-[500px] max-w-[95vw] max-h-[80vh] overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-tnc-border2">
        {/* Title */}
        <div className="font-mono text-[12px] font-semibold tracking-[1px] text-white mb-4 flex justify-between items-center">
          <span>⚙ VOICE INTELLIGENCE RULES</span>
          <button
            onClick={closeSettings}
            className="bg-transparent border-none text-tnc-text2 cursor-pointer text-base px-1 hover:text-tnc-red"
          >
            ✕
          </button>
        </div>

        {/* Reading rules */}
        <section className="mb-4">
          <div className="font-mono text-[9px] tracking-[2px] text-tnc-muted uppercase mb-[10px] pb-[5px] border-b border-tnc-border">
            READING RULES
          </div>
          <div className="grid grid-cols-2 gap-2">
            <RuleRow label="Interrupt for P1 breaking news"   sub="War, Fed, CPI, sanctions, oil shock" checked={rules.interrupt}     onChange={v => patch('interrupt', v)} />
            <RuleRow label="Skip duplicate headlines"          sub="Same story from multiple sources"   checked={rules.dedup}         onChange={v => patch('dedup', v)} />
            <RuleRow label="Skip low-priority (P4) items"      sub="Routine updates and minor notes"    checked={rules.skipP4}        onChange={v => patch('skipP4', v)} />
            <RuleRow label="Add market context after reading"  sub="Why this item may matter for markets" checked={rules.context}     onChange={v => patch('context', v)} />
            <RuleRow label="Alert tone before P1 news"         sub="Short beep before critical headlines" checked={rules.tone}       onChange={v => patch('tone', v)} />
            <RuleRow label="Drop stale items from queue"       sub="Remove if older than 10 minutes"    checked={rules.stale}         onChange={v => patch('stale', v)} />
          </div>
        </section>

        {/* Mute categories */}
        <section className="mb-4">
          <div className="font-mono text-[9px] tracking-[2px] text-tnc-muted uppercase mb-[10px] pb-[5px] border-b border-tnc-border">
            MUTE CATEGORIES
          </div>
          <div className="grid grid-cols-2 gap-2">
            <RuleRow label="Mute analyst ratings"        checked={rules.mutRatings}    onChange={v => patch('mutRatings', v)} />
            <RuleRow label="Mute corporate dividends"    checked={rules.muteDividends} onChange={v => patch('muteDividends', v)} />
            <RuleRow label="Mute crypto news"            checked={rules.muteCrypto}    onChange={v => patch('muteCrypto', v)} />
            <RuleRow label="Mute sports &amp; entertainment" checked={rules.muteSports} onChange={v => patch('muteSports', v)} />
          </div>
        </section>

        {/* Interrupt policy */}
        <section className="mb-4">
          <div className="font-mono text-[9px] tracking-[2px] text-tnc-muted uppercase mb-[10px] pb-[5px] border-b border-tnc-border">
            INTERRUPT POLICY
          </div>
          <div className="flex gap-2 flex-wrap">
            {INTERRUPT_POLICIES.map(p => (
              <PolicyBtn
                key={p.value}
                active={interruptPolicy === p.value}
                onClick={() => setInterruptPolicy(p.value)}
              >
                {p.label}
              </PolicyBtn>
            ))}
          </div>
        </section>

        {/* Voice & reading */}
        <section className="mb-4">
          <div className="font-mono text-[9px] tracking-[2px] text-tnc-muted uppercase mb-[10px] pb-[5px] border-b border-tnc-border">
            VOICE & READING
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-tnc-bg3 border border-tnc-border rounded-[4px] p-[8px_10px]">
              <div className="font-mono text-[9px] tracking-[1.5px] text-tnc-text3 mb-[6px]">MODE</div>
              <SelectEl
                value={readingMode}
                onChange={v => setReadingMode(v as ReadingMode)}
                className="w-full"
              >
                {MODE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </SelectEl>
            </div>

            <div className="bg-tnc-bg3 border border-tnc-border rounded-[4px] p-[8px_10px]">
              <div className="font-mono text-[9px] tracking-[1.5px] text-tnc-text3 mb-[6px]">VOICE</div>
              <SelectEl
                value={voiceSettings.selectedVoiceName}
                onChange={v => setVoiceSettings({ selectedVoiceName: v })}
                className="w-full"
              >
                {voices.map(v => (
                  <option key={v.name} value={v.name}>
                    {v.lang.toLowerCase().replace('_', '-').startsWith('en-gb')
                      ? 'English (Great Britain)'
                      : 'English (America)'}
                  </option>
                ))}
              </SelectEl>
            </div>

            <div className="bg-tnc-bg3 border border-tnc-border rounded-[4px] p-[8px_10px]">
              <div className="font-mono text-[9px] tracking-[1.5px] text-tnc-text3 mb-[6px]">SPEED</div>
              <SelectEl
                value={String(voiceSettings.rate)}
                onChange={v => setVoiceSettings({ rate: parseFloat(v) })}
                className="w-full"
              >
                {RATE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </SelectEl>
            </div>
          </div>
        </section>

        {/* Mute timer */}
        <section className="mb-4">
          <div className="font-mono text-[9px] tracking-[2px] text-tnc-muted uppercase mb-[10px] pb-[5px] border-b border-tnc-border">
            MUTE TIMER
          </div>
          <div className="flex gap-[6px] flex-wrap">
            {([5, 60] as const).map(m => (
              <PolicyBtn key={m} active={false} onClick={() => muteMins(m)}>
                MUTE {m < 60 ? `${m} min` : '1 hour'}
              </PolicyBtn>
            ))}
            <PolicyBtn active={false} onClick={unmute}>UNMUTE NOW</PolicyBtn>
          </div>
        </section>

        {/* Trader profile */}
        <section>
          <div className="font-mono text-[9px] tracking-[2px] text-tnc-muted uppercase mb-[10px] pb-[5px] border-b border-tnc-border">
            TRADER PROFILE
          </div>
          <div className="flex gap-2 flex-wrap">
            {PROFILES.map(p => (
              <PolicyBtn key={p.value} active={false} onClick={() => setProfile(p.value)}>
                {p.label}
              </PolicyBtn>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
});
