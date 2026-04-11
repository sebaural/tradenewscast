'use client';

import { useEffect, useState } from 'react';

/**
 * Returns the current UTC time as an "HH:MM:SS UTC" string, updated every second.
 */
export function useClock(): string {
  const [time, setTime] = useState('--:--:-- UTC');

  useEffect(() => {
    function tick() {
      const n = new Date();
      setTime(n.toUTCString().slice(17, 25) + ' UTC');
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}
