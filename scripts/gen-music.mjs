// Synthesises three original, loopable ambient tracks (no samples, no licensing).
// Run: node scripts/gen-music.mjs
import { writeFile } from "node:fs/promises";

const SR = 22050;
const midi = (n) => 440 * 2 ** ((n - 69) / 12);

function render({ seconds, bpm, root, scale, pad, arp, wave, seed }) {
  const N = SR * seconds;
  const buf = new Float32Array(N);
  let s = seed;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
  const osc = (f, t) => {
    const p = (f * t) % 1;
    if (wave === "tri") return 4 * Math.abs(p - 0.5) - 1;
    if (wave === "sq") return (p < 0.5 ? 1 : -1) * 0.6;
    return Math.sin(2 * Math.PI * p);
  };
  const beat = 60 / bpm;
  const bar = beat * 4;
  // slow pad chords, one per bar
  for (let b = 0; b * bar < seconds; b++) {
    const chord = pad[b % pad.length];
    for (const deg of chord) {
      const f = midi(root + deg);
      const t0 = b * bar, len = bar;
      for (let i = 0; i < len * SR; i++) {
        const idx = Math.floor(t0 * SR) + i;
        if (idx >= N) break;
        const t = i / SR;
        const env = Math.min(1, t / 0.9) * Math.min(1, (len - t) / 0.9);
        buf[idx] += (Math.sin(2 * Math.PI * f * t) + 0.4 * Math.sin(2 * Math.PI * f * 1.003 * t)) * env * 0.05;
      }
    }
  }
  // plucked arpeggio on pentatonic degrees
  const step = beat / 2;
  for (let k = 0; k * step < seconds; k++) {
    if (rnd() < 0.22) continue;
    const deg = scale[arp[k % arp.length] % scale.length] + (rnd() < 0.15 ? 12 : 0);
    const f = midi(root + 12 + deg);
    const t0 = k * step;
    const len = 0.9;
    for (let i = 0; i < len * SR; i++) {
      const idx = Math.floor(t0 * SR) + i;
      if (idx >= N) break;
      const t = i / SR;
      buf[idx] += osc(f, t) * Math.exp(-t * 5) * 0.11;
    }
  }
  // tape-ish echo
  const d = Math.floor(SR * beat * 0.75);
  for (let i = d; i < N; i++) buf[i] += buf[i - d] * 0.38;
  // seamless loop: crossfade tail into head
  const xf = SR * 2;
  for (let i = 0; i < xf; i++) {
    const a = i / xf;
    buf[i] = buf[i] * a + buf[N - xf + i] * (1 - a);
  }
  const trimmed = buf.subarray(0, N - xf);
  let peak = 0;
  for (const v of trimmed) peak = Math.max(peak, Math.abs(v));
  const out = new Int16Array(trimmed.length);
  for (let i = 0; i < out.length; i++) out[i] = Math.round((trimmed[i] / peak) * 0.8 * 32767);
  return out;
}

function wav(samples) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write("RIFF", 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write("WAVEfmt ", 8);
  b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write("data", 36); b.writeUInt32LE(samples.length * 2, 40);
  Buffer.from(samples.buffer).copy(b, 44);
  return b;
}

const pent = [0, 2, 4, 7, 9];
const minorPent = [0, 3, 5, 7, 10];
const tracks = {
  "grove-morning": { seconds: 46, bpm: 76, root: 60, scale: pent, pad: [[0, 4, 7], [-3, 4, 9], [-5, 2, 7], [-7, 0, 4]], arp: [0, 2, 4, 3, 1, 2, 4, 0], wave: "sine", seed: 11 },
  "mushroom-hour": { seconds: 46, bpm: 64, root: 57, scale: minorPent, pad: [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-5, 2, 7]], arp: [0, 3, 1, 4, 2, 3, 0, 2], wave: "tri", seed: 29 },
  "fireflies-loop": { seconds: 46, bpm: 92, root: 64, scale: pent, pad: [[0, 7, 12], [-5, 4, 9], [-7, 2, 7], [-3, 4, 9]], arp: [4, 2, 0, 1, 3, 2, 4, 1], wave: "sq", seed: 47 },
};
for (const [name, cfg] of Object.entries(tracks)) {
  await writeFile(new URL(`../public/music/${name}.wav`, import.meta.url), wav(render(cfg)));
  console.log("wrote", name);
}
