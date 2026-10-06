import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "@fontsource/almendra/400.css";
import "@fontsource/almendra/700.css";
import "@fontsource/sofia/400.css";
import { gsap, ScrollTrigger } from "../../lib/gsap";
import { os, windows, type WinId } from "../../data/skills";
import { PixelIcon } from "./Pixel";
import { Window, theme } from "./Window";
import { Terminal } from "./Terminal";
import { Fireflies } from "./Fireflies";
import { Vine } from "./Vine";
import { JukeboxWindow, useJukebox } from "./Jukebox";
import { Atlas, BackendWindow, DevopsWindow, FrontendWindow, Notepad, Portrait } from "./windows";

type WinState = { open: boolean; min: boolean; z: number };

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function SkillsOS() {
  const section = useRef<HTMLElement>(null);
  const desktop = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const zTop = useRef(10);
  const audio = useRef<HTMLAudioElement>(null);

  const [wins, setWins] = useState<Record<WinId, WinState>>(() =>
    Object.fromEntries(windows.map((w, i) => [w.id, { open: !!w.defaultOpen, min: false, z: 10 + i }])) as Record<WinId, WinState>,
  );
  const [booted, setBooted] = useState(false);
  const [menu, setMenu] = useState(false);
  const [clock, setClock] = useState("--:--");
  const [sparks, setSparks] = useState(0);
  const [reduced, setReduced] = useState(false);
  const jb = useJukebox(audio);

  const focus = useCallback((id: WinId) => {
    zTop.current += 1;
    const z = zTop.current;
    setWins((w) => ({ ...w, [id]: { ...w[id], z } }));
  }, []);

  const openWindow = useCallback((id: WinId) => {
    zTop.current += 1;
    const z = zTop.current;
    setWins((w) => ({ ...w, [id]: { open: true, min: false, z } }));
  }, []);

  const patch = (id: WinId, p: Partial<WinState>) => setWins((w) => ({ ...w, [id]: { ...w[id], ...p } }));

  const topId = useMemo(() => {
    let best: WinId | null = null, bz = -1;
    (Object.keys(wins) as WinId[]).forEach((id) => { const s = wins[id]; if (s.open && !s.min && s.z > bz) { bz = s.z; best = id; } });
    return best;
  }, [wins]);

  const toggleFromTaskbar = (id: WinId) => {
    const s = wins[id];
    if (s.min) { openWindow(id); return; }
    if (topId === id) patch(id, { min: true });
    else focus(id);
  };

  /* clock */
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    tick();
    const t = setInterval(tick, 15000);
    return () => clearInterval(t);
  }, []);

  /* mobile: everything open, stacked. boot sequence on first enter */
  useEffect(() => {
    const isReduced = reducedMotion();
    setReduced(isReduced);
    if (!window.matchMedia("(min-width:768px)").matches) {
      setWins((w) => Object.fromEntries(Object.entries(w).map(([k, v]) => [k, { ...v, open: true }])) as Record<WinId, WinState>);
    }
    const cur = curtain.current!;
    const finish = () => { cur.style.display = "none"; setBooted(true); };
    if (isReduced) { finish(); return; }

    const st = ScrollTrigger.create({
      trigger: desktop.current!, start: "top 65%", once: true,
      onEnter() {
        gsap.timeline({ onComplete: finish })
          .to(cur, { scaleY: 0.004, duration: 0.35, ease: "power4.inOut" })
          .to(cur, { scaleX: 0, opacity: 0, duration: 0.3, ease: "power2.in" })
          .fromTo(desktop.current!.querySelectorAll(".edos-window-boot"), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.24, stagger: 0.14, ease: "back.out(1.6)", clearProps: "opacity" }, "-=0.2");
      },
    });
    return () => st.kill();
  }, []);

  const content = (id: WinId) => {
    switch (id) {
      case "frontend": return <FrontendWindow />;
      case "backend": return <BackendWindow />;
      case "devops": return <DevopsWindow />;
      case "toolbox": return <Atlas />;
      case "manifesto": return <Notepad />;
      case "me": return <Portrait />;
      case "jukebox": return <JukeboxWindow jb={jb} reduced={reduced} />;
      case "terminal": return <Terminal booted={booted} reduced={reduced} openWindow={openWindow} closeSelf={() => patch("terminal", { open: false })} summon={() => setSparks((n) => n + 1)} />;
    }
  };

  const openList = windows.filter((w) => wins[w.id].open);
  const tbBtn = `px-2.5 py-2 md:px-1.5 md:py-0.5 text-[11px] font-mono bg-[#dda15e] text-[#3d2514] ${theme.raised} active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white`;

  return (
    <section ref={section} id="skills" data-cursor="retro" className="w-full relative overflow-hidden select-none" style={{ background: "#d2e8d7" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-conic-gradient(#b2d3bc 0% 25%, transparent 0% 50%) 0 0 / 4px 4px", opacity: 0.14 }} />
      <Fireflies counter={sparks} host={section} />
      <Vine host={section} />

      {/* watermark */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-[2]" aria-hidden="true">
        <svg viewBox="0 0 100 100" className="absolute w-[450px] h-[450px] text-[#2d6a4f] opacity-[.11] scale-90 md:scale-110" fill="none" stroke="currentColor" strokeWidth="1">
          <circle cx="50" cy="50" r="46" /><circle cx="50" cy="50" r="38" strokeDasharray="2 3" />
          <path d="M50 4 L58 42 L96 50 L58 58 L50 96 L42 58 L4 50 L42 42z" />
          <circle cx="50" cy="50" r="6" />
        </svg>
        <p className="magic-subtitle relative text-[13px] md:text-sm tracking-widest text-[#2d6a4f]/70 uppercase mb-3">{os.subtitle}</p>
        <p className="magic-title relative text-4xl md:text-7xl font-black uppercase text-[#2d6a4f]/25 tracking-wider text-center leading-none [text-shadow:1.5px_1.5px_0_rgba(255,255,255,.7)]">{os.title}</p>
        <p className="relative hidden md:block text-[11px] font-mono text-[#2d6a4f]/40 mt-4">nurture the sprouts · unroll the spells · click the clover</p>
      </div>

      {/* mushrooms */}
      <svg className="hidden md:block absolute right-6 bottom-12 w-[240px] h-[260px] pointer-events-none z-[2]" viewBox="0 0 240 260" fill="none" stroke="#66513A" strokeWidth="1.2" aria-hidden="true" focusable="false">
        <path d="M120 250 C116 200 124 180 120 160 M60 250 C58 220 64 205 60 190 M190 250 C192 225 186 212 190 200" strokeLinecap="round" />
        <path d="M70 160 C70 110 170 110 170 160 C150 172 90 172 70 160z" fill="#e6394622" />
        <path d="M30 192 C30 160 92 160 92 192 C80 200 42 200 30 192z" fill="#e6394622" />
        <path d="M160 204 C160 180 222 180 222 204 C210 212 172 212 160 204z" fill="#e6394622" />
        {[[100, 140], [130, 132], [150, 148], [60, 180], [200, 194]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="3" />)}
      </svg>

      {/* the desktop */}
      <div ref={desktop} className="relative w-full md:h-[120dvh] z-10">
        <div className="relative z-[6] flex md:flex-col flex-row flex-wrap gap-1 md:gap-2 p-3 md:p-4 md:w-28">
          {windows.map((w) => (
            <button key={w.id} type="button" data-cursor="retro-hand" onClick={() => openWindow(w.id)} className="w-[22%] md:w-20 min-h-11 py-2 flex flex-col items-center gap-1 active:translate-y-px focus-visible:outline-2 focus-visible:outline-[#2d6a4f] rounded">
              <PixelIcon id={w.icon} />
              <span className="text-[10px] font-mono leading-tight text-center text-[#3d2514] [text-shadow:1px_1px_0_#fff]">{w.label}</span>
            </button>
          ))}
        </div>

        {windows.map((w) => (
          <Window
            key={w.id}
            id={w.id}
            title={w.title}
            icon={w.icon}
            left={w.left}
            top={w.top}
            width={w.width}
            cursor={w.cursor}
            z={wins[w.id].z}
            visible={wins[w.id].open && !wins[w.id].min}
            desktopRef={desktop}
            onFocus={() => focus(w.id)}
            onMinimize={() => patch(w.id, { min: true })}
            onClose={() => patch(w.id, { open: false, min: false })}
          >
            {content(w.id)}
          </Window>
        ))}

        <button
          type="button"
          onClick={() => setSparks((n) => n + 1)}
          aria-label="Clover: release more fireflies"
          data-cursor="retro-hand"
          className="hidden md:block absolute left-[34%] bottom-[14%] text-xl opacity-70 hover:opacity-100 hover:scale-110 transition z-[3] focus-visible:outline-2 focus-visible:outline-[#2d6a4f] rounded"
        >🍀</button>

        {/* taskbar */}
        <div className="sticky md:absolute bottom-0 left-0 w-full z-[220] mt-2 md:mt-0 bg-[#2d6a4f] border-t-2 border-t-[#dda15e] px-1.5 py-1 flex items-center gap-1.5 shadow-[0_-2px_10px_rgba(0,0,0,.15)]">
          {menu && <div className="fixed inset-0 z-[-1]" onClick={() => setMenu(false)} aria-hidden="true" />}
          <div className="relative">
            <button type="button" data-cursor="retro-hand" onClick={() => setMenu((m) => !m)} aria-expanded={menu} className={`flex items-center gap-1 font-bold ${tbBtn}`}>
              <PixelIcon id="mushroom" size={16} />Sprout
            </button>
            {menu && (
              <div className="absolute bottom-full mb-1 left-0 w-52 bg-[#c0c0c0] flex shadow-[3px_3px_0_rgba(0,0,0,.35)] border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#404040] border-b-[#404040]" role="menu">
                <div className="w-7 bg-gradient-to-t from-[#000080] to-[#1084d0] flex items-end justify-center pb-2">
                  <span className="text-white font-bold text-xs tracking-wider [writing-mode:vertical-rl] rotate-180">{os.shortName}</span>
                </div>
                <div className="flex-1 py-1">
                  {[
                    { label: "Run all programs", run: () => windows.forEach((w) => openWindow(w.id)) },
                    { label: "manifesto.txt", run: () => openWindow("manifesto") },
                    { label: "Shut down → say hello", run: () => document.getElementById("contact")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" }) },
                  ].map((it) => (
                    <button key={it.label} type="button" role="menuitem" onClick={() => { it.run(); setMenu(false); }} className="block w-full text-left px-3 py-1.5 text-[11px] font-mono text-black hover:bg-[#000080] hover:text-white">{it.label}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="w-0.5 self-stretch bg-[#1b4332] border-r border-[#dda15e]" />
          <div className="flex-1 flex gap-1 overflow-x-auto min-w-0">
            {openList.map((w) => {
              const active = topId === w.id;
              return (
                <button key={w.id} type="button" data-cursor="retro-hand" onClick={() => toggleFromTaskbar(w.id)} className={`flex items-center gap-1 max-w-[140px] shrink-0 text-[11px] font-mono text-[#3d2514] px-2.5 py-2 md:px-1.5 md:py-0.5 ${active ? `bg-[#f4e3b1] ${theme.sunken}` : `bg-[#dda15e] ${theme.raised}`}`}>
                  <PixelIcon id={w.icon} size={14} /><span className="truncate">{w.title.split(" — ")[0]}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1">
            <button type="button" data-cursor="retro-hand" onClick={jb.prev} aria-label="Previous track" className={tbBtn}>◄◄</button>
            <button type="button" data-cursor="retro-hand" onClick={jb.toggle} aria-label={jb.playing ? "Pause" : "Play"} className={tbBtn}>{jb.playing ? "❚❚" : "►"}</button>
            <button type="button" data-cursor="retro-hand" onClick={jb.next} aria-label="Next track" className={tbBtn}>►►</button>
            <span className="hidden sm:block bg-[#1b4332] text-[#fefae0] text-[10px] font-mono max-w-[110px] truncate px-1.5 py-1"><button type="button" onClick={() => openWindow("jukebox")} className="truncate max-w-full text-left" aria-label="Open jukebox">{jb.current?.title ?? "no tracks yet"}</button></span>
            <span className="bg-[#1b4332] text-[#fefae0] text-[11px] font-mono px-1.5 py-1">{clock}</span>
          </div>
        </div>
      </div>

      {/* CRT overlays */}
      <div className="hidden md:block absolute inset-0 pointer-events-none z-[210]" style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,.6) 0 1px, transparent 1px 3px)", opacity: 0.05 }} aria-hidden="true" />
      <div className="hidden md:block absolute inset-0 pointer-events-none z-[210]" style={{ background: "radial-gradient(ellipse at center, transparent 62%, rgba(0,0,0,.1) 100%)" }} aria-hidden="true" />
      <div ref={curtain} className="absolute inset-0 bg-black z-[200]" aria-hidden="true" />
      <audio ref={audio} preload="none" onEnded={jb.next} />
    </section>
  );
}
