import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import { track } from "../../lib/track";
import { useDrawing, type Tool } from "./DrawingCanvas";
import { Palette, pencils } from "./Palette";

const WOBBLE = { filter: "url(#handdrawn-wobble)" } as const;
const FOLD_CLIP = "polygon(0 0, calc(100% - 36px) 0, 100% 36px, 100% 100%, 0 100%)";
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const field = "bg-transparent border-2 border-dashed border-zinc-400 focus:border-zinc-800 px-3 py-2 text-base md:text-sm font-mono rounded outline-none transition-colors w-full";
const label = "font-handwritten text-lg font-bold text-zinc-700";

export default function ContactForm() {
  const section = useRef<HTMLElement>(null);
  const maskRef = useRef<SVGGElement>(null);
  const paper = useRef<HTMLDivElement>(null);
  const plane = useRef<SVGSVGElement>(null);
  const penLine = useRef<SVGPathElement>(null);
  const penText = useRef<SVGTextElement>(null);
  const sway = useRef<gsap.core.Tween | null>(null);

  const [tool, setTool] = useState<Tool>("pencil");
  const [color, setColor] = useState(pencils[0].hex);
  const [paletteOn, setPaletteOn] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const [touchDraw, setTouchDraw] = useState(false);
  const [folded, setFolded] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [attach, setAttach] = useState(false);
  const [trap, setTrap] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<null | { drawing: boolean }>(null);

  /* ---------- analytics (aggregated) ---------- */
  const stats = useRef({ started: 0, strokes: 0, clears: 0, eraser: false, timer: 0 });
  const flush = useCallback((end: boolean) => {
    const s = stats.current;
    if (!s.started) return;
    track("drawing_summary", {
      drawing_duration_seconds: Math.round((Date.now() - s.started) / 1000),
      drawing_stroke_count: s.strokes, drawing_clear_count: s.clears, drawing_eraser_used: s.eraser, session_end: end,
    });
    stats.current = { started: 0, strokes: 0, clears: 0, eraser: false, timer: 0 };
  }, []);
  const touch = useCallback(() => {
    window.clearTimeout(stats.current.timer);
    stats.current.timer = window.setTimeout(() => flush(false), 15000);
  }, [flush]);

  const { canvas, clear, exportPng } = useDrawing({
    host: section,
    mask: maskRef,
    tool,
    color,
    touchDraw,
    onStart: (input, t) => { stats.current.started = Date.now(); track("drawing_start", { drawing_input: input, drawing_tool: t }); },
    onStroke: (t) => { stats.current.strokes++; if (t === "eraser") stats.current.eraser = true; touch(); },
  });

  useEffect(() => {
    const onHide = () => document.visibilityState === "hidden" && flush(true);
    document.addEventListener("visibilitychange", onHide);
    return () => { document.removeEventListener("visibilitychange", onHide); flush(true); };
  }, [flush]);

  useEffect(() => { setCoarse(window.matchMedia("(pointer:coarse)").matches); }, []);

  /* palette only while the section is in view */
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setPaletteOn(e.isIntersecting), { threshold: 0.25 });
    io.observe(section.current!);
    return () => io.disconnect();
  }, []);

  /* scribble draws on scroll */
  useEffect(() => {
    const line = penLine.current!, text = penText.current!;
    if (reduced()) return;
    const len = line.getTotalLength();
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(text, { strokeDasharray: 2600, strokeDashoffset: 2600 });
    const tl = gsap.timeline({ scrollTrigger: { trigger: section.current!, start: "top 90%", end: "top 35%", scrub: 0.5 } });
    tl.to(line, { strokeDashoffset: 0, ease: "none", duration: 1 }).to(text, { strokeDashoffset: 0, ease: "none", duration: 0.8 });
    return () => { tl.scrollTrigger?.kill(); tl.kill(); };
  }, []);

  /* ---------- tools ---------- */
  const pickColor = (hex: string) => {
    setColor(hex); setTool("pencil"); setTouchDraw(true);
    track("drawing_action", { drawing_action: "change_tool", drawing_tool: "pencil" });
  };
  const pickEraser = () => {
    setTool((t) => (t === "eraser" ? "pencil" : "eraser"));
    setTouchDraw(true);
    track("drawing_action", { drawing_action: "change_tool", drawing_tool: "eraser" });
  };
  const clearAll = () => {
    clear();
    stats.current.clears++;
    track("drawing_action", { drawing_action: "clear" });
  };

  /* ---------- fold / unfold ---------- */
  const fold = () => {
    const el = paper.current, sec = section.current;
    if (!el || !sec || folded) return;
    setFolded(true);
    if (reduced()) { gsap.set(el, { scaleX: 0.55, scaleY: 0.55, rotation: -6, transformOrigin: "top right" }); return; }
    const r = el.getBoundingClientRect(), s = sec.getBoundingClientRect();
    // paper scales from its top-right corner, so move that corner to the section's top-right area
    const x = s.right - 40 - r.right, y = Math.max(s.top, 0) + 72 - r.top;
    gsap.timeline({ onComplete: () => { sway.current = gsap.to(el, { rotation: -8.5, duration: 1.4, yoyo: true, repeat: -1, ease: "sine.inOut" }); } })
      .set(el, { transformOrigin: "top right" })
      .to(el, { scaleY: 0.55, duration: 0.28, ease: "power2.in" })
      .to(el, { scaleX: 0.55, duration: 0.24 })
      .to(el, { rotation: -6, duration: 0.18 })
      .to(el, { x, y, duration: 0.9, ease: "power3.inOut" });
  };
  const unfold = () => {
    const el = paper.current;
    if (!el || !folded) return;
    sway.current?.kill(); sway.current = null;
    if (reduced()) { gsap.set(el, { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }); setFolded(false); return; }
    gsap.timeline({ onComplete: () => setFolded(false) })
      .to(el, { x: 0, y: 0, rotation: 0, duration: 0.9, ease: "power3.inOut" })
      .to(el, { scaleX: 1, duration: 0.24 }, "-=0.5")
      .to(el, { scaleY: 1, duration: 0.45, ease: "back.out(1.6)" }, "-=0.3");
  };

  /* ---------- send ---------- */
  const flyPlane = () =>
    new Promise<void>((resolve) => {
      const el = plane.current;
      if (!el || reduced()) return resolve();
      gsap.timeline({ onComplete: () => { gsap.set(el, { display: "none" }); resolve(); } })
        .set(el, { display: "block", x: -100, y: 150, rotate: -45, scale: 0.8, opacity: 1 })
        .to(el, { x: window.innerWidth * 0.4, y: -100, rotate: 15, scale: 1.2, duration: 1.2, ease: "power2.inOut" })
        .to(el, { x: window.innerWidth + 150, y: -150, rotate: 45, scale: 0.6, opacity: 0, duration: 1, ease: "power2.in" });
    });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true); setError("");
    const withDrawing = attach;
    track("contact_form_submit", { drawing_attached: withDrawing });
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, msg, drawingDataUrl: withDrawing ? exportPng() : undefined, website: trap }),
      });
      const body = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string };
      if (!res.ok || body.success !== true) {
        track("contact_form_result", { contact_result: "error", response_status: res.status, drawing_attached: withDrawing });
        setError(body.error || "Your message could not be sent. Please try again.");
        return;
      }
      track("contact_form_result", { contact_result: "success", response_status: res.status, drawing_attached: withDrawing });
      await flyPlane();
      setSent({ drawing: withDrawing });
      window.setTimeout(() => { setSent(null); setName(""); setEmail(""); setMsg(""); }, 5000);
    } catch {
      track("contact_form_result", { contact_result: "error", response_status: 0, drawing_attached: withDrawing });
      setError("Your message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <section
      ref={section}
      id="contact"
      data-cursor={tool === "eraser" ? "eraser" : "pencil"}
      className="w-full min-h-dvh bg-[#FBF7F0] text-zinc-900 pt-24 pb-36 md:py-24 px-6 md:px-12 relative overflow-hidden flex flex-col justify-center items-center select-none"
    >
      <canvas ref={canvas} className="absolute inset-0 w-full h-full cursor-crosshair z-0" style={{ touchAction: !coarse || touchDraw ? "none" : "pan-y" }} aria-label="Drawing surface. Draw anywhere on the paper." />

      {/* hand-lettered scribble, erased by the eraser via the mask */}
      <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" className="hidden md:block absolute inset-0 w-full h-full z-10 pointer-events-none" aria-hidden="true" focusable="false" style={WOBBLE}>
        <defs>
          <mask id="eraser-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="1000">
            <rect width="1000" height="1000" fill="#fff" />
            <g id="mask-eraser-strokes" ref={maskRef} fill="#000" />
          </mask>
        </defs>
        <g mask="url(#eraser-mask)" fill="none" stroke="#1C1C1C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path ref={penLine} d="M 25 0 C 25 300, 40 700, 120 890 S 300 955 372 948" vectorEffect="non-scaling-stroke" />
          <text ref={penText} x="385" y="965" fontFamily="Caveat, cursive" fontSize="64" vectorEffect="non-scaling-stroke">draw something</text>
        </g>
      </svg>
      <div className="absolute inset-0 pointer-events-none opacity-[.12] z-[11]" style={{ backgroundImage: "radial-gradient(#000 1px,transparent 1px)", backgroundSize: "20px 20px" }} aria-hidden="true" />

      <div className="relative z-20 flex flex-col items-center w-full pointer-events-none">
        <header className="flex flex-col items-center text-center mb-8">
          <span className="text-[12px] font-mono uppercase tracking-widest text-zinc-500 font-bold border-b border-dashed border-zinc-400 pb-1 mb-2">* sketch #05 *</span>
          <h2 className="font-handwritten text-4xl md:text-5xl font-extrabold tracking-tight">say hello! ✏️</h2>
          <p className="text-xs font-mono text-zinc-500 mt-2">{coarse ? "Tap ✏️ below, then draw anywhere on the paper!" : "Click & drag anywhere to draw on the paper, then send!"}</p>
        </header>

        <div
          ref={paper}
          className={`w-full max-w-lg p-8 relative ${folded ? "pointer-events-none" : "pointer-events-auto"}`}
          style={WOBBLE}
        >
          <div className="absolute inset-0 bg-[#27272a] translate-x-1.5 translate-y-1.5" style={{ clipPath: FOLD_CLIP }} aria-hidden="true" />
          <div className="absolute inset-0 bg-[#27272a]" style={{ clipPath: FOLD_CLIP }} aria-hidden="true" />
          <div className="absolute inset-[2px] bg-[#fbfbfb]" style={{ clipPath: FOLD_CLIP }} aria-hidden="true" />
          <svg className="absolute top-0 right-0 w-9 h-9" viewBox="0 0 36 36" aria-hidden="true" focusable="false"><path d="M0 0 L0 36 L36 36Z" fill="#f0e8d6" stroke="#27272a" strokeWidth="2" strokeLinejoin="round" /></svg>
          <button type="button" onClick={fold} disabled={folded} aria-label="Fold the paper into the corner" className="absolute top-0 right-0 w-9 h-9 pointer-events-auto cursor-pointer focus-visible:outline-2 focus-visible:outline-zinc-900" />
          <span className="absolute -top-5 right-10 font-handwritten text-[12px] font-bold text-zinc-400 -rotate-2" aria-hidden="true">fold me →</span>

          <div className="absolute left-0 top-0 h-full flex flex-col justify-around py-6" aria-hidden="true">
            {Array.from({ length: 6 }, (_, i) => <span key={i} className="w-3.5 h-3.5 rounded-full bg-[#FBF7F0] border-2 border-zinc-800 -translate-x-3" />)}
          </div>

          <div className="relative">
            {sent ? (
              <div role="status" className="flex flex-col items-center text-center gap-3 py-10">
                <svg viewBox="0 0 24 24" className="w-16 h-16 text-green-500 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                <p className="font-handwritten text-2xl font-bold">Message Sent!</p>
                <p className="text-xs font-mono text-zinc-500 max-w-xs">The wobbly paper airplane flew safely into my inbox.</p>
                {sent.drawing && <p className="text-[10px] font-mono text-green-700 bg-green-50 border border-dashed border-green-600 px-2 py-1">🎨 CANVAS DRAWING ATTACHED SUCCESSFULLY!</p>}
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-5 pl-4" noValidate={false}>
                <label className="flex flex-col gap-1">
                  <span className={label}>your name:</span>
                  <input className={field} required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. creative friend" autoComplete="name" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={label}>email address:</span>
                  <input className={field} type="email" required maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. friend@imagination.com" autoComplete="email" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className={label}>write your message:</span>
                  <textarea className={`${field} resize-none`} rows={4} required maxLength={5000} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="sketch your thoughts..." />
                </label>
                {/* honeypot: hidden from people, tempting to bots */}
                <input tabIndex={-1} autoComplete="off" aria-hidden="true" value={trap} onChange={(e) => setTrap(e.target.value)} name="website" className="absolute -left-[9999px] w-px h-px opacity-0" />

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={attach} onChange={(e) => { setAttach(e.target.checked); track("drawing_action", { drawing_action: "toggle_attachment" }); }} />
                  <span className="w-5 h-5 shrink-0 border-2 border-zinc-800 rounded bg-white shadow-[1px_1px_0_#000] flex items-center justify-center peer-checked:bg-zinc-950 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-zinc-900 text-white">
                    {attach && <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M20 6 9 17l-5-5" /></svg>}
                  </span>
                  <span className="font-handwritten text-sm font-extrabold">Add my background drawing to payload! 🎨</span>
                </label>

                {error && <div role="alert" aria-live="assertive" className="rounded border-2 border-dashed border-red-500 bg-red-50 px-3 py-2 text-[11px] font-mono text-red-700">{error}</div>}

                <button
                  type="submit"
                  disabled={sending}
                  className={`group w-full py-3 bg-zinc-900 text-white font-handwritten text-xl font-bold border-2 border-zinc-900 shadow-[3px_3px_0_#27272a] hover:bg-transparent hover:text-zinc-900 hover:shadow-[5px_5px_0_#27272a] transition-all flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${sending ? "cursor-wait opacity-80" : ""}`}
                >
                  {sending ? "Sending Message..." : "Send Message"}
                  <svg viewBox="0 0 24 24" className={`w-5 h-5 ${sending ? "animate-pulse" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></svg>
                </button>
              </form>
            )}
          </div>

          {folded && (
            <button type="button" onClick={unfold} className="absolute -bottom-4 -left-2 pointer-events-auto font-handwritten text-4xl font-extrabold text-zinc-700 -rotate-3 hover:text-zinc-950 focus-visible:outline-2 focus-visible:outline-zinc-900">open me! ↘</button>
          )}
        </div>
      </div>

      <svg ref={plane} viewBox="0 0 24 24" className="absolute bottom-20 left-10 z-40 w-24 h-24 text-blue-500 pointer-events-none" style={{ display: "none" }} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
        <path d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>

      <Palette visible={paletteOn} tool={tool} color={color} onColor={pickColor} onEraser={pickEraser} onClear={clearAll} coarse={coarse} touchDraw={touchDraw} onTouchDraw={() => setTouchDraw((v) => !v)} />
    </section>
  );
}
