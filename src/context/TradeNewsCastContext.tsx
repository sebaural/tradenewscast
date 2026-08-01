'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFeedPolling } from '@/hooks/useFeedPolling';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useSpeechQueue } from '@/hooks/useSpeechQueue';
import { loadPersistedSettings, normalizeRules, savePersistedSettings } from '@/lib/persistence';
import type {
  AppState,
  EnrichedItem,
  FilterType,
  InterruptPolicy,
  NotificationState,
  ReadingMode,
  Rules,
  TraderProfile,
  VoiceSettings,
} from '@/types';

const DEFAULT_RULES: Rules = {
  interrupt:     true,
  dedup:         true,
  skipP4:        true,
  context:       false,
  tone:          true,
  stale:         true,
  muteRatings:   false,
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

const DEFAULT_WATCHLIST = ['OIL', 'FED', 'CPI', 'IRAN', 'HORMUZ', 'NFP', 'FOMC'];

interface AppContextValue extends AppState {
  setFilter:   (filter: FilterType) => void;
  setActiveItem: (id: string | null) => void;
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
  setRules:          (patch: Partial<Rules>) => void;
  setInterruptPolicy: (policy: InterruptPolicy) => void;
  setProfile:         (profile: TraderProfile) => void;
  addWatchword:    (word: string) => void;
  removeWatchword: (word: string) => void;
  clearQueue:   () => void;
  clearHistory: () => void;
  openSettings:  () => void;
  closeSettings: () => void;
  showNotif: (head: string, body: string, isP1?: boolean) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within TradeNewsCastProvider');
  return ctx;
}

export function TradeNewsCastProvider({ children }: { children: React.ReactNode }) {
  const [allItems, setAllItems] = useState<EnrichedItem[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>(DEFAULT_WATCHLIST);
  const [rules, setRulesState] = useState<Rules>(DEFAULT_RULES);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [autoOn, setAutoOn] = useState(true);
  const [muteUntil, setMuteUntil] = useState(0);
  const [interruptPolicy, setInterruptPolicyState] = useState<InterruptPolicy>('critical');
  const [parseStatus, setParseStatusState] = useState<AppState['parseStatus']>('parsing');
  const [parseStatusText, setParseStatusText] = useState('CONNECTING…');
  const [readingMode, setReadingModeState] = useState<ReadingMode>('summary');
  const [voiceSettings, setVoiceSettingsState] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [notification, setNotification] = useState<NotificationState>({
    head: '', body: '', isP1: false, visible: false,
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const parseErrorsRef = useRef(0);
  const seenHashRef = useRef<Set<string>>(new Set());
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const muteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoOnRef = useRef(true);
  const muteUntilRef = useRef(0);
  const allItemsRef = useRef<EnrichedItem[]>([]);
  const voiceSettingsRef = useRef<VoiceSettings>(voiceSettings);
  const readingModeRef = useRef<ReadingMode>(readingMode);
  const rulesRef = useRef<Rules>(rules);
  const watchlistRef = useRef<string[]>(watchlist);
  const interruptPolicyRef = useRef<InterruptPolicy>(interruptPolicy);
  const userActivatedRef = useRef(false);
  const activationHintRef = useRef(false);

  autoOnRef.current = autoOn;
  muteUntilRef.current = muteUntil;
  allItemsRef.current = allItems;
  voiceSettingsRef.current = voiceSettings;
  readingModeRef.current = readingMode;
  rulesRef.current = rules;
  watchlistRef.current = watchlist;
  interruptPolicyRef.current = interruptPolicy;

  const showNotif = useCallback((head: string, body: string, isP1 = false) => {
    setNotification({ head, body, isP1, visible: true });
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    notifTimerRef.current = setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 4000);
  }, []);

  const speech = useSpeechQueue({
    showNotif,
    userActivatedRef,
    autoOnRef,
    muteUntilRef,
    rulesRef,
    readingModeRef,
    voiceSettingsRef,
    interruptPolicyRef,
  });

  const setParseStatus = useCallback((status: AppState['parseStatus'], text: string) => {
    setParseStatusState(status);
    setParseStatusText(text);
  }, []);

  useFeedPolling({
    setAllItems,
    setParseStatus,
    scheduleItem: speech.scheduleItem,
    watchlistRef,
    rulesRef,
    seenHashRef,
    parseErrorsRef,
  });

  const loadVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const all = window.speechSynthesis.getVoices();
    if (all.length === 0) return;

    const normalizeLang = (lang: string) => lang.toLowerCase().replace('_', '-');
    const usEnglish = all.filter(v => normalizeLang(v.lang).startsWith('en-us'));
    const gbEnglish = all.filter(v => normalizeLang(v.lang).startsWith('en-gb'));

    const preferred = [
      'Google UK English Male', 'Google UK English Female', 'Google US English',
      'Microsoft David', 'Microsoft Zira', 'Microsoft Mark',
      'Alex', 'Samantha', 'Daniel', 'Karen', 'Moira', 'Fiona',
    ];

    const byPreference = (a: SpeechSynthesisVoice, b: SpeechSynthesisVoice) => {
      const ai = preferred.findIndex(p => a.name.includes(p.split(' ').pop()!));
      const bi = preferred.findIndex(p => b.name.includes(p.split(' ').pop()!));
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    };

    const pickTop = (voiceList: SpeechSynthesisVoice[]) => {
      if (voiceList.length === 0) return null;
      return [...voiceList].sort(byPreference)[0];
    };

    const restricted = [pickTop(usEnglish), pickTop(gbEnglish)].filter(Boolean) as SpeechSynthesisVoice[];
    setVoices(restricted);
    setVoiceSettingsState(prev => {
      const hasSelected = restricted.some(v => v.name === prev.selectedVoiceName);
      return hasSelected
        ? prev
        : { ...prev, selectedVoiceName: restricted[0]?.name ?? '' };
    });
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

  useEffect(() => {
    const saved = loadPersistedSettings();
    if (!saved) {
      setHydrated(true);
      return;
    }
    if (saved.rules) setRulesState(prev => ({ ...prev, ...normalizeRules(saved.rules!) }));
    if (saved.watchlist) setWatchlist(saved.watchlist);
    if (saved.readingMode) setReadingModeState(saved.readingMode);
    if (saved.interruptPolicy) setInterruptPolicyState(saved.interruptPolicy);
    if (saved.voiceSettings) {
      setVoiceSettingsState(prev => ({ ...prev, ...saved.voiceSettings }));
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    savePersistedSettings({
      rules,
      voiceSettings,
      watchlist,
      readingMode,
      interruptPolicy,
    });
  }, [hydrated, rules, voiceSettings, watchlist, readingMode, interruptPolicy]);

  useEffect(() => {
    seenHashRef.current = new Set();
    parseErrorsRef.current = 0;
    return () => {
      if (speech.queueTimerRef.current) clearTimeout(speech.queueTimerRef.current);
      if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
      if (muteTimerRef.current) clearTimeout(muteTimerRef.current);
      window.speechSynthesis?.cancel();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const toggleAuto = useCallback(() => {
    const next = !autoOnRef.current;
    setAutoOn(next);
    if (next) {
      userActivatedRef.current = true;
      activationHintRef.current = false;
      showNotif('AUTO READ ON', 'Reading news in real time');
      setTimeout(speech.triggerQueue, 100);
    } else {
      window.speechSynthesis?.cancel();
    }
  }, [showNotif, speech]);

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
      if (autoOnRef.current) speech.triggerQueue();
    }, mins * 60_000);
  }, [showNotif, speech]);

  const unmute = useCallback(() => {
    if (muteTimerRef.current) clearTimeout(muteTimerRef.current);
    setMuteUntil(0);
    muteUntilRef.current = 0;
    showNotif('UNMUTED', 'Voice reader active');
    if (autoOnRef.current) speech.triggerQueue();
  }, [showNotif, speech]);

  useKeyboardShortcuts({
    togglePause: speech.togglePause,
    skipCurrent: speech.skipCurrent,
    replayLast: speech.replayLast,
    muteMins,
  });

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

  const readSingle = useCallback((id: string) => {
    speech.readSingle(id, allItemsRef.current);
  }, [speech]);

  const openSettings = useCallback(() => setIsSettingsOpen(true), []);
  const closeSettings = useCallback(() => setIsSettingsOpen(false), []);

  const value = useMemo<AppContextValue>(() => ({
    allItems,
    readQueue: speech.readQueue,
    history: speech.history,
    watchlist,
    rules,
    currentFilter,
    autoOn,
    isPlaying: speech.isPlaying,
    isPaused: speech.isPaused,
    muteUntil,
    interruptPolicy,
    readCount: speech.readCount,
    lastSpokenId: speech.lastSpokenId,
    parseStatus,
    parseStatusText,
    readingMode,
    voiceSettings,
    voices,
    notification,
    isSettingsOpen,
    activeFeedItem: speech.activeFeedItem,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    setFilter,
    setActiveItem: speech.setActiveItem,
    toggleAuto,
    togglePause: speech.togglePause,
    stopAll: speech.stopAll,
    skipCurrent: speech.skipCurrent,
    replayLast: speech.replayLast,
    readSingle,
    muteMins,
    unmute,
    setReadingMode,
    setVoiceSettings,
    setRules,
    setInterruptPolicy,
    setProfile,
    addWatchword,
    removeWatchword,
    clearQueue: speech.clearQueue,
    clearHistory: speech.clearHistory,
    openSettings,
    closeSettings,
    showNotif,
  }), [
    allItems, speech, watchlist, rules, currentFilter, autoOn, muteUntil,
    interruptPolicy, parseStatus, parseStatusText, readingMode, voiceSettings,
    voices, notification, isSettingsOpen, mobileSidebarOpen,
    setFilter, toggleAuto, readSingle, muteMins, unmute, setReadingMode,
    setVoiceSettings, setRules, setInterruptPolicy, setProfile,
    addWatchword, removeWatchword, openSettings, closeSettings, showNotif,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
