import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";

export type Tool = "pencil" | "eraser";
export const BG = "#FBF7F0";

interface Opts {
  host: RefObject<HTMLElement | null>;
  mask: RefObject<SVGGElement | null>;
  tool: Tool;
  color: string;
  /** touch input only draws when true, otherwise a finger scrolls the page */
  touchDraw: boolean;
  onStart: (input: string, tool: Tool) => void;
  onStroke: (tool: Tool) => void;
}

/** Full-section drawing surface. Returns the canvas ref plus clear / export helpers. */
export function useDrawing({ host, mask, tool, color, touchDraw, onStart, onStroke }: Opts) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ tool, color, touchDraw, onStart, onStroke });
  live.current = { tool, color, touchDraw, onStart, onStroke };

  const paper = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(28,28,28,.03)";
    for (let i = 0; i < (w * h) / 400; i++) {
      const s = 0.4 + Math.random() * 0.7;
      ctx.fillRect(Math.random() * w, Math.random() * h, s, s);
    }
  };

  const clear = useCallback(() => {
    const cv = canvas.current;
    if (!cv) return;
    paper(cv.getContext("2d")!, cv.width, cv.height);
    mask.current?.replaceChildren();
  }, [mask]);

  const exportPng = useCallback(() => {
    const cv = canvas.current;
    if (!cv) return undefined;
    const scale = Math.min(1, 1000 / cv.width);
    const out = document.createElement("canvas");
    out.width = Math.round(cv.width * scale);
    out.height = Math.round(cv.height * scale);
    out.getContext("2d")!.drawImage(cv, 0, 0, out.width, out.height);
    return out.toDataURL("image/png");
  }, []);

  useEffect(() => {
    const cv = canvas.current!, el = host.current!;
    const ctx = cv.getContext("2d")!;
    let raf = 0;

    const fit = () => {
      const w = el.offsetWidth, h = el.offsetHeight;
      if (!w || !h) return;
      const old = cv.width && cv.height ? ctx.getImageData(0, 0, cv.width, cv.height) : null;
      cv.width = w; cv.height = h;
      paper(ctx, w, h);
      if (old) ctx.putImageData(old, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(fit); });
    ro.observe(el);

    let drawing = false, lx = 0, ly = 0, mx = -99, my = -99, started = false;
    const pt = (e: PointerEvent) => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const erase = (x: number, y: number) => {
      if (Math.hypot(x - mx, y - my) < 6) return;
      mx = x; my = y;
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", String((x / cv.width) * 1000));
      c.setAttribute("cy", String((y / cv.height) * 1000));
      c.setAttribute("r", "16");
      mask.current?.appendChild(c);
    };

    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.pointerType === "touch" && !live.current.touchDraw) return;
      e.preventDefault();
      cv.setPointerCapture(e.pointerId);
      const { tool: t, color: col } = live.current;
      const { x, y } = pt(e);
      drawing = true; lx = x; ly = y;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.lineWidth = t === "eraser" ? 22 : 2.5 + Math.random() * 1.5;
      ctx.strokeStyle = t === "eraser" ? BG : col;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 0.01, y + 0.01); ctx.stroke();
      if (t === "eraser") erase(x, y);
      if (!started) { started = true; live.current.onStart(e.pointerType, t); }
      live.current.onStroke(t);
    };
    const move = (e: PointerEvent) => {
      if (!drawing) return;
      const { x, y } = pt(e);
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(x, y); ctx.stroke();
      lx = x; ly = y;
      if (live.current.tool === "eraser") erase(x, y);
    };
    const up = () => { drawing = false; };

    cv.addEventListener("pointerdown", down);
    cv.addEventListener("pointermove", move);
    cv.addEventListener("pointerup", up);
    cv.addEventListener("pointercancel", up);
    cv.addEventListener("pointerleave", up);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect();
      cv.removeEventListener("pointerdown", down);
      cv.removeEventListener("pointermove", move);
      cv.removeEventListener("pointerup", up);
      cv.removeEventListener("pointercancel", up);
      cv.removeEventListener("pointerleave", up);
    };
  }, [host, mask]);

  return { canvas, clear, exportPng };
}
