import { describe, expect, it } from 'vitest';
import { escapeRegex, matchesWatchword } from './watchlistUtils';

describe('watchlistUtils', () => {
  it('escapes regex metacharacters', () => {
    expect(escapeRegex('(a+)+')).toBe('\\(a\\+\\)\\+');
  });

  it('matches watchwords as literal substrings', () => {
    expect(matchesWatchword('Oil prices rise in Hormuz', 'HORMUZ')).toBe(true);
    expect(matchesWatchword('Random headline', 'HORMUZ')).toBe(false);
  });
});
