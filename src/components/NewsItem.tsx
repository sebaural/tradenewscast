'use client';

import React, { memo } from 'react';
import type { EnrichedItem, TagType } from '@/types';
import { useApp } from '@/context/TradeNewsCastContext';

// ── Tag styling ────────────────────────────────────────────────────────────

const tagStyles: Record<TagType, string> = {
  oil:     'bg-tnc-accent/10 text-tnc-accent     border border-tnc-accent/20',
  iran:    'bg-tnc-red/10    text-tnc-red         border border-tnc-red/20',
  fed:     'bg-tnc-blue/10   text-tnc-blue        border border-tnc-blue/20',
  macro:   'bg-tnc-green/10  text-tnc-green       border border-tnc-green/20',
  geo:     'bg-tnc-red/10    text-[#ff8080]       border border-tnc-red/15',
  markets: 'bg-[#8a9ab0]/[.08] text-tnc-text2    border border-[#8a9ab0]/15',
  break:   'bg-tnc-red        text-white          border border-tnc-red',
  watch:   'bg-tnc-purple/10  text-tnc-purple     border border-tnc-purple/20',
};

// ── Priority badge ─────────────────────────────────────────────────────────

const priorityBg: Record<number, string> = {
  1: 'bg-tnc-red    text-white',
  2: 'bg-tnc-orange text-black',
  3: 'bg-tnc-accent text-black',
  4: 'bg-tnc-bg4    text-tnc-text2 border border-tnc-border2',
};

// ── NewsItem ───────────────────────────────────────────────────────────────

interface NewsItemProps {
  item: EnrichedItem;
  isFresh: boolean;
}

export const NewsItem = memo(function NewsItem({ item, isFresh }: NewsItemProps) {
  const { activeFeedItem, setActiveItem, readSingle } = useApp();

  const isActive   = activeFeedItem === item._id;
  const isSpeaking = isActive;

  const borderAccent =
    isActive || isSpeaking
      ? 'border-l-2 border-l-tnc-accent pl-[12px]'
      : 'pl-[14px]';

  const bg =
    isSpeaking
      ? 'bg-tnc-accent/10'
      : isActive
      ? 'bg-tnc-accent/[.07]'
      : 'hover:bg-tnc-bg3';

  const pBadge  = priorityBg[item.priority] ?? priorityBg[4];
  const pLabel  = `P${item.priority}`;

  const headlineColor =
    item.priority === 1 ? 'text-white font-medium' :
    item.priority === 2 ? 'text-[#e8d4b0]'         : 'text-tnc-text';

  return (
    <div
      id={`ni-${item._id}`}
      onClick={() => setActiveItem(item._id)}
      className={`
        ${borderAccent} ${bg} ${isFresh ? 'animate-freshin' : ''}
        border-b border-tnc-border pr-[14px] pt-[10px] pb-[10px]
        cursor-pointer grid gap-2 items-start transition-colors duration-100
        relative
      `}
      style={{ gridTemplateColumns: '54px 1fr auto' }}
    >
      {/* Time + priority */}
      <div className="pt-[2px]">
        <div className="font-mono text-[10px] text-tnc-muted tracking-[0.2px] whitespace-nowrap">
          {item.time}
        </div>
        <span
          className={`
            font-mono text-[9px] font-semibold tracking-[0.8px] px-[6px] py-[1px]
            rounded-[2px] uppercase mt-1 inline-block ${pBadge}
          `}
        >
          {pLabel}
        </span>
      </div>

      {/* Headline + meta */}
      <div className="min-w-0">
        <div className={`text-[12.5px] leading-[1.42] mb-1 ${headlineColor}`}>
          {item.headline}
        </div>
        <div className="flex items-center gap-[6px] flex-wrap mt-1">
          <span className="font-mono text-[9px] text-[rgb(46,131,216)] tracking-[0.3px]">
            {item.src}
          </span>
          {item._dup && (
            <span className="font-mono text-[8px] text-tnc-text3 tracking-[0.5px] bg-tnc-bg4 px-[5px] py-[1px] rounded-[2px] border border-tnc-border">
              DUP
            </span>
          )}
          <div className="flex gap-[3px] flex-wrap">
            {item.tags.map(tag => (
              <span
                key={tag}
                className={`font-mono text-[8px] px-[5px] py-[1px] rounded-[2px] tracking-[0.5px] font-semibold uppercase whitespace-nowrap ${tagStyles[tag]}`}
              >
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Read button */}
      <button
        title="Read this item"
        onClick={e => { e.stopPropagation(); readSingle(item._id); }}
        className={`
          bg-transparent border rounded-[2px] w-6 h-6
          flex items-center justify-center flex-shrink-0
          text-[11px] cursor-pointer transition-all duration-150 mt-[2px]
          ${isSpeaking
            ? 'border-tnc-accent bg-tnc-accent/10 text-tnc-accent'
            : 'border-tnc-border2 text-tnc-text3 hover:border-tnc-accent hover:text-tnc-accent'
          }
        `}
      >
        ▶
      </button>
    </div>
  );
});
