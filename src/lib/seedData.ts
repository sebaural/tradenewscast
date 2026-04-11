import type { RawNewsItem } from '@/types';

/**
 * Static seed items displayed while the live feed is loading.
 * Time strings are in HH:MM format matching LiveSquawk's output.
 */
export const seedData: RawNewsItem[] = [
  { time: '09:08', headline: 'Lebanon, Israel agree to hold first meeting Tuesday at US State Dept to discuss ceasefire and begin talks', src: 'LiveSquawk' },
  { time: '09:01', headline: 'US equity closes: S&P 500 -0.11% at 6,816 — Nasdaq +0.34% at 22,898 — Dow -0.58% at 47,905', src: 'LiveSquawk' },
  { time: '08:49', headline: 'More US forces deploy to Middle East — WSJ', src: 'WSJ' },
  { time: '08:47', headline: 'Iranian delegation lands in Islamabad; includes Foreign Minister, Defence Council Secretary and C.Bank Governor — RTRS', src: 'RTRS' },
  { time: '08:20', headline: "White House NEC Hassett: Starting to see more ships come through Straits; Hormuz could open in 2 months; GDP effect muted from disruption", src: 'Fox' },
  { time: '08:07', headline: 'US DoE to loan 8.5M barrels of crude from SPR to 4 companies including Macquarie, Phillips 66 — RTRS', src: 'RTRS' },
  { time: '08:04', headline: 'World Bank Banga: global growth to drop 0.2–0.3ppts even if ceasefire holds; inflation up to 300bps from war', src: 'WorldBank' },
  { time: '07:29', headline: 'Iran parliament: Strait of Hormuz not opened in 2 days since ceasefire violation; even non-hostile ships blocked from passing', src: 'IranMedia' },
  { time: '07:25', headline: 'Senators push CFTC to probe oil trading before Trump Iran news — Bloomberg', src: 'BBG' },
  { time: '07:02', headline: 'White House: Trump now believes opening Strait of Hormuz is unlikely anytime soon — Reuters', src: 'RTRS' },
  { time: '05:48', headline: 'NY Fed GDP Nowcast Q1: 2.31% prev 2.41%; Q2: 2.60% prev 2.82%', src: 'NYFed' },
  { time: '05:42', headline: 'China moves to ban sulfuric acid exports as Iran war hits supply — Bloomberg', src: 'BBG' },
  { time: '05:29', headline: "Trump on Truth Social: Iranians don't realize they have no cards other than short-term extortion via international waterways", src: 'TruthSocial' },
  { time: '04:31', headline: "Trump tells NY Post he's preparing military if Iran fails to comply: 'We're loading up the ships'", src: 'NYPost' },
  { time: '03:52', headline: 'Kuwaiti Army: Iranian attack targeted National Guard facilities; injuries reported to number of personnel', src: 'Kuwait' },
  { time: '03:10', headline: 'US likely to approve Russian crude sanctions waiver extension as early as Friday — Reuters sources', src: 'RTRS' },
  { time: '03:00', headline: 'US Univ. of Michigan Sentiment April prelim: 47.6 vs est 51.5, prev 53.3; 1-year inflation expectation: 4.8%', src: 'UMich' },
  { time: '02:56', headline: 'Ukrainian military claims it struck Russian drilling platforms in Caspian Sea', src: 'Ukraine' },
  { time: '02:02', headline: 'Lockheed Martin gets $4.7B contract for missile production', src: 'DoD' },
  { time: '01:47', headline: 'Gasoline prices rise in US CPI most on record since 1967', src: 'BLS' },
  { time: '01:31', headline: 'US CPI March — month over month: +0.9%; year over year: +3.3% vs est 3.4%, prev 2.4%; Core CPI YoY: +2.6%', src: 'BLS' },
  { time: '01:06', headline: "Fed Daly: rate cut not out of the question if Iran conflict resolves quickly; puts lower probability on hike than cut or hold", src: 'Fed' },
];

/** Static market data for the sidebar */
export const MARKET_QUOTES = [
  { name: 'BRENT',    price: '$95.20', change: '▼ 0.75%', direction: 'dn' as const },
  { name: 'WTI',      price: '$96.57', change: '▼ 1.33%', direction: 'dn' as const },
  { name: 'S&P 500',  price: '6,816',  change: '▼ 0.11%', direction: 'dn' as const },
  { name: 'NASDAQ',   price: '22,898', change: '▲ 0.34%', direction: 'up' as const },
  { name: 'CPI YoY',  price: '3.3%',   change: 'PREV 2.4%', direction: 'dn' as const },
  { name: 'CORE CPI', price: '2.6%',   change: 'EST 2.7%',  direction: 'fl' as const },
];

/** Ticker items — duplicated for seamless loop */
const BASE_TICKER = [
  { label: 'BRENT',       value: '$95.20',    direction: 'dn' as const },
  { label: 'WTI',         value: '$96.57',    direction: 'dn' as const },
  { label: 'S&P 500',     value: '6,816',     direction: 'dn' as const },
  { label: 'NASDAQ',      value: '22,898',    direction: 'up' as const },
  { label: 'DOW',         value: '47,905',    direction: 'dn' as const },
  { label: 'US CPI YoY',  value: '3.3%',      direction: 'dn' as const, suffix: 'PREV 2.4%' },
  { label: 'HORMUZ FLOW', value: '9 vessels/day', direction: 'dn' as const, suffix: 'vs ~100 NORMAL' },
  { label: 'FED RATE',    value: '4.25–4.50%', direction: 'fl' as const, suffix: 'HOLD' },
  { label: 'GOLD',        value: '$3,126',    direction: 'up' as const },
  { label: 'EUR/USD',     value: '1.0892',    direction: 'fl' as const },
  { label: 'USD/JPY',     value: '158.40',    direction: 'up' as const },
];

// Duplicate for seamless CSS marquee loop
export const TICKER_ITEMS = [...BASE_TICKER, ...BASE_TICKER];
