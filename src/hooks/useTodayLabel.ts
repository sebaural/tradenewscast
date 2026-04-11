'use client';

import { useEffect, useState } from 'react';

/**
 * Returns today's date formatted as "Monday — 11 Apr 2026".
 * Updates at midnight.
 */
export function useTodayLabel(): string {
  const [label, setLabel] = useState('');

  useEffect(() => {
    const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    function build(): string {
      const d = new Date();
      return `${DAYS[d.getDay()]} — ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }

    setLabel(build());

    // Recalculate at the next midnight
    const now       = new Date();
    const midnight  = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const msToMidnight = midnight.getTime() - now.getTime();
    const midnightTimer = setTimeout(() => {
      setLabel(build());
    }, msToMidnight);

    return () => clearTimeout(midnightTimer);
  }, []);

  return label;
}
