'use client';

import React, { memo } from 'react';
import { useApp } from '@/context/TradeNewsCastContext';

export const NotificationToast = memo(function NotificationToast() {
  const { notification } = useApp();

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={`
        fixed bottom-5 right-5 bg-tnc-bg3 border rounded-[4px] px-3 py-2
        max-w-[300px] z-[200] pointer-events-none transition-all duration-300
        ${notification.isP1 ? 'border-tnc-red border-l-[3px] border-l-tnc-red' : 'border-tnc-accent border-l-[3px] border-l-tnc-accent'}
        ${notification.visible ? 'translate-y-0 opacity-100' : 'translate-y-[60px] opacity-0'}
      `}
    >
      <div
        className={`
          font-mono text-[9px] tracking-[1.5px] uppercase mb-[3px]
          ${notification.isP1 ? 'text-tnc-red' : 'text-tnc-accent'}
        `}
      >
        {notification.head}
      </div>
      <div className="text-[11px] text-tnc-text">{notification.body}</div>
    </div>
  );
});
