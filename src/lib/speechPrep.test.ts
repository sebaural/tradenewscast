import { describe, expect, it } from 'vitest';
import { prepSpeech } from './speechPrep';
import { enrichItem } from './enrichment';
import { SAMPLE_NEWS } from './__fixtures__/sampleNews';
import type { Rules } from '@/types';

const DEFAULT_RULES: Rules = {
  interrupt: true,
  dedup: true,
  skipP4: true,
  context: true,
  tone: true,
  stale: true,
  muteRatings: false,
  muteDividends: true,
  muteCrypto: false,
  muteSports: true,
};

describe('prepSpeech', () => {
  it('expands abbreviations for TTS', () => {
    const item = enrichItem(
      { time: '09:00', headline: 'US CPI rises 0.3% M/M; FOMC on hold — Reuters' },
      [],
    );
    const text = prepSpeech(item, 'headline', DEFAULT_RULES);
    expect(text).toMatch(/C P I/);
    expect(text).toMatch(/month over month/);
  });

  it('prefixes breaking items in breaking mode', () => {
    const item = enrichItem(
      { time: '09:00', headline: 'Breaking: war escalates near Strait of Hormuz' },
      [],
    );
    const text = prepSpeech(item, 'breaking', DEFAULT_RULES);
    expect(text).toMatch(/^Breaking\./);
  });

  it('includes market context in summary mode when enabled', () => {
    const item = enrichItem(SAMPLE_NEWS[1], []);
    const text = prepSpeech(item, 'summary', DEFAULT_RULES);
    expect(text).toMatch(/Inflation data/);
  });
});
