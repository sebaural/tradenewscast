/** Shared mute / filter patterns used by enrichment and the TTS queue. */

export const RATING_MUTE_PATTERNS: RegExp[] = [
  /price target/i,
  /analyst.*rating/i,
  /rating.*analyst/i,
];

export const MUTE_DIVIDENDS = /dividend/i;
export const MUTE_CRYPTO = /crypto|bitcoin|ethereum|defi|token/i;
export const MUTE_SPORTS = /nfl|nba|fifa|formula 1|olympics/i;

export function matchesMuteRatings(headline: string): boolean {
  return RATING_MUTE_PATTERNS.some(rx => rx.test(headline));
}
