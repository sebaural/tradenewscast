import type { EnrichedItem, Priority, RawNewsItem, TagType } from '@/types';

// ─── Keyword taxonomy ─────────────────────────────────────────────────────

const KEYWORDS: Readonly<Record<string, string[]>> = {
  oil:     ['oil','brent','crude','wti','opec','barrel','bpd','hormuz','petroleum','refinery','spr','energy'],
  iran:    ['iran','irgc','tehran','hormuz','ceasefire','pezeshkian','araqchi','khamenei','islamabad','vance','trump.*iran'],
  fed:     ['fed ','federal reserve','fomc','rate cut','rate hike','cpi','pce','inflation','nfp','payroll','powell','daly','waller','ecb','boj','rbnz','bok','interest rate'],
  macro:   ['gdp','growth','recession','unemployment','jobs','trade deficit','tariff','sanctions','debt','budget','treasury','yield','bonds?','bunds?'],
  geo:     ['war','attack','military','strike','troops','ceasefire','conflict','nuclear','sanctions','nato','ukraine','russia','china.*taiwan','taiwan','hezbollah','lebanon','israel','saudi','kuwait','houthi'],
  markets: ['earnings','ipo','merger','acquisition','buyback','dividend','downgrade','upgrade','price target','shares','stock'],
} as const;

const P1_TRIGGERS: RegExp[] = [
  /\b(fed|fomc|federal reserve)\b.*\b(rate|cut|hike|emergency)\b/i,
  /\b(cpi|nfp|nonfarm|payroll|gdp|inflation)\b.*\b(print|data|release|shock)\b/i,
  /\bbreaking\b/i,
  /\b(war|escalat|attack|strike|nuclear|sanction)\b/i,
  /\b(trump|white house|president)\b.*\b(iran|oil|rate|tariff|war)\b/i,
  /strait of hormuz/i,
  /\b(fed|ecb|boj)\b.*\b(emergency|surprise|unexpected)\b/i,
  /\b(exchange|trading halt|circuit breaker|flash crash)\b/i,
  /\bcrash\b/i,
  /\b(iran|russia|china)\b.*\b(attack|escalat|sanction|military)\b/i,
];

const P4_TRIGGERS: RegExp[] = [
  /dividend/i,
  /price target/i,
  /analyst.*rating/i,
  /rating.*analyst/i,
  /quarterly.*report/i,
  /earnings.*preview/i,
  /\bscheduled\b/i,
  /conference call/i,
  /annual meeting/i,
];

// ─── Enrichment ───────────────────────────────────────────────────────────

export function enrichItem(raw: RawNewsItem, watchlist: string[]): EnrichedItem {
  const tags: TagType[] = [];

  Object.entries(KEYWORDS).forEach(([cat, kws]) => {
    if (kws.some(kw => new RegExp(kw, 'i').test(raw.headline))) {
      tags.push(cat as TagType);
    }
  });

  let priority: Priority = 3;
  if (P1_TRIGGERS.some(rx => rx.test(raw.headline))) priority = 1;
  else if (tags.includes('iran') || tags.includes('fed') || tags.includes('geo')) priority = 2;
  else if (P4_TRIGGERS.some(rx => rx.test(raw.headline))) priority = 4;

  const isBreaking = priority === 1 || /\bbreaking\b/i.test(raw.headline);
  if (isBreaking && !tags.includes('break')) tags.push('break');

  const watchHit = watchlist.some(w => new RegExp(w, 'i').test(raw.headline));
  if (watchHit && !tags.includes('watch')) tags.push('watch');

  // Source normalisation
  let src = raw.src ?? 'LiveSquawk';
  const srcRx = /[-–—]\s*(RTRS|Reuters|BBG|Bloomberg|WSJ|FT|CNBC|CNN|Fox|NBC|AP|Sky|AFP|NYPost|WaPo|Axios|Politico|IranIntl|AlJazeera|Al Jazeera|Xinhua|Kremlin|StateDept|State Dept)\b/i;
  const m = raw.headline.match(srcRx);
  if (m) {
    src = m[1]
      .replace(/^RTRS$/i, 'Reuters')
      .replace(/^BBG$/i, 'Bloomberg')
      .replace(/^StateDept$/i, 'State Dept');
  }

  return {
    ...raw,
    _id: `${raw.time}|${raw.headline.slice(0, 50)}`,
    _ts: Date.now(),
    _new: true,
    tags,
    priority,
    isBreaking,
    watchHit,
    src,
  };
}

// ─── Deduplication ────────────────────────────────────────────────────────

export function isDuplicate(item: EnrichedItem, existing: EnrichedItem[]): boolean {
  const words = new Set(
    item.headline
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4),
  );

  for (const prev of existing.slice(0, 30)) {
    if (prev._dup) continue;
    const ewords = new Set(
      prev.headline
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 4),
    );
    let common = 0;
    words.forEach(w => { if (ewords.has(w)) common++; });
    const similarity = common / Math.max(words.size, ewords.size, 1);
    if (similarity > 0.6) return true;
  }
  return false;
}

// ─── LiveSquawk HTML parser ───────────────────────────────────────────────

export function parseLiveSquawk(html: string): RawNewsItem[] {
  const items: RawNewsItem[] = [];
  
  // Remove script and style blocks before stripping other HTML tags
  let cleaned = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n');
  
  const lines = cleaned
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  const timeRx  = /^(\d{1,2}:\d{2}:\d{2})$/;
  const timeRx2 = /^(\d{1,2}:\d{2})$/;
  const dateRx  = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s+\d{2}\.\d{2}\.\d{4}$/i;

  let i = 0;
  let currentTime = '';
  let currentDate = '';

  while (i < lines.length) {
    const line = lines[i];

    if (dateRx.test(line)) { currentDate = line; i++; continue; }

    if (timeRx.test(line) || timeRx2.test(line)) {
      currentTime = line.slice(0, 5);
      i++;

      const parts: string[] = [];
      while (i < lines.length) {
        const next = lines[i];
        if (timeRx.test(next) || timeRx2.test(next) || dateRx.test(next)) break;
        if (
          next.startsWith('http') ||
          next.startsWith('READ HERE') ||
          next.startsWith('CLICK HERE')
        ) { i++; continue; }

        // Filter out lines that look like code
        if (
          /\bvar\s+\w+\s*=|function\s*\(|\blet\s+|\bconst\s+|\/\*.*\*\/|^\/\/|;\s*$/.test(next) ||
          /[\{\}\[\];:=&|<>]/.test(next.slice(-5)) // ends with code-like chars
        ) { i++; continue; }

        if (next.length > 5 && next.length < 500) parts.push(next);
        else if (next.startsWith('-') && parts.length > 0) parts.push(next);

        i++;
        if (parts.length >= 6) break;
      }

      if (parts.length > 0) {
        const headline = parts.join(' — ').replace(/\s+/g, ' ').trim();
        if (headline.length > 15) {
          items.push({ time: currentTime, headline, date: currentDate, rawTime: currentTime });
        }
      }
      continue;
    }
    i++;
  }

  return items;
}
