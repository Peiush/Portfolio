import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "../../lib/gsap";

const d = "M 25 0 C 25 45, 95 35, 118 70 C 132 95, 124 130, 127 170 C 130 230, 122 290, 127 350 C 132 420, 123 480, 127 545 C 131 610, 124 670, 127 730 C 130 800, 110 830, 80 855 C 55 875, 32 880, 28 915 C 26 935, 25 960, 25 1000";
const leaves: [number, number][] = [[127, 170], [127, 350], [127, 545], [127, 730]];

export function Vine({ host }: { host: React.RefObject<HTMLElement | null> }) {
  const svg = useRef<SVGSVGElement>(null);
  const bud = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const paths = [...svg.current!.querySelectorAll<SVGPathElement>("[data-vine]")];
    const leafEls = [...svg.current!.querySelectorAll<SVGGElement>(".grove-vine-leaf")];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const len = paths[0].getTotalLength();
    if (reduced) {
      gsap.set(paths, { strokeDasharray: len, strokeDashoffset: 0 });
      gsap.set(leafEls, { opacity: 1 });
      gsap.set(bud.current, { opacity: 1, scale: 1 });
      return;
    }
    gsap.set(paths, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(leafEls, { opacity: 0, scale: 0, transformOrigin: "center", svgOrigin: undefined });
    gsap.set(bud.current, { opacity: 0, scale: 0.4 });
    const shown = new Set<number>();
    let budShown = false;
    const st = ScrollTrigger.create({
      trigger: host.current!, start: "top 70%", end: "bottom 75%", scrub: 0.5,
      onUpdate(self) {
        gsap.set(paths, { strokeDashoffset: len * (1 - self.progress) });
        leaves.forEach(([, y], i) => {
          const on = self.progress >= y / 1000;
          if (on && !shown.has(i)) { shown.add(i); gsap.to(leafEls[i], { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" }); }
          else if (!on && shown.has(i)) { shown.delete(i); gsap.to(leafEls[i], { opacity: 0, scale: 0, duration: 0.2 }); }
        });
        const b = self.progress > 0.97;
        if (b !== budShown) { budShown = b; gsap.to(bud.current, { opacity: b ? 1 : 0, scale: b ? 1 : 0.4, duration: 0.4, ease: "back.out(2)" }); }
      },
    });
    return () => st.kill();
  }, [host]);

  return (
    <>
      <svg ref={svg} viewBox="0 0 1000 1000" preserveAspectRatio="none" className="hidden md:block absolute inset-0 w-full h-full z-[1] pointer-events-none overflow-visible" style={{ opacity: 0.95 }} aria-hidden="true" focusable="false">
        <path data-vine d={d} fill="none" stroke="#2d6a4f" strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path data-vine d={d} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity=".8" vectorEffect="non-scaling-stroke" />
        {leaves.map(([x, y]) => (
          <g key={y} className="grove-vine-leaf" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <path d={`M${x} ${y} q-22 -14 -34 -2 q14 14 34 2z`} fill="#74c69d" stroke="#1b4332" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <path d={`M${x} ${y} q22 -14 34 -2 q-14 14 -34 2z`} fill="#74c69d" stroke="#1b4332" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <circle cx={x} cy={y} r="3" fill="#f4d35e" />
          </g>
        ))}
      </svg>
      <div ref={bud} className="hidden md:flex absolute bottom-6 left-[2.5%] z-[2] items-center gap-2 pointer-events-none">
        <svg width="24" height="26" viewBox="0 0 12 13" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
          <path d="M4 2h4v1h2v1h1v3H1V4h1V3h2z" fill="#e63946" />
          <rect x="3" y="4" width="1" height="1" fill="#fff" /><rect x="7" y="3" width="1" height="1" fill="#fff" /><rect x="9" y="5" width="1" height="1" fill="#fff" />
          <rect x="4" y="8" width="4" height="4" fill="#fdfbf7" />
        </svg>
        <span className="text-[9px] font-mono text-[#2d6a4f]">← vine://sprout-contact</span>
      </div>
    </>
  );
}
