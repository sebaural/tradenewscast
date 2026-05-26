import type { InterruptPolicy, ReadingMode, Rules, VoiceSettings } from '@/types';

const STORAGE_KEY = 'tnc-settings-v1';

export interface PersistedSettings {
  rules: Rules;
  voiceSettings: VoiceSettings;
  watchlist: string[];
  readingMode: ReadingMode;
  interruptPolicy: InterruptPolicy;
}

export function loadPersistedSettings(): Partial<PersistedSettings> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PersistedSettings>;
  } catch {
    return null;
  }
}

export function savePersistedSettings(settings: PersistedSettings): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Quota exceeded or private browsing — ignore
  }
}

/** Migrate legacy mutRatings key from older saves. */
export function normalizeRules(rules: Partial<Rules> & { mutRatings?: boolean }): Partial<Rules> {
  if ('mutRatings' in rules && rules.muteRatings === undefined) {
    const { mutRatings, ...rest } = rules;
    return { ...rest, muteRatings: mutRatings };
  }
  return rules;
}
