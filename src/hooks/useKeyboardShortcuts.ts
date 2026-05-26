'use client';

import { useEffect, useRef } from 'react';

interface KeyboardShortcutHandlers {
  togglePause: () => void;
  skipCurrent: () => void;
  replayLast: () => void;
  muteMins: (mins: number) => void;
}

export function useKeyboardShortcuts(handlers: KeyboardShortcutHandlers): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      const h = handlersRef.current;
      if (e.code === 'Space')      { e.preventDefault(); h.togglePause(); }
      if (e.code === 'ArrowRight') h.skipCurrent();
      if (e.code === 'ArrowLeft')  h.replayLast();
      if (e.code === 'KeyM')       h.muteMins(5);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);
}
