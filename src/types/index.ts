// ─── News Feed Types ───────────────────────────────────────────────────────

export type Priority = 1 | 2 | 3 | 4;

export type TagType =
  | 'oil'
  | 'iran'
  | 'fed'
  | 'macro'
  | 'geo'
  | 'markets'
  | 'break'
  | 'watch';

export type FilterType = 'all' | 'oil' | 'iran' | 'fed' | 'macro' | 'break';

export type ReadingMode =
  | 'headline'
  | 'summary'
  | 'breaking'
  | 'watchlist'
  | 'full';

export type InterruptPolicy = 'always' | 'critical' | 'never';

export type ParseStatus = 'live' | 'parsing' | 'error';

export type TraderProfile = 'scalper' | 'daytrader' | 'swing' | 'macro';

// ─── Raw item as returned by the parser ───────────────────────────────────

export interface RawNewsItem {
  time: string;
  headline: string;
  date?: string;
  rawTime?: string;
  /** Source already resolved when seed data provides it */
  src?: string;
}

// ─── Enriched item with all derived metadata ──────────────────────────────

export interface EnrichedItem extends RawNewsItem {
  /** Stable content-based identifier */
  _id: string;
  /** Unix timestamp (ms) when item was added to the list */
  _ts: number;
  /** True only on the render cycle the item was first inserted */
  _new: boolean;
  /** Marked as near-duplicate of an earlier item */
  _dup?: boolean;
  tags: TagType[];
  priority: Priority;
  isBreaking: boolean;
  /** Matches one of the user's watchlist keywords */
  watchHit: boolean;
  src: string;
}

// ─── History ──────────────────────────────────────────────────────────────

export interface HistoryEntry {
  item: EnrichedItem;
  /** HH:MM:SS string captured when the item finished reading */
  readAt: string;
}

// ─── Rules / settings  ────────────────────────────────────────────────────

export interface Rules {
  interrupt:      boolean;
  dedup:          boolean;
  skipP4:         boolean;
  context:        boolean;
  tone:           boolean;
  stale:          boolean;
  mutRatings:     boolean;
  muteDividends:  boolean;
  muteCrypto:     boolean;
  muteSports:     boolean;
}

// ─── TTS voice settings ───────────────────────────────────────────────────

export interface VoiceSettings {
  rate:              number;
  pitch:             number;
  volume:            number;
  /** Gap in seconds between items */
  gap:               number;
  selectedVoiceName: string;
}

// ─── Sidebar market grid ──────────────────────────────────────────────────

export interface MarketQuote {
  name:      string;
  price:     string;
  change:    string;
  direction: 'up' | 'dn' | 'fl';
}

// ─── Scrolling ticker ─────────────────────────────────────────────────────

export interface TickerItem {
  label:     string;
  value:     string;
  direction: 'up' | 'dn' | 'fl';
  suffix?:   string;
}

// ─── Toast notifications ──────────────────────────────────────────────────

export interface NotificationState {
  head:    string;
  body:    string;
  isP1:    boolean;
  visible: boolean;
}

// ─── Context shape ────────────────────────────────────────────────────────

export interface AppState {
  allItems:        EnrichedItem[];
  readQueue:       EnrichedItem[];
  history:         HistoryEntry[];
  watchlist:       string[];
  rules:           Rules;
  currentFilter:   FilterType;
  autoOn:          boolean;
  isPlaying:       boolean;
  isPaused:        boolean;
  muteUntil:       number;
  interruptPolicy: InterruptPolicy;
  readCount:       number;
  lastSpokenId:    string | null;
  parseStatus:     ParseStatus;
  parseStatusText: string;
  readingMode:     ReadingMode;
  voiceSettings:   VoiceSettings;
  voices:          SpeechSynthesisVoice[];
  notification:    NotificationState;
  isSettingsOpen:  boolean;
  activeFeedItem:  string | null;
}
