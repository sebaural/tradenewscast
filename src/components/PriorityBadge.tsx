'use client';

import React, { memo } from 'react';
import type { Priority } from '@/types';

const priorityBg: Record<Priority, string> = {
  1: 'bg-tnc-red    text-white',
  2: 'bg-tnc-orange text-black',
  3: 'bg-tnc-accent text-black',
  4: 'bg-tnc-bg4    text-tnc-text2 border border-tnc-border2',
};

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export const PriorityBadge = memo(function PriorityBadge({
  priority,
  className = '',
}: PriorityBadgeProps) {
  return (
    <span
      className={`
        font-mono text-[9px] font-semibold tracking-[0.8px] px-[6px] py-[1px]
        rounded-[2px] uppercase inline-block ${priorityBg[priority]} ${className}
      `}
    >
      P{priority}
    </span>
  );
});
