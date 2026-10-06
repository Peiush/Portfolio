let ctx: AudioContext | null = null;

/** Must be called from a user gesture. */
export function ensureAudio() {
  if (ctx) return;
  try {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
  } catch {
    ctx = null;
  }
}

function tone(type: OscillatorType, freqs: number[], dur: number, vol = 0.06, delay = 0) {
  if (!ctx) return;
  try {
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    freqs.forEach((f, i) => {
      if (i === 0) o.frequency.setValueAtTime(f, t);
      else o.frequency.linearRampToValueAtTime(f, t + (dur * i) / (freqs.length - 1));
    });
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur);
  } catch {
    /* audio is optional */
  }
}

export const sfx = {
  meow: () => tone("triangle", [380, 780, 580], 0.35),
  boop: () => tone("sine", [290, 145], 0.15, 0.08),
  bounce: () => tone("sine", [110, 55], 0.12, 0.08),
  spawn: () => tone("triangle", [220, 440, 880], 0.25),
  magic: () => [523, 659, 784, 1047, 2093].forEach((f, i) => tone("sine", [f], 0.22, 0.05, i * 0.08)),
  bark: () => { tone("sawtooth", [130, 65], 0.16, 0.06); tone("sawtooth", [130, 65], 0.16, 0.06, 0.22); },
};
