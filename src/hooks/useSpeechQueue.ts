'use client';

import { useCallback, useRef, useState } from 'react';
import { prepSpeech } from '@/lib/speechPrep';
import { playBeep } from '@/lib/audioUtils';
import {
  MAX_HISTORY,
  MAX_READ_QUEUE,
} from '@/lib/constants';
import {
  MUTE_CRYPTO,
  MUTE_DIVIDENDS,
  MUTE_SPORTS,
  matchesMuteRatings,
} from '@/lib/mutePatterns';
import type {
  EnrichedItem,
  HistoryEntry,
  InterruptPolicy,
  ReadingMode,
  Rules,
  VoiceSettings,
} from '@/types';

interface UseSpeechQueueOptions {
  showNotif: (head: string, body: string, isP1?: boolean) => void;
  userActivatedRef: React.MutableRefObject<boolean>;
  autoOnRef: React.MutableRefObject<boolean>;
  muteUntilRef: React.MutableRefObject<number>;
  rulesRef: React.MutableRefObject<Rules>;
  readingModeRef: React.MutableRefObject<ReadingMode>;
  voiceSettingsRef: React.MutableRefObject<VoiceSettings>;
  interruptPolicyRef: React.MutableRefObject<InterruptPolicy>;
}

export function useSpeechQueue({
  showNotif,
  userActivatedRef,
  autoOnRef,
  muteUntilRef,
  rulesRef,
  readingModeRef,
  voiceSettingsRef,
  interruptPolicyRef,
}: UseSpeechQueueOptions) {
  const [readQueue, setReadQueue] = useState<EnrichedItem[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [readCount, setReadCount] = useState(0);
  const [lastSpokenId, setLastSpokenId] = useState<string | null>(null);
  const [activeFeedItem, setActiveFeedItem] = useState<string | null>(null);

  const readQueueRef = useRef<EnrichedItem[]>([]);
  const isPlayingRef = useRef(false);
  const isPausedRef = useRef(false);
  const queueTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpokenRef = useRef<EnrichedItem | null>(null);
  const readItemRef = useRef<(item: EnrichedItem) => void>(() => {});

  readQueueRef.current = readQueue;
  isPlayingRef.current = isPlaying;
  isPausedRef.current = isPaused;

  const speak = useCallback((text: string, onEnd: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const vs = voiceSettingsRef.current;
    utt.rate = vs.rate;
    utt.pitch = vs.pitch;
    utt.volume = vs.volume;
    const voice = window.speechSynthesis.getVoices().find(v => v.name === vs.selectedVoiceName);
    if (voice) utt.voice = voice;
    utt.onstart = () => { isPlayingRef.current = true; setIsPlaying(true); };
    utt.onend = () => { isPlayingRef.current = false; setIsPlaying(false); onEnd(); };
    utt.onerror = () => { isPlayingRef.current = false; setIsPlaying(false); onEnd(); };
    window.speechSynthesis.speak(utt);
  }, [voiceSettingsRef]);

  const triggerQueue = useCallback(() => {
    if (
      isPlayingRef.current ||
      isPausedRef.current ||
      !autoOnRef.current ||
      Date.now() < muteUntilRef.current ||
      !userActivatedRef.current
    ) return;
    if (readQueueRef.current.length === 0) return;
    if (queueTimerRef.current) clearTimeout(queueTimerRef.current);
    queueTimerRef.current = setTimeout(() => {
      const next = readQueueRef.current[0];
      if (!next || isPlayingRef.current) return;
      setReadQueue(prev => prev.slice(1));
      readItemRef.current(next);
    }, 300);
  }, [autoOnRef, muteUntilRef, userActivatedRef]);

  const readItem = useCallback((item: EnrichedItem) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const text = prepSpeech(item, readingModeRef.current, rulesRef.current);

    if (item.priority === 1 && rulesRef.current.tone) {
      playBeep(1200, 0.08, 0.25);
      setTimeout(() => playBeep(900, 0.08, 0.2), 100);
    }

    setLastSpokenId(item._id);
    lastSpokenRef.current = item;
    setActiveFeedItem(item._id);

    speak(text, () => {
      setActiveFeedItem(null);
      setReadCount(c => c + 1);
      const entry: HistoryEntry = {
        item,
        readAt: new Date().toTimeString().slice(0, 8),
      };
      setHistory(prev => [entry, ...prev].slice(0, MAX_HISTORY));
      setReadQueue(prev => prev.filter(i => i._id !== item._id));

      const gap = voiceSettingsRef.current.gap * 1000;
      queueTimerRef.current = setTimeout(() => {
        if (autoOnRef.current && !isPausedRef.current) triggerQueue();
      }, gap);
    });
  }, [autoOnRef, readingModeRef, rulesRef, speak, triggerQueue, voiceSettingsRef]);

  readItemRef.current = readItem;

  const scheduleItem = useCallback((item: EnrichedItem) => {
    const r = rulesRef.current;
    if (!autoOnRef.current) return;
    if (Date.now() < muteUntilRef.current) return;
    if (r.skipP4 && item.priority === 4) return;
    if (r.muteDividends && MUTE_DIVIDENDS.test(item.headline)) return;
    if (r.muteCrypto && MUTE_CRYPTO.test(item.headline)) return;
    if (r.muteSports && MUTE_SPORTS.test(item.headline)) return;
    if (r.muteRatings && matchesMuteRatings(item.headline)) return;

    const mode = readingModeRef.current;
    if (mode === 'breaking' && !item.isBreaking) return;
    if (mode === 'watchlist' && !item.watchHit) return;

    if (item.priority === 1) {
      showNotif('BREAKING', item.headline.slice(0, 80), true);
    }

    if (isPlayingRef.current && r.interrupt) {
      const policy = interruptPolicyRef.current;
      const shouldInterrupt =
        policy === 'always' ||
        (policy === 'critical' && item.priority === 1);

      if (shouldInterrupt) {
        window.speechSynthesis?.cancel();
        isPlayingRef.current = false;
        setIsPlaying(false);
        readItemRef.current(item);
        return;
      }
    }

    setReadQueue(prev => {
      let next = item.priority === 1 ? [item, ...prev] : [...prev, item];
      if (r.stale) {
        const now = Date.now();
        next = next.filter(i => now - i._ts < 10 * 60 * 1000);
      }
      if (next.length > MAX_READ_QUEUE) next = next.slice(0, MAX_READ_QUEUE);
      return next;
    });

    if (!isPlayingRef.current) {
      setTimeout(() => triggerQueue(), 100);
    }
  }, [
    autoOnRef,
    interruptPolicyRef,
    muteUntilRef,
    readingModeRef,
    rulesRef,
    showNotif,
    triggerQueue,
  ]);

  const stopAll = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setReadQueue([]);
    setActiveFeedItem(null);
    if (queueTimerRef.current) clearTimeout(queueTimerRef.current);
  }, []);

  const skipCurrent = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    const gap = voiceSettingsRef.current.gap * 1000 * 0.3;
    setTimeout(() => { if (autoOnRef.current) triggerQueue(); }, gap);
  }, [autoOnRef, triggerQueue, voiceSettingsRef]);

  const replayLast = useCallback(() => {
    if (lastSpokenRef.current) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      readItemRef.current(lastSpokenRef.current);
    }
  }, []);

  const readSingle = useCallback((id: string, allItems: EnrichedItem[]) => {
    const item = allItems.find(i => i._id === id);
    if (!item) return;
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    readItemRef.current(item);
  }, []);

  const clearQueue = useCallback(() => setReadQueue([]), []);
  const clearHistory = useCallback(() => setHistory([]), []);
  const setActiveItem = useCallback((id: string | null) => setActiveFeedItem(id), []);

  const togglePause = useCallback(() => {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, []);

  return {
    readQueue,
    setReadQueue,
    history,
    isPlaying,
    isPaused,
    readCount,
    lastSpokenId,
    activeFeedItem,
    queueTimerRef,
    scheduleItem,
    triggerQueue,
    stopAll,
    skipCurrent,
    replayLast,
    readSingle,
    clearQueue,
    clearHistory,
    setActiveItem,
    togglePause,
  };
}
