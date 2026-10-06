import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { BallSvg, CatSvg, DogSvg, palettes } from "./cats/art";
import { ensureAudio, sfx } from "./cats/audio";
import { track } from "../../lib/track";

const CAT_W = 90, CAT_H = 80, BALL = 40, FLOOR = 20, MAX_CATS = 8;

type Sim = {
  id: number; pal: number; x: number; y: number; vy: number; facing: 1 | -1;
  cool: number; petting: number; bubble: string; bubbleT: number;
  el: HTMLDivElement | null; bubbleEl: HTMLDivElement | null; pupils: SVGElement[];
};
type Popup = { id: number; text: string; x: number; y: number };

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const rand = (a: number, b: number) => a + Math.random() * (b - a);

export default function CatPlayground() {
  const box = useRef<HTMLDivElement>(null);
  const ballEl = useRef<HTMLDivElement>(null);
  const dogEl = useRef<HTMLDivElement>(null);
  const cats = useRef<Sim[]>([]);
  const nextId = useRef(1);
  const ball = useRef({ x: 300, y: 60, vx: 6, vy: 0, rot: 0, drag: false, lastX: 0, lastY: 0, dvx: 0, dvy: 0 });
  const dog = useRef({ on: false, x: 0 });
  const size = useRef({ w: 1000, h: 380 });
  const inView = useRef(false);
  const hatsRef = useRef(false);
  const [, rerender] = useReducer((n: number) => n + 1, 0);
  const [hats, setHats] = useState(false);
  const [dogOn, setDogOn] = useState(false);
  const [popups, setPopups] = useState<Popup[]>([]);
  const popupId = useRef(0);

  /* ---------- analytics (aggregated, flushed after inactivity) ---------- */
  const stats = useRef({ started: 0, actions: 0, pets: 0, throws: 0, max: 1, timer: 0 });
  const flush = useCallback((end = false) => {
    const s = stats.current;
    if (!s.started) return;
    track("cat_play_summary", {
      cat_duration_seconds: Math.round((Date.now() - s.started) / 1000),
      cat_action_count: s.actions, cat_pet_count: s.pets, cat_ball_throw_count: s.throws, cat_max_count: s.max, session_end: end,
    });
    stats.current = { started: 0, actions: 0, pets: 0, throws: 0, max: cats.current.length, timer: 0 };
  }, []);
  const action = useCallback((kind: string) => {
    const s = stats.current;
    if (!s.started) { s.started = Date.now(); track("cat_play_start", { cat_action: kind, cat_count: cats.current.length }); }
    s.actions++;
    s.max = Math.max(s.max, cats.current.length);
    window.clearTimeout(s.timer);
    s.timer = window.setTimeout(() => flush(false), 15000);
  }, [flush]);

  const popup = useCallback((text: string, x: number, y: number) => {
    const id = ++popupId.current;
    setPopups((p) => [...p.slice(-12), { id, text, x, y }]);
    window.setTimeout(() => setPopups((p) => p.filter((q) => q.id !== id)), 950);
  }, []);

  const say = (c: Sim, text: string, frames = 50) => { c.bubble = text; c.bubbleT = frames; };

  /* ---------- controls ---------- */
  const addCat = useCallback((initial = false) => {
    if (cats.current.length >= MAX_CATS) return;
    const { w } = size.current;
    const id = nextId.current++;
    cats.current.push({
      id, pal: (id - 1) % palettes.length, x: rand(120, Math.max(200, w - 200)), y: initial ? size.current.h - FLOOR - CAT_H : -120,
      vy: 0, facing: 1, cool: 0, petting: 0, bubble: "", bubbleT: 0, el: null, bubbleEl: null, pupils: [],
    });
    rerender();
    if (!initial) { sfx.spawn(); popup("🌟 Splash!", cats.current[cats.current.length - 1].x, 60); action("add_cat"); }
  }, [action, popup]);

  const removeCat = () => {
    if (cats.current.length <= 1) return;
    const c = cats.current.pop()!;
    popup("💨 Poof!", c.x, c.y);
    sfx.boop();
    rerender();
    action("remove_cat");
  };

  const toggleHats = () => {
    const v = !hatsRef.current;
    hatsRef.current = v;
    setHats(v);
    if (v) sfx.magic();
    action("toggle_hats");
  };

  const releaseDog = () => {
    if (dog.current.on) return;
    if (reduced()) {
      cats.current = [];
      rerender();
      addCat(true);
      return;
    }
    dog.current = { on: true, x: size.current.w + 40 };
    setDogOn(true);
    sfx.bark();
    action("release_dog");
  };

  const pet = (c: Sim) => {
    c.petting = 110;
    say(c, "Meow~ ❤️", 110);
    sfx.meow();
    popup("❤️", c.x + 30, c.y - 10);
    popup("Purr~", c.x + 50, c.y - 26);
    stats.current.pets++;
    action("pet_cat");
  };

  /* ---------- ball dragging ---------- */
  const localPoint = (e: React.PointerEvent | PointerEvent) => {
    const r = box.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onBallDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const b = ball.current, p = localPoint(e);
    b.drag = true; b.lastX = p.x; b.lastY = p.y; b.dvx = 0; b.dvy = 0; b.vx = 0; b.vy = 0;
  };
  const onBallMove = (e: React.PointerEvent) => {
    const b = ball.current;
    if (!b.drag) return;
    const p = localPoint(e);
    b.dvx = p.x - b.lastX; b.dvy = p.y - b.lastY;
    b.lastX = p.x; b.lastY = p.y;
    b.x = Math.min(Math.max(p.x - BALL / 2, 0), size.current.w - BALL);
    b.y = Math.min(Math.max(p.y - BALL / 2, 0), size.current.h - FLOOR - BALL);
  };
  const onBallUp = () => {
    const b = ball.current;
    if (!b.drag) return;
    b.drag = false;
    const c = (v: number) => Math.max(-22, Math.min(22, v));
    b.vx = c(b.dvx); b.vy = c(b.dvy);
    stats.current.throws++;
    action("throw_ball");
  };

  /* ---------- simulation ---------- */
  useEffect(() => {
    const el = box.current!;
    addCat(true);
    const measure = () => { size.current = { w: el.clientWidth, h: el.clientHeight }; };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const io = new IntersectionObserver(([e]) => { inView.current = e.isIntersecting; }, { threshold: 0.02, rootMargin: "300px" });
    io.observe(el);

    let raf = 0, last = performance.now();
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min((t - last) / 16.667, 3);
      last = t;
      if (!inView.current) return;
      const { w, h } = size.current;
      const ground = h - FLOOR - CAT_H;
      const floorY = h - FLOOR - BALL;
      const b = ball.current;

      if (!b.drag) {
        b.vy += 0.42 * dt;
        b.vx *= Math.pow(0.985, dt);
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.y > floorY) {
          b.y = floorY;
          if (Math.abs(b.vy) > 1.2) sfx.bounce();
          b.vy = Math.abs(b.vy) < 1 ? 0 : -b.vy * 0.62;
          b.vx *= 0.99;
        }
        if (b.y < 0) { b.y = 0; b.vy = -b.vy * 0.7; }
        if (b.x < 0) { b.x = 0; b.vx = -b.vx * 0.7; }
        if (b.x > w - BALL) { b.x = w - BALL; b.vx = -b.vx * 0.7; }
        b.rot += (b.vx / (BALL / 2)) * (180 / Math.PI) * dt;
      }
      if (ballEl.current) ballEl.current.style.transform = `translate(${b.x}px,${b.y}px) rotate(${b.rot}deg)`;

      const bx = b.x + BALL / 2, by = b.y + BALL / 2;
      const ballMoving = Math.abs(b.vx) > 0.8 || Math.abs(b.vy) > 0.8 || b.y < floorY - 2;

      for (const c of cats.current) {
        const cx = c.x + CAT_W / 2, cy = c.y + CAT_H / 2;
        const dx = bx - cx;
        const onGround = c.y >= ground - 0.5;
        if (c.petting > 0) c.petting -= dt;
        else {
          c.facing = dx >= 0 ? 1 : -1;
          const speed = ballMoving ? (onGround ? 5.5 : 2.75) : Math.abs(dx) > 160 ? 2 : 0;
          if (Math.abs(dx) > 20) c.x += Math.sign(dx) * Math.min(speed * dt, Math.abs(dx));
          if (onGround && by < cy - 50 && Math.abs(dx) < 130 && Math.random() < 0.08) c.vy = -11;
          const dist = Math.hypot(dx, by - cy);
          if (dist < 65 && c.cool <= 0 && !b.drag) {
            b.vy = -rand(6, 13);
            b.vx = c.facing * rand(8, 15);
            c.cool = 25;
            sfx.boop();
            say(c, "*SWIP!* 🐾", 40);
            popup("⭐", bx, by - 20);
          }
        }
        c.cool -= dt;
        c.vy += 0.45 * dt;
        c.y += c.vy * dt;
        if (c.y >= ground) { c.y = ground; c.vy = 0; }
        c.x = Math.min(Math.max(c.x, 0), w - CAT_W);
      }
      // push overlapping cats apart
      const list = cats.current;
      for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
        const gap = list[j].x - list[i].x;
        if (Math.abs(gap) < 75) {
          const push = (75 - Math.abs(gap)) / 2 * (gap >= 0 ? 1 : -1);
          list[i].x -= push; list[j].x += push;
        }
      }

      // dog
      const d = dog.current;
      if (d.on) {
        d.x -= 8.5 * dt;
        for (let i = list.length - 1; i >= 0; i--) {
          if (Math.abs(list[i].x + CAT_W / 2 - (d.x + 80)) < 70 && list.length > 0) {
            const c = list[i];
            popup(["💥 Crunch!", "🍗", "🍖", "🐾 Gulp!"][Math.floor(Math.random() * 4)], c.x, c.y - 10);
            sfx.meow();
            list.splice(i, 1);
            rerender();
          }
        }
        if (dogEl.current) dogEl.current.style.transform = `translate(${d.x}px,${h - FLOOR - 140}px)`;
        if (d.x < -180) {
          d.on = false;
          setDogOn(false);
          if (list.length === 0) addCat();
        }
      }

      // paint cats
      for (const c of list) {
        if (!c.el) continue;
        c.el.style.transform = `translate(${c.x}px,${c.y}px)`;
        const inner = c.el.firstElementChild as HTMLElement | null;
        if (inner) inner.style.transform = `scaleX(${c.facing})`;
        if (c.bubbleEl) {
          if (c.bubbleT > 0) { c.bubbleT -= dt; c.bubbleEl.textContent = c.bubble; c.bubbleEl.style.opacity = "1"; }
          else c.bubbleEl.style.opacity = "0";
        }
        const look = Math.max(-2, Math.min(2, (bx - (c.x + CAT_W / 2)) / 80));
        c.pupils.forEach((p) => p.setAttribute("transform", `translate(${look * c.facing} ${(by - (c.y + 34)) > 0 ? 1 : -1})`));
      }
    };
    raf = requestAnimationFrame(loop);

    const onHide = () => document.visibilityState === "hidden" && flush(true);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      flush(true);
    };
  }, [addCat, flush, popup]);

  const btn = "w-full h-9 border-2 border-black shadow-[1.5px_1.5px_0_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none font-mono font-black text-lg flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black";
  const clip = "polygon(0 0,100% 0,100% 96%,92% 98%,84% 95%,74% 98%,64% 95%,54% 98%,44% 95%,34% 98%,24% 95%,12% 98%,0 95%)";

  return (
    <div
      ref={box}
      className="absolute bottom-0 inset-x-0 h-[380px] z-30 pointer-events-none overflow-hidden"
      onPointerDownCapture={ensureAudio}
    >
      <div className="absolute bottom-0 inset-x-0 h-5 border-t-4 border-black" style={{ background: "repeating-linear-gradient(45deg,#fde047 0 6px,black 6px 12px)" }} />

      {/* control panel */}
      <div className="absolute top-10 left-2 w-[84px] sm:w-[94px] h-[280px] pointer-events-auto z-40" style={{ filter: "drop-shadow(4px 4px 0 #000)" }}>
        <div className="absolute inset-0 bg-black" style={{ clipPath: clip }} />
        <div className="absolute inset-[3px] flex flex-col gap-2 p-2 pt-3" style={{ clipPath: clip, background: "#fefcf7 repeating-linear-gradient(transparent 0 21px,rgba(0,0,0,.05) 21px 22px)" }}>
          <button type="button" onClick={toggleHats} aria-pressed={hats} aria-label="Toggle wizard hats" title="Wizard hats" className={`${btn} gap-1 text-sm ${hats ? "bg-purple-300" : "bg-white"}`}>
            <span aria-hidden="true">{hats ? "🧙" : "🐱"}</span>{cats.current.length}
          </button>
          <button type="button" onClick={() => addCat()} disabled={cats.current.length >= MAX_CATS} aria-label="Add a cat" className={`${btn} bg-[#38bdf8]`}>+</button>
          <button type="button" onClick={removeCat} disabled={cats.current.length <= 1} aria-label="Remove a cat" className={`${btn} bg-[#ff4757]`}>−</button>
          <button type="button" onClick={releaseDog} disabled={dogOn} aria-label="Release the giant dog" title="Release dog" className={`${btn} bg-[#f59e0b]`}><span aria-hidden="true">🐕</span></button>
        </div>
      </div>

      {/* ball */}
      <div
        ref={ballEl}
        role="button"
        tabIndex={0}
        aria-label="Red ball. Drag and throw it, or press Enter to kick it."
        onPointerDown={onBallDown}
        onPointerMove={onBallMove}
        onPointerUp={onBallUp}
        onPointerCancel={onBallUp}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ball.current.vy = -14; ball.current.vx = rand(-8, 8); action("kick_ball"); } }}
        className="absolute top-0 left-0 w-10 h-10 pointer-events-auto cursor-grab active:cursor-grabbing touch-none z-20 shadow-[3px_3px_0_#000] rounded-full"
      >
        <BallSvg />
      </div>

      {/* cats */}
      {cats.current.map((c) => (
        <div
          key={c.id}
          ref={(el) => { c.el = el; if (el) { c.bubbleEl = el.querySelector("[data-bubble]"); c.pupils = [...el.querySelectorAll<SVGElement>("[data-pupil]")]; } }}
          role="button"
          tabIndex={0}
          aria-label={`Pet ${palettes[c.pal].name}`}
          onClick={() => pet(c)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pet(c); } }}
          className="absolute top-0 left-0 w-[90px] h-[80px] pointer-events-auto cursor-pointer z-10 focus-visible:outline-2 focus-visible:outline-black rounded"
          style={{ transform: `translate(${c.x}px,${c.y}px)` }}
        >
          <div className={c.petting > 0 ? "cat-purring" : ""} style={{ transformOrigin: "center" }}>
            <CatSvg p={palettes[c.pal]} hat={hats} />
          </div>
          <div data-bubble className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white border-2 border-black px-1.5 py-0.5 text-[10px] font-mono font-bold opacity-0 transition-opacity pointer-events-none" />
        </div>
      ))}

      {/* dog */}
      <div ref={dogEl} className="absolute top-0 left-0 z-20 pointer-events-none" style={{ display: dogOn ? "block" : "none", transform: "translate(-400px,0)" }}>
        <DogSvg />
      </div>

      {popups.map((p) => (
        <span key={p.id} className="cat-popup absolute z-40 text-sm font-black font-mono text-black drop-shadow-[1px_1px_0_#fff] pointer-events-none" style={{ left: p.x, top: p.y }}>{p.text}</span>
      ))}
    </div>
  );
}
