/**
 * Plays a short alert beep using the Web Audio API.
 * Silently no-ops in environments where AudioContext is unavailable.
 */
export function playBeep(freq = 880, dur = 0.12, vol = 0.3): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx  = new AudioCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);

    osc.start();
    osc.stop(ctx.currentTime + dur);
    setTimeout(() => void ctx.close(), dur * 1000 + 200);
  } catch {
    // AudioContext blocked or unavailable — ignore
  }
}
