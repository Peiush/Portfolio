const poly = (pts: Array<[number, number]>) =>
  `polygon(0 0, 100% 0, ${pts.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;

/** teeth alternating between two y values, from right to left */
const teeth = (start: number, step: number, a: number, b: number): Array<[number, number]> => {
  const out: Array<[number, number]> = [];
  for (let x = 100, i = 0; x >= 0; x -= step, i++) out.push([Math.max(x, 0), i % 2 ? b : a]);
  if (out[out.length - 1][0] !== 0) out.push([0, a]);
  return out;
};

export const edges = {
  sawtooth: poly([[100, 97], ...teeth(100, 1.8, 96, 97).slice(1)]),
  rough: "polygon(0 0, 100% 0, 100% 88%, 95% 89%, 92% 91%, 88% 90%, 82% 95%, 60% 96%, 56% 94%, 52% 96%, 40% 95%, 20% 97%, 0% 95%)",
  zigzag: poly(teeth(100, 3.7, 95, 96)),
  wavy: poly(teeth(100, 2, 96, 94).map(([x, y], i): [number, number] => [x, i % 4 === 3 ? 97 : y])),
  deep: "polygon(0 0, 100% 0, 100% 94%, 96% 97%, 92% 93%, 85% 96%, 78% 92%, 70% 96%, 63% 93%, 55% 97%, 48% 92%, 40% 95%, 32% 91%, 25% 96%, 15% 93%, 8% 96%, 0% 92%)",
} as const;

export const patterns = {
  dots: "background-image:radial-gradient(rgba(0,0,0,.08) 1px,transparent 1px);background-size:16px 16px",
  pinkGrid: "background-image:linear-gradient(to right,rgba(255,100,150,.05) 1px,transparent 1px),linear-gradient(rgba(255,100,150,.05) 1px,transparent 1px);background-size:14px 14px",
  ruled: "background-image:linear-gradient(rgba(0,0,0,.04) 1px,transparent 1px);background-size:100% 22px",
  grid16: "background-image:linear-gradient(to right,rgba(0,0,0,.03) 1px,transparent 1px),linear-gradient(rgba(0,0,0,.03) 1px,transparent 1px);background-size:16px 16px",
  grid20: "background-image:linear-gradient(to right,rgba(0,0,0,.02) 1px,transparent 1px),linear-gradient(rgba(0,0,0,.02) 1px,transparent 1px);background-size:20px 20px",
} as const;

export const icons = {
  award: '<path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"/><circle cx="12" cy="8" r="6"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/>',
  star: '<path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"/>',
} as const;

export const noiseUri =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export const rotations = [-6, -3, 6, -6, 3];
