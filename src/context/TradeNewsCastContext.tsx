'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { enrichItem, isDuplicate, parseLiveSquawk } from '@/lib/enrichment';
import { prepSpeech } from '@/lib/speechPrep';
import { playBeep } from '@/lib/audioUtils';
import { seedData } from '@/lib/seedData';
import type {
  AppState,
  EnrichedItem,
  FilterType,
  HistoryEntry,
  InterruptPolicy,
  NotificationState,
  ReadingMode,
  Rules,
  TraderProfile,
  VoiceSettings,
} from '@/types';

// ─── Feed endpoint (server-side fetch to avoid browser CORS issues) ───────

const FEED_ENDPOINT = '/api/livesquawk';

// ─── Default values ───────────────────────────────────────────────────────

const DEFAULT_RULES: Rules = {
  interrupt:     true,
  dedup:         true,
  skipP4:        true,
  context:       false,
  tone:          true,
  stale:         true,
  mutRatings:    false,
  muteDividends: true,
  muteCrypto:    false,
  muteSports:    true,
};

const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  rate:              0.92,
  pitch:             1.0,
  volume:            0.95,
  gap:               1.5,
  selectedVoiceName: '',
};

// ─── Context interface ────────────────────────────────────────────────────

interface AppContextValue extends AppState {
  // Feed actions
  setFilter:   (filter: FilterType) => void;
  setActiveItem: (id: string | null) => void;

  // TTS actions
  toggleAuto:    () => void;
  togglePause:   () => void;
  stopAll:       () => void;
  skipCurrent:   () => void;
  replayLast:    () => void;
  readSingle:    (id: string) => void;
  muteMins:      (mins: number) => void;
  unmute:        () => void;
  setReadingMode: (mode: ReadingMode) => void;
  setVoiceSettings: (patch: Partial<VoiceSettings>) => void;

  // Rules & config
  setRules:          (patch: Partial<Rules>) => void;
  setInterruptPolicy: (policy: InterruptPolicy) => void;
  setProfile:         (profile: TraderProfile) => void;

  // Watchlist
  addWatchword:    (word: string) => void;
  removeWatchword: (word: string) => void;

  // History / queue
  clearQueue:   () => void;
  clearHistory: () => void;

  // Modal
  openSettings:  () => void;
  closeSettings: () => void;

  // Notification
  showNotif: (head: string, body: string, isP1?: boolean) => void;
}

// ─── Create context ───────────────────────────────────────────────────────

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within TradeNewsCastProvider');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────────────────

export function TradeNewsCastProvider({ children }: { children: React.ReactNode }) {
  // ── State ────────────────────────────────────────────────────────────────
  const [allItems,        setAllItems]        = useState<EnrichedItem[]>([]);
  const [readQueue,       setReadQueue]        = useState<EnrichedItem[]>([]);
  const [history,         setHistory]          = useState<HistoryEntry[]>([]);
  const [watchlist,       setWatchlist]        = useState<string[]>(['OIL','FED','CPI','IRAN','HORMUZ','NFP','FOMC']);
  const [rules,           setRulesState]       = useState<Rules>(DEFAULT_RULES);
  const [currentFilter,   setCurrentFilter]    = useState<FilterType>('all');
  const [autoOn,          setAutoOn]           = useState(true);
  const [isPlaying,       setIsPlaying]        = useState(false);
  const [isPaused,        setIsPaused]         = useState(false);
  const [muteUntil,       setMuteUntil]        = useState(0);
  const [interruptPolicy, setInterruptPolicyState] = useState<InterruptPolicy>('critical');
  const [readCount,       setReadCount]        = useState(0);
  const [lastSpokenId,    setLastSpokenId]     = useState<string | null>(null);
  const [parseStatus,     setParseStatusState] = useState<AppState['parseStatus']>('parsing');
  const [parseStatusText, setParseStatusText]  = useState('CONNECTING…');
  const [readingMode,     setReadingModeState] = useState<ReadingMode>('summary');
  const [voiceSettings,   setVoiceSettingsState] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [voices,          setVoices]           = useState<SpeechSynthesisVoice[]>([]);
  const [notification,    setNotification]     = useState<NotificationState>({ head: '', body: '', isP1: false, visible: false });
  const [isSettingsOpen,  setIsSettingsOpen]   = useState(false);
  const [activeFeedItem,  setActiveFeedItem]   = useState<string | null>(null);

  // ── Refs (mutable internals that don't drive renders) ────────────────────
  const proxyIndexRef  = useRef(0);
  const parseErrorsRef = useRef(0);
  const seenHashRef    = useRef<Set<string>>(new Set());
  const notifTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const muteTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const queueTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPlayingRef   = useRef(false);
  const autoOnRef      = useRef(true);
  const muteUntilRef   = useRef(0);
  const readQueueRef   = useRef<EnrichedItem[]>([]);
  const allItemsRef    = useRef<EnrichedItem[]>([]);
  const isPausedRef    = useRef(false);
  const voiceSettingsRef = useRef<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const readingModeRef   = useRef<ReadingMode>('summary');
  const rulesRef         = useRef<Rules>(DEFAULT_RULES);
  const watchlistRef     = useRef<string[]>(['OIL','FED','CPI','IRAN','HORMUZ','NFP','FOMC']);
  const lastSpokenRef    = useRef<EnrichedItem | null>(null);
  const interruptPolicyRef = useRef<InterruptPolicy>('critical');

  // Keep refs in sync with state
  isPlayingRef.current    = isPlaying;
  autoOnRef.current       = autoOn;
  muteUntilRef.current    = muteUntil;
  readQueueRef.current    = readQueue;
  allItemsRef.current     = allItems;
  isPausedRef.current     = isPaused;
  voiceSettingsRef.current  = voiceSettings;
  readingModeRef.current    = readingMode;
  rulesRef.current          = rules;
  watchlistRef.current      = watchlist;
  interruptPolicyRef.current = interruptPolicy;

  // ── Notifications ─────────────────────────────────────────────────────────
  const showNotif = useCallback((head: string, body: string, isP1 = false) => {
    setNotification({ head, body, isP1, visible: true });
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 4000);
  }, []);

  // ── TTS voice loading ─────────────────────────────────────────────────────
  const loadVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const all = window.speechSynthesis.getVoices();
    if (all.length === 0) return;
    const english = all.filter(v => v.lang.startsWith('en'));
    const preferred = [
      'Google UK English Male','Google UK English Female','Google US English',
      'Microsoft David','Microsoft Zira','Microsoft Mark',
      'Alex','Samantha','Daniel','Karen','Moira','Fiona',
    ];
    const sorted = [...english].sort((a, b) => {
      const ai = preferred.findIndex(p => a.name.includes(p.split(' ').pop()!));
      const bi = preferred.findIndex(p => b.name.includes(p.split(' ').pop()!));
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });
    setVoices(sorted);
    setVoiceSettingsState(prev =>
      prev.selectedVoiceName ? prev : { ...prev, selectedVoiceName: sorted[0]?.name ?? '' },
    );
  }, []);

  useEffect(() => {
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [loadVoices]);

  // ── Core speak() ─────────────────────────────────────────────────────────
  const speak = useCallback((text: string, onEnd: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utt    = new SpeechSynthesisUtterance(text);
    const vs     = voiceSettingsRef.current;
    utt.rate     = vs.rate;
    utt.pitch    = vs.pitch;
    utt.volume   = vs.volume;
    const voice  = window.speechSynthesis.getVoices().find(v => v.name === vs.selectedVoiceName);
    if (voice) utt.voice = voice;
    utt.onstart  = () => { isPlayingRef.current = true;  setIsPlaying(true); };
    utt.onend    = () => { isPlayingRef.current = false; setIsPlaying(false); onEnd(); };
    utt.onerror  = () => { isPlayingRef.current = false; setIsPlaying(false); onEnd(); };
    window.speechSynthesis.speak(utt);
  }, []);

  // ── readItem() ───────────────────────────────────────────────────────────
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
      setHistory(prev => [entry, ...prev].slice(0, 50));
      setReadQueue(prev => prev.filter(i => i._id !== item._id));

      const gap = voiceSettingsRef.current.gap * 1000;
      queueTimerRef.current = setTimeout(() => {
        if (autoOnRef.current && !isPausedRef.current) {
          triggerQueue();
        }
      }, gap);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speak]);

  // ── triggerQueue() ───────────────────────────────────────────────────────
  const triggerQueue = useCallback(() => {
    if (
      isPlayingRef.current ||
      isPausedRef.current  ||
      !autoOnRef.current   ||
      Date.now() < muteUntilRef.current
    ) return;
    const q = readQueueRef.current;
    if (q.length === 0) return;
    if (queueTimerRef.current) clearTimeout(queueTimerRef.current);
    queueTimerRef.current = setTimeout(() => {
      const next = readQueueRef.current[0];
      if (!next || isPlayingRef.current) return;
      setReadQueue(prev => prev.slice(1));
      readItem(next);
    }, 300);
  }, [readItem]);

  // ── scheduleItem() ───────────────────────────────────────────────────────
  const scheduleItem = useCallback((item: EnrichedItem) => {
    const r = rulesRef.current;
    if (!autoOnRef.current) return;
    if (Date.now() < muteUntilRef.current) return;
    if (r.skipP4 && item.priority === 4) return;
    if (r.muteDividends && /dividend/i.test(item.headline)) return;
    if (r.muteCrypto && /crypto|bitcoin|ethereum|defi|token/i.test(item.headline)) return;
    if (r.muteSports && /nfl|nba|fifa|formula 1|olympics/i.test(item.headline)) return;
    const mode = readingModeRef.current;
    if (mode === 'breaking'   && !item.isBreaking) return;
    if (mode === 'watchlist'  && !item.watchHit)   return;

    if (isPlayingRef.current && item.priority === 1) {
      const policy = interruptPolicyRef.current;
      if (policy === 'always' || policy === 'critical') {
        window.speechSynthesis?.cancel();
        isPlayingRef.current = false;
        setIsPlaying(false);
        readItem(item);
        return;
      }
    }

    setReadQueue(prev => {
      let next = item.priority === 1 ? [item, ...prev] : [...prev, item];
      if (r.stale) {
        const now = Date.now();
        next = next.filter(i => now - i._ts < 10 * 60 * 1000);
      }
      if (next.length > 20) next = next.slice(0, 20);
      return next;
    });

    if (!isPlayingRef.current) {
      setTimeout(() => triggerQueue(), 100);
    }
  }, [readItem, triggerQueue]);

  // ── Feed processing ───────────────────────────────────────────────────────
  const processItems = useCallback((rawItems: ReturnType<typeof parseLiveSquawk>) => {
    let newCount = 0;
    const now = Date.now();

    setAllItems(prev => {
      const updated = [...prev];
      for (const raw of rawItems) {
        const hash = `${raw.time}|${raw.headline.slice(0, 50)}`;
        if (seenHashRef.current.has(hash)) continue;
        seenHashRef.current.add(hash);

        const enriched = enrichItem(raw, watchlistRef.current);
        enriched._ts = now - newCount * 1000; // slight ordering offset
        enriched._new = true;

        if (rulesRef.current.dedup && isDuplicate(enriched, updated)) {
          enriched._dup = true;
        } else {
          scheduleItem(enriched);
        }

        updated.unshift(enriched);
        newCount++;
      }
      // Clear _new flag on old items
      return updated.map((item, idx) => idx >= newCount ? { ...item, _new: false } : item);
    });
  }, [scheduleItem]);

  // ── Live feed polling ─────────────────────────────────────────────────────
  const setParseStatus = useCallback((status: AppState['parseStatus'], text: string) => {
    setParseStatusState(status);
    setParseStatusText(text);
  }, []);

  const fetchFeed = useCallback(async () => {
    setParseStatus('parsing', 'FETCHING…');
    try {
      const res = await fetch(FEED_ENDPOINT, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html  = await res.text();
      const items = parseLiveSquawk(html);

      if (items.length > 0) {
        parseErrorsRef.current = 0;
        processItems(items);
        setParseStatus('live', 'LIVE · LiveSquawk');
        return;
      }
    } catch {
      // handled below
    }

    parseErrorsRef.current++;
    if (parseErrorsRef.current > 3) {
      setParseStatus('error', 'FEED ERROR — demo data');
    } else {
      setParseStatus('parsing', 'RETRYING…');
    }
  }, [processItems, setParseStatus]);

  // ── Seed data + polling bootstrap ─────────────────────────────────────────
  useEffect(() => {
    const now = Date.now();
    const seeded = seedData.map((raw, i) => {
      const enriched = enrichItem(raw, watchlistRef.current);
      enriched._id  = `seed${i}`;
      enriched._ts  = now - i * 60_000;
      enriched._new = false;
      seenHashRef.current.add(`${raw.time}|${raw.headline.slice(0, 50)}`);
      return enriched;
    });
    setAllItems(seeded);

    // Queue top-priority seed items
    const toQueue = seeded.filter(i => i.priority <= 2).slice(0, 5).reverse();
    setReadQueue(toQueue);
    showNotif('VOICE READER ACTIVE', 'Reading priority 1 and 2 headlines');

    // Start polling
    fetchFeed();
    const interval = setInterval(fetchFeed, 30_000);

    // Start reading after short delay
    const startTimer = setTimeout(() => {
      if (autoOnRef.current) triggerQueue();
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(startTimer);
      if (queueTimerRef.current) clearTimeout(queueTimerRef.current);
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
      if (muteTimerRef.current)  clearTimeout(muteTimerRef.current);
      window.speechSynthesis?.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Media Session (background playback) ──────────────────────────────────
  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title:  'TradeNewsCast Live Feed',
        artist: 'Voice Intelligence Terminal',
        album:  'Financial News',
      });
    } catch { /* unsupported */ }
  }, []);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.code === 'Space')      { e.preventDefault(); togglePause(); }
      if (e.code === 'ArrowRight') skipCurrent();
      if (e.code === 'ArrowLeft')  replayLast();
      if (e.code === 'KeyM')       muteMins(5);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Public action handlers ────────────────────────────────────────────────

  const toggleAuto = useCallback(() => {
    const next = !autoOnRef.current;
    setAutoOn(next);
    if (next) {
      showNotif('AUTO READ ON', 'Reading news in real time');
      setTimeout(triggerQueue, 100);
    } else {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    }
  }, [showNotif, triggerQueue]);

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
  }, [triggerQueue]);

  const replayLast = useCallback(() => {
    if (lastSpokenRef.current) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
      readItem(lastSpokenRef.current);
    }
  }, [readItem]);

  const readSingle = useCallback((id: string) => {
    const item = allItemsRef.current.find(i => i._id === id);
    if (!item) return;
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
    readItem(item);
  }, [readItem]);

  const muteMins = useCallback((mins: number) => {
    const until = Date.now() + mins * 60_000;
    setMuteUntil(until);
    muteUntilRef.current = until;
    window.speechSynthesis?.cancel();
    showNotif('MUTED', `Voice muted for ${mins} minutes`);
    if (muteTimerRef.current) clearTimeout(muteTimerRef.current);
    muteTimerRef.current = setTimeout(() => {
      showNotif('UNMUTED', 'Voice reader resumed');
      muteUntilRef.current = 0;
      setMuteUntil(0);
      if (autoOnRef.current) triggerQueue();
    }, mins * 60_000);
  }, [showNotif, triggerQueue]);

  const unmute = useCallback(() => {
    if (muteTimerRef.current) clearTimeout(muteTimerRef.current);
    setMuteUntil(0);
    muteUntilRef.current = 0;
    showNotif('UNMUTED', 'Voice reader active');
    if (autoOnRef.current) triggerQueue();
  }, [showNotif, triggerQueue]);

  const setFilter = useCallback((filter: FilterType) => setCurrentFilter(filter), []);

  const setReadingMode = useCallback((mode: ReadingMode) => {
    setReadingModeState(mode);
    readingModeRef.current = mode;
    const labels: Record<ReadingMode, string> = {
      headline:   'Headline only',
      summary:    'Headline + context',
      breaking:   'Breaking alerts only',
      watchlist:  'Watchlist filtered',
      full:       'Full read mode',
    };
    showNotif('MODE CHANGED', labels[mode] ?? mode);
  }, [showNotif]);

  const setVoiceSettings = useCallback((patch: Partial<VoiceSettings>) => {
    setVoiceSettingsState(prev => {
      const next = { ...prev, ...patch };
      voiceSettingsRef.current = next;
      return next;
    });
  }, []);

  const setRules = useCallback((patch: Partial<Rules>) => {
    setRulesState(prev => {
      const next = { ...prev, ...patch };
      rulesRef.current = next;
      return next;
    });
  }, []);

  const setInterruptPolicy = useCallback((policy: InterruptPolicy) => {
    setInterruptPolicyState(policy);
    interruptPolicyRef.current = policy;
  }, []);

  const setProfile = useCallback((profile: TraderProfile) => {
    const patches: Record<TraderProfile, Partial<VoiceSettings> & { mode?: ReadingMode; rulesP?: Partial<Rules> }> = {
      scalper:   { rate: 1.1,  mode: 'headline',  rulesP: { skipP4: true, interrupt: true } },
      daytrader: { rate: 0.92, mode: 'summary' },
      swing:     { rate: 0.85, mode: 'summary',   rulesP: { skipP4: true } },
      macro:     { rate: 0.85, mode: 'full' },
    };
    const p = patches[profile];
    if (p.mode) { setReadingModeState(p.mode); readingModeRef.current = p.mode; }
    if (p.rulesP) setRules(p.rulesP);
    setVoiceSettings({ rate: p.rate ?? voiceSettingsRef.current.rate });
    showNotif('PROFILE SET', profile.toUpperCase() + ' mode activated');
    setIsSettingsOpen(false);
  }, [setRules, setVoiceSettings, showNotif]);

  const addWatchword = useCallback((word: string) => {
    const upper = word.trim().toUpperCase();
    if (!upper) return;
    setWatchlist(prev => {
      if (prev.includes(upper)) return prev;
      const next = [...prev, upper];
      watchlistRef.current = next;
      return next;
    });
  }, []);

  const removeWatchword = useCallback((word: string) => {
    setWatchlist(prev => {
      const next = prev.filter(w => w !== word);
      watchlistRef.current = next;
      return next;
    });
  }, []);

  const clearQueue   = useCallback(() => setReadQueue([]), []);
  const clearHistory = useCallback(() => setHistory([]),  []);
  const openSettings  = useCallback(() => setIsSettingsOpen(true),  []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);
  const setActiveItem = useCallback((id: string | null) => setActiveFeedItem(id), []);

  // ── Context value ─────────────────────────────────────────────────────────
  const value: AppContextValue = {
    allItems, readQueue, history, watchlist, rules, currentFilter,
    autoOn, isPlaying, isPaused, muteUntil, interruptPolicy,
    readCount, lastSpokenId, parseStatus, parseStatusText, readingMode,
    voiceSettings, voices, notification, isSettingsOpen, activeFeedItem,
    setFilter, setActiveItem,
    toggleAuto, togglePause, stopAll, skipCurrent, replayLast, readSingle,
    muteMins, unmute, setReadingMode, setVoiceSettings,
    setRules, setInterruptPolicy, setProfile,
    addWatchword, removeWatchword,
    clearQueue, clearHistory,
    openSettings, closeSettings,
    showNotif,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
