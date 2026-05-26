import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { enrichItem, isDuplicate, parseLiveSquawk } from './enrichment';
import { SAMPLE_NEWS } from './__fixtures__/sampleNews';

const fixtureHtml = readFileSync(
  join(__dirname, '__fixtures__/livesquawk.html'),
  'utf-8',
);

describe('parseLiveSquawk', () => {
  it('parses headlines from HTML fixture', () => {
    const items = parseLiveSquawk(fixtureHtml);
    expect(items.length).toBeGreaterThanOrEqual(3);
    expect(items[0].headline).toMatch(/Fed|rate cut/i);
  });

  it('filters script lines and decodes entities', () => {
    const items = parseLiveSquawk(fixtureHtml);
    const entityItem = items.find(i => i.headline.includes('entity decoding'));
    expect(entityItem).toBeDefined();
    expect(entityItem!.headline).not.toContain('&amp;');
  });
});

describe('enrichItem', () => {
  it('assigns P1 priority to breaking Fed headlines', () => {
    const item = enrichItem(
      { time: '09:00', headline: 'Breaking: Fed announces emergency rate cut — Reuters' },
      [],
    );
    expect(item.priority).toBe(1);
    expect(item.isBreaking).toBe(true);
    expect(item.tags).toContain('fed');
  });

  it('matches watchlist keywords safely', () => {
    const item = enrichItem(
      { time: '08:00', headline: 'Oil supply disruption in Hormuz region' },
      ['HORMUZ'],
    );
    expect(item.watchHit).toBe(true);
    expect(item.tags).toContain('watch');
  });

  it('does not treat regex metacharacters in watchlist as patterns', () => {
    const item = enrichItem(
      { time: '08:00', headline: 'Price (a+)+ pattern test headline' },
      ['(a+)+'],
    );
    expect(item.watchHit).toBe(true);
  });
});

describe('isDuplicate', () => {
  it('detects near-duplicate headlines', () => {
    const base = enrichItem(SAMPLE_NEWS[0], []);
    const similar = enrichItem(
      {
        ...SAMPLE_NEWS[0],
        headline: 'Lebanon Israel agree first meeting Tuesday US State Dept ceasefire talks',
      },
      [],
    );
    expect(isDuplicate(similar, [base])).toBe(true);
  });
});
