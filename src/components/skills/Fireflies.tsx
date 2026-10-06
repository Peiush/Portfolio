import { useEffect, useRef } from "react";

const colors: [string, string][] = [
  ["#ffd166", "rgba(255,209,102,.25)"], ["#fff3b0", "rgba(255,243,176,.25)"],
  ["#f4d35e", "rgba(244,211,94,.25)"], ["#ffb703", "rgba(255,183,3,.25)"],
];

type P = { x: number; y: number; vx: number; vy: number; s: number; c: [string, string]; follow: boolean; i: number };

export function Fireflies({ counter, host }: { counter: number; host: React.RefObject<HTMLElement | null> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const particles = useRef<P[]>([]);
  const mouse = useRef({ x: -1, y: -1, in: false });
  const last = useRef(counter);
  const size = useRef({ w: 0, h: 0 });

  const make = (follow: boolean, i: number, x?: number, y?: number): P => {
    const a = Math.random() * Math.PI * 2, sp = 0.15 + Math.random() * 0.35;
    return {
      x: x ?? Math.random() * size.current.w, y: y ?? Math.random() * size.current.h,
      vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, s: 2 + Math.floor(Math.random() * 3),
      c: colors[Math.floor(Math.random() * colors.length)], follow, i,
    };
  };

  useEffect(() => {
    if (counter > last.current) {
      for (let k = 0; k < 4 * (counter - last.current); k++) particles.current.push(make(false, 0, mouse.current.x > 0 ? mouse.current.x : undefined, mouse.current.y > 0 ? mouse.current.y : undefined));
    }
    last.current = counter;
  }, [counter]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cv = canvas.current!, hostEl = host.current!, ctx = cv.getContext("2d")!;
    const fit = () => {
      size.current = { w: hostEl.offsetWidth, h: hostEl.offsetHeight };
      cv.width = size.current.w; cv.height = size.current.h;
    };
    fit();
    particles.current = [...Array.from({ length: 15 }, () => make(false, 0)), ...Array.from({ length: 8 }, (_, i) => make(true, i))];
    const ro = new ResizeObserver(fit);
    ro.observe(hostEl);
    const move = (e: PointerEvent) => {
      const r = hostEl.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top, in: inside };
    };
    window.addEventListener("pointermove", move);

    let visible = false, raf = 0, t = 0;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { rootMargin: "500px" });
    io.observe(hostEl);

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      t++;
      const { w, h } = size.current;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles.current) {
        if (p.follow) {
          const m = mouse.current;
          const tx = m.in ? m.x + Math.cos(t * 0.04 + p.i * 0.8) * 20 : w / 2 + Math.cos(t * 0.01 + p.i) * w * 0.25;
          const ty = m.in ? m.y + Math.sin(t * 0.04 + p.i * 0.8) * 20 : h / 2 + Math.sin(t * 0.01 + p.i) * h * 0.25;
          p.x += (tx - p.x) * 0.06; p.y += (ty - p.y) * 0.06;
        } else {
          p.x += p.vx; p.y += p.vy;
          if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
        }
        ctx.fillStyle = p.c[1];
        ctx.fillRect(p.x - p.s * 1.5, p.y - p.s * 1.5, p.s * 3, p.s * 3);
        ctx.fillStyle = p.c[0];
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.s, p.s);
      }
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); window.removeEventListener("pointermove", move); };
  }, [host]);

  return <canvas ref={canvas} className="absolute inset-0 w-full h-full pointer-events-none z-[5] hidden md:block" aria-hidden="true" />;
}
