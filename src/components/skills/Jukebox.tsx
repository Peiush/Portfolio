import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";
import { tracks } from "../../data/skills";
import { track } from "../../lib/track";
import { theme } from "./Window";

export type JukeboxCmd = "play" | "pause" | "next" | "prev" | "toggle";

const fmt = (s: number) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");

/** Owns the <audio> element state. Also listens for `jukebox` CustomEvents so the terminal can drive it. */
export function useJukebox(audio: RefObject<HTMLAudioElement | null>) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState(false);
  const wantPlay = useRef(false);

  // load the selected track; resume if the user was already listening
  useEffect(() => {
    const a = audio.current;
    if (!a || !tracks.length) return;
    a.src = tracks[idx].src;
    a.load();
    setTime(0); setDuration(0); setError(false);
    if (wantPlay.current) a.play().then(() => setPlaying(true)).catch(() => { setPlaying(false); wantPlay.current = false; });
  }, [idx, audio]);

  useEffect(() => {
    const a = audio.current;
    if (a) { a.volume = volume; a.muted = muted; }
  }, [volume, muted, audio]);

  useEffect(() => {
    const a = audio.current;
    if (!a) return;
    const on = {
      timeupdate: () => setTime(a.currentTime),
      loadedmetadata: () => setDuration(a.duration),
      pause: () => setPlaying(false),
      play: () => setPlaying(true),
      error: () => { if (a.src) { setError(true); setPlaying(false); wantPlay.current = false; } },
    };
    (Object.keys(on) as (keyof typeof on)[]).forEach((k) => a.addEventListener(k, on[k]));
    return () => (Object.keys(on) as (keyof typeof on)[]).forEach((k) => a.removeEventListener(k, on[k]));
  }, [audio]);

  const step = useCallback((d: number) => {
    if (!tracks.length) return;
    setIdx((i) => (i + d + tracks.length) % tracks.length);
  }, []);

  const play = useCallback(() => {
    const a = audio.current;
    if (!a || !tracks.length) return;
    wantPlay.current = true;
    a.play().then(() => { setPlaying(true); track("music_play", { track: tracks[idx].title }); }).catch(() => { setPlaying(false); wantPlay.current = false; });
  }, [audio, idx]);

  const pause = useCallback(() => {
    wantPlay.current = false;
    audio.current?.pause();
    setPlaying(false);
  }, [audio]);

  const toggle = useCallback(() => (playing ? pause() : play()), [playing, play, pause]);
  const seek = useCallback((t: number) => { if (audio.current) audio.current.currentTime = t; setTime(t); }, [audio]);
  const pick = useCallback((i: number) => { setIdx(i); wantPlay.current = true; }, []);

  useEffect(() => {
    const onCmd = (e: Event) => {
      const c = (e as CustomEvent<JukeboxCmd>).detail;
      if (c === "play") play();
      else if (c === "pause") pause();
      else if (c === "toggle") toggle();
      else if (c === "next") { wantPlay.current = true; step(1); }
      else if (c === "prev") { wantPlay.current = true; step(-1); }
    };
    window.addEventListener("jukebox", onCmd);
    return () => window.removeEventListener("jukebox", onCmd);
  }, [play, pause, toggle, step]);

  return {
    idx, playing, time, duration, volume, muted, error,
    current: tracks[idx],
    play, pause, toggle, seek, pick,
    next: () => { wantPlay.current = playing || wantPlay.current; step(1); },
    prev: () => { wantPlay.current = playing || wantPlay.current; step(-1); },
    setVolume: (v: number) => { setVolumeState(v); if (v > 0) setMuted(false); },
    toggleMute: () => setMuted((m) => !m),
  };
}

export type Jukebox = ReturnType<typeof useJukebox>;

const btn = `w-7 h-6 flex items-center justify-center bg-[#c0c0c0] text-black font-mono text-[11px] ${theme.raised} active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white focus-visible:outline-2 focus-visible:outline-[#2d6a4f]`;

export function JukeboxWindow({ jb, reduced }: { jb: Jukebox; reduced: boolean }) {
  if (!tracks.length) return <p className="p-3 text-[11px] font-mono">no tracks yet.</p>;
  const pct = jb.duration ? (jb.time / jb.duration) * 100 : 0;
  return (
    <div className="p-2 text-[#3d2514] font-mono">
      {/* display */}
      <div className="bg-[#152e22] text-[#52b788] p-2 shadow-[inset_2px_2px_6px_rgba(0,0,0,.5)]">
        <div className="flex items-end gap-2">
          <div className="flex items-end gap-[2px] h-7 shrink-0" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <i
                key={i}
                className="satchel-bar block w-[3px] h-full bg-[#52b788]"
                style={{ animationDelay: `${(i * 97) % 600}ms`, animationDuration: `${0.6 + (i % 4) * 0.25}s`, animationPlayState: jb.playing && !reduced ? "running" : "paused", transform: jb.playing ? undefined : "scaleY(.15)" }}
              />
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] text-[#e9d8a6] truncate" aria-live="polite">{String(jb.idx + 1).padStart(2, "0")}. {jb.current.title}</p>
            <p className="text-[9px] text-[#52b788]/80">{jb.error ? "ERR: cannot load track" : jb.playing ? "▶ playing" : "❚❚ stopped"} · {fmt(jb.time)} / {fmt(jb.duration)}</p>
          </div>
        </div>
        <input
          type="range" min={0} max={jb.duration || 1} step={0.1} value={jb.time}
          onChange={(e) => jb.seek(Number(e.target.value))}
          aria-label="Seek" data-cursor="retro-hand"
          className="w-full mt-2 h-1.5 accent-[#52b788] cursor-pointer"
          style={{ background: `linear-gradient(to right,#52b788 ${pct}%,#2d6a4f ${pct}%)` }}
        />
      </div>

      {/* transport */}
      <div className="flex items-center gap-1 mt-2">
        <button type="button" data-cursor="retro-hand" onClick={jb.prev} aria-label="Previous track" className={btn}>◄◄</button>
        <button type="button" data-cursor="retro-hand" onClick={jb.toggle} aria-label={jb.playing ? "Pause" : "Play"} className={btn}>{jb.playing ? "❚❚" : "►"}</button>
        <button type="button" data-cursor="retro-hand" onClick={jb.next} aria-label="Next track" className={btn}>►►</button>
        <button type="button" data-cursor="retro-hand" onClick={jb.toggleMute} aria-label={jb.muted ? "Unmute" : "Mute"} aria-pressed={jb.muted} className={`${btn} ml-auto`}>{jb.muted || jb.volume === 0 ? "🔇" : "🔊"}</button>
        <input
          type="range" min={0} max={1} step={0.05} value={jb.muted ? 0 : jb.volume}
          onChange={(e) => jb.setVolume(Number(e.target.value))}
          aria-label="Volume" data-cursor="retro-hand"
          className="w-16 accent-[#bc6c25] cursor-pointer"
        />
      </div>

      {/* playlist */}
      <ol className="mt-2 bg-white border border-[#dda15e] text-[10px]">
        {tracks.map((t, i) => (
          <li key={t.src}>
            <button
              type="button" data-cursor="retro-hand" onClick={() => { jb.pick(i); }}
              aria-current={i === jb.idx}
              className={`w-full text-left px-2 py-1 flex justify-between gap-2 ${i === jb.idx ? "bg-[#000080] text-white" : "hover:bg-[#f4e3b1]"}`}
            >
              <span className="truncate">{String(i + 1).padStart(2, "0")}. {t.title}</span>
              <span className="shrink-0 opacity-70">{t.length}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-1.5 text-[9px] text-[#606c38]">original loops, synthesised in code · tip: try <span className="underline">play</span> in the terminal</p>
    </div>
  );
}
