'use client';

import { useCallback, useEffect, useRef } from 'react';
import { enrichItem, isDuplicate, parseLiveSquawk } from '@/lib/enrichment';
import {
  DEFAULT_POLL_INTERVAL_MS,
  FEED_ENDPOINT,
  MAX_ALL_ITEMS,
  MAX_SEEN_HASHES,
} from '@/lib/constants';
import type { AppState, EnrichedItem } from '@/types';

interface UseFeedPollingOptions {
  setAllItems: React.Dispatch<React.SetStateAction<EnrichedItem[]>>;
  setParseStatus: (status: AppState['parseStatus'], text: string) => void;
  scheduleItem: (item: EnrichedItem) => void;
  watchlistRef: React.RefObject<string[]>;
  rulesRef: React.RefObject<{ dedup: boolean }>;
  seenHashRef: React.MutableRefObject<Set<string>>;
  parseErrorsRef: React.MutableRefObject<number>;
  pollIntervalMs?: number;
}

function trimSeenHashes(
  seenHashRef: React.MutableRefObject<Set<string>>,
  items: EnrichedItem[],
): void {
  if (seenHashRef.current.size <= MAX_SEEN_HASHES) return;
  seenHashRef.current = new Set(
    items.map(item => `${item.time}|${item.headline.slice(0, 50)}`),
  );
}

export function useFeedPolling({
  setAllItems,
  setParseStatus,
  scheduleItem,
  watchlistRef,
  rulesRef,
  seenHashRef,
  parseErrorsRef,
  pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
}: UseFeedPollingOptions) {
  const scheduleItemRef = useRef(scheduleItem);
  scheduleItemRef.current = scheduleItem;

  const processItems = useCallback((rawItems: ReturnType<typeof parseLiveSquawk>) => {
    let newCount = 0;
    const now = Date.now();

    setAllItems(prev => {
      // If feed items are empty but seen hashes are populated, recover by resetting
      // the hash cache so the current batch can repopulate the feed.
      if (prev.length === 0 && seenHashRef.current.size > 0) {
        seenHashRef.current = new Set();
      }

      const updated = [...prev];
      for (const raw of rawItems) {
        const hash = `${raw.time}|${raw.headline.slice(0, 50)}`;
        if (seenHashRef.current.has(hash)) continue;
        seenHashRef.current.add(hash);

        const enriched = enrichItem(raw, watchlistRef.current);
        enriched._ts = now - newCount * 1000;
        enriched._new = true;

        if (rulesRef.current.dedup && isDuplicate(enriched, updated)) {
          enriched._dup = true;
        } else {
          scheduleItemRef.current(enriched);
        }

        updated.unshift(enriched);
        newCount++;
      }

      const capped = updated.slice(0, MAX_ALL_ITEMS);
      trimSeenHashes(seenHashRef, capped);

      return capped.map((item, idx) =>
        idx >= newCount ? { ...item, _new: false } : item,
      );
    });
  }, [rulesRef, seenHashRef, setAllItems, watchlistRef]);

  const fetchFeed = useCallback(async () => {
    setParseStatus('parsing', 'FETCHING…');
    try {
      const res = await fetch(FEED_ENDPOINT, { signal: AbortSignal.timeout(10_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const items = parseLiveSquawk(html);

      if (items.length > 0) {
        parseErrorsRef.current = 0;
        processItems(items);
        setParseStatus('live', 'LIVE · LiveFeed');
        return;
      }
    } catch {
      // handled below
    }

    parseErrorsRef.current++;
    const failures = parseErrorsRef.current;
    if (failures > 3) {
      setParseStatus('error', 'FEED ERROR — retry later');
    } else {
      const backoffMs = Math.min(pollIntervalMs * failures, pollIntervalMs * 3);
      setParseStatus('parsing', `RETRYING in ${Math.round(backoffMs / 1000)}s…`);
    }
  }, [parseErrorsRef, pollIntervalMs, processItems, setParseStatus]);

  useEffect(() => {
    fetchFeed();
    const interval = setInterval(fetchFeed, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchFeed, pollIntervalMs]);

  return { fetchFeed, processItems };
}
