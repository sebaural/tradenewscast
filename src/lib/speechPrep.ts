import type { EnrichedItem, ReadingMode, Rules } from '@/types';

// ─── Abbreviation table ───────────────────────────────────────────────────

const ABBR: Readonly<Record<string, string>> = {
  'M/M':  'month over month',
  'Y/Y':  'year over year',
  'Q/Q':  'quarter over quarter',
  'bbl':  'barrel',
  'bpd':  'barrels per day',
  'ppt':  'percentage point',
  'ppts': 'percentage points',
  'SPR':  'Strategic Petroleum Reserve',
  'WTI':  'W T I',
  'CPI':  'C P I',
  'PCE':  'P C E',
  'GDP':  'G D P',
  'NFP':  'non-farm payrolls',
  'FOMC': 'F O M C',
  'NEC':  'N E C',
  'CFTC': 'C F T C',
  'DoE':  'Department of Energy',
  'IMF':  'I M F',
  'ECB':  'E C B',
  'BOJ':  'Bank of Japan',
  'BoJ':  'Bank of Japan',
  'RBNZ': 'Reserve Bank of New Zealand',
  'OPEC': 'O P E C',
  'NATO': 'N A T O',
  'IRGC': 'I R G C',
  'UAE':  'U A E',
  'U.S.': 'US',
  'USD':  'US dollars',
  'EUR':  'euros',
  'GBP':  'pounds',
  'JPY':  'yen',
  '&amp;': 'and',
  '&':    'and',
  '—':    '. ',
  '–':    '. ',
  '|':    '. ',
  '…':    '.',
} as const;

// ─── Market context snippets ──────────────────────────────────────────────

function getMarketContext(item: EnrichedItem, rules: Rules): string {
  if (!rules.context) return '';
  const t = item.tags;
  if (t.includes('oil')) {
    if (/hormuz|ceasefire|close/i.test(item.headline))
      return 'Strait of Hormuz news directly impacts global oil supply. Watch crude futures.';
    if (/production|output|supply/i.test(item.headline))
      return 'Production data affects crude pricing and energy sector ETFs.';
  }
  if (t.includes('fed')) {
    if (/cut|lower/i.test(item.headline))
      return 'Rate cut signals are bullish for equities and bonds, bearish for the dollar.';
    if (/hike|higher|hold/i.test(item.headline))
      return 'Hawkish signals may weigh on risk assets and pressure bond prices.';
  }
  if (/cpi/i.test(item.headline))
    return 'Inflation data is a key driver of Fed policy expectations and bond yields.';
  if (t.includes('iran') || t.includes('geo'))
    return 'Geopolitical escalation can affect oil prices, safe havens, and risk appetite.';
  return '';
}

// ─── Main speech preparation ──────────────────────────────────────────────

export function prepSpeech(
  item: EnrichedItem,
  mode: ReadingMode,
  rules: Rules,
): string {
  let text = item.headline;

  // Expand known abbreviations
  Object.entries(ABBR).forEach(([k, v]) => {
    text = text.replace(
      new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      v,
    );
  });

  // Monetary amounts: $1.2B → "1.2 billion dollars"
  text = text.replace(/\$(\d[\d,]*\.?\d*)(B|M|K)?/g, (_, n, s) => {
    const sfx =
      s === 'B' ? ' billion dollars' :
      s === 'M' ? ' million dollars' :
      s === 'K' ? ' thousand dollars' : ' dollars';
    return n.replace(/,/g, '') + sfx;
  });

  // Percentages and basis points
  text = text.replace(/(\d[\d,.]*)\s*%/g, '$1 percent');
  text = text.replace(/(\d+)bps?/gi, '$1 basis points');
  text = text.replace(/\bBbl\b/gi, 'barrel');

  // Strip trailing source attribution
  text = text
    .replace(/[-–—]\s*(Reuters|Bloomberg|WSJ|FT|CNN|CNBC|BBG|RTRS|Fox|NBC|Sky|AFP)$/i, '')
    .trim();

  // Remove non-speech symbols
  text = text.replace(/[*#►▶▼▲]/g, '').replace(/\s+/g, ' ').trim();

  const timeLabel = item.time ? `At ${item.time}. ` : '';

  if (mode === 'headline') return timeLabel + text;
  if (mode === 'breaking' || item.isBreaking) return 'Breaking. ' + text;

  if (mode === 'summary' || mode === 'full') {
    const context = getMarketContext(item, rules);
    return timeLabel + text + (context ? '. ' + context : '');
  }

  return timeLabel + text;
}
