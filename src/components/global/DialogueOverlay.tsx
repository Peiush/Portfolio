import { useCallback, useEffect, useRef, useState } from "react";
import { useDialogue } from "../../lib/store/dialogue";
import { bitLines, portraitPalette } from "../../data/dialogue";

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FONT_URL = "https://fonts.googleapis.com/css2?family=VT323&display=swap";
let ctx: AudioContext | null = null;

function blip(voice: { type: OscillatorType; hz: number; ms: number; gain: number }) {
  try {
    ctx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = voice.type;
    o.frequency.value = voice.hz * (0.95 + Math.random() * 0.1);
    g.gain.setValueAtTime(voice.gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + voice.ms / 1000);
    o.connect(g).connect(ctx.destination);
    o.start(t); o.stop(t + voice.ms / 1000);
  } catch { /* sound is optional */ }
}

function Portrait({ map }: { map: string[] }) {
  return (
    <svg viewBox={`0 0 ${map[0].length} ${map.length}`} className="w-full h-full" shapeRendering="crispEdges" style={{ imageRendering: "pixelated" }} aria-hidden="true" focusable="false">
      {map.flatMap((row, y) => [...row].map((c, x) => (c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={portraitPalette[c] ?? "#fff"} />)))}
    </svg>
  );
}

export default function DialogueOverlay() {
  const { dialogues, isOpen, show, hide } = useDialogue();
  const [idx, setIdx] = useState(0);
  const [chars, setChars] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const prevFocus = useRef<Element | null>(null);
  const lastBlip = useRef(0);

  const line = dialogues[idx];
  const done = !!line && chars >= line.text.length;

  // open from the terminal
  useEffect(() => {
    const open = () => show(bitLines);
    window.addEventListener("open-dialogue", open);
    return () => window.removeEventListener("open-dialogue", open);
  }, [show]);

  // on open: lazy font, reset, focus
  useEffect(() => {
    if (!isOpen) return;
    if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
      const l = document.createElement("link");
      l.rel = "stylesheet"; l.href = FONT_URL;
      document.head.appendChild(l);
    }
    prevFocus.current = document.activeElement;
    setIdx(0);
    setChars(0);
    requestAnimationFrame(() => root.current?.focus());
  }, [isOpen]);

  const close = useCallback(() => {
    hide();
    setIdx(0);
    (prevFocus.current as HTMLElement | null)?.focus?.();
  }, [hide]);

  // typewriter
  useEffect(() => {
    if (!isOpen || !line) return;
    if (reduced()) { setChars(line.text.length); return; }
    setChars(0);
    const t = setInterval(() => {
      setChars((c) => {
        if (c >= line.text.length) { clearInterval(t); return c; }
        const ch = line.text[c];
        const now = performance.now();
        if (ch !== " " && now - lastBlip.current >= 45 && line.voice) { lastBlip.current = now; blip(line.voice); }
        return c + 1;
      });
    }, 28);
    return () => clearInterval(t);
  }, [isOpen, idx, line]);

  const advance = useCallback(() => {
    if (!line) return;
    if (!done) { setChars(line.text.length); return; }
    if (idx + 1 >= dialogues.length) close();
    else setIdx(idx + 1);
  }, [line, done, idx, dialogues.length, close]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); advance(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, advance, close]);

  if (!isOpen || !line) return null;

  const side = line.portraitSide ?? "left";
  return (
    <div
      ref={root}
      tabIndex={0}
      role="dialog"
      aria-modal="true"
      aria-label={`${line.name ?? "Dialogue"} says`}
      onClick={advance}
      className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-[1px] flex items-end justify-center pb-8 md:pb-12 outline-none cursor-pointer select-none"
    >
      <div
        className={`w-[92%] md:w-[760px] min-h-[140px] md:min-h-[170px] bg-black border-[5px] border-white p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 text-white tracking-wide ${side === "right" ? "md:flex-row-reverse" : ""}`}
        style={{ boxShadow: "0 0 0 5px black inset, 0 10px 30px rgba(0,0,0,.8)", fontFamily: "'VT323', monospace", lineHeight: 1.3 }}
      >
        {line.portrait && (
          <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] bg-black shrink-0 self-start border-2 border-white/20">
            <Portrait map={line.portrait} />
          </div>
        )}
        <div className="flex-1 flex flex-col text-[23px] md:text-[28px]">
          {line.name && <p className="text-[#facc15] uppercase text-[18px] md:text-[20px] tracking-wider font-bold opacity-85">{line.name}</p>}
          <p className="whitespace-pre-wrap" style={{ color: line.textColor }}>
            <span style={{ color: line.asteriskColor ?? "#fff" }}>* </span>
            {line.text.slice(0, chars)}
          </p>
          {done && (
            <div className="mt-auto self-end flex items-center gap-2 text-[#facc15] animate-pulse text-[16px]">
              <span className="hidden md:inline">CLICK TO NEXT</span>
              <svg width="14" height="14" viewBox="0 0 14 14" className="animate-bounce" aria-hidden="true" focusable="false"><path d="M1 3h12L7 12z" fill="currentColor" /></svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
