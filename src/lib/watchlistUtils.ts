/** Escape user input before compiling watchlist patterns. */

export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function matchesWatchword(headline: string, watchword: string): boolean {
  const trimmed = watchword.trim();
  if (!trimmed) return false;
  return new RegExp(escapeRegex(trimmed), 'i').test(headline);
}
