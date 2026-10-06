export type Palette = {
  name: string;
  body: string;
  chest: string;
  stripe: string;
  ear: string;
  eye: string;
  pattern: "tabby" | "tuxedo" | "calico" | "siamese";
};

export const palettes: Palette[] = [
  { name: "Whiskers", body: "#9ca3af", chest: "#e5e7eb", stripe: "#4b5563", ear: "#f9a8d4", eye: "#16a34a", pattern: "tabby" },
  { name: "Ginger", body: "#f59e0b", chest: "#fde68a", stripe: "#b45309", ear: "#fda4af", eye: "#0ea5e9", pattern: "tabby" },
  { name: "Shadow", body: "#27272a", chest: "#fafafa", stripe: "#000", ear: "#f9a8d4", eye: "#facc15", pattern: "tuxedo" },
  { name: "Calico", body: "#fafafa", chest: "#fafafa", stripe: "#f97316", ear: "#f9a8d4", eye: "#84cc16", pattern: "calico" },
  { name: "Mochi", body: "#f5e6d3", chest: "#fff7ed", stripe: "#57534e", ear: "#57534e", eye: "#3b82f6", pattern: "siamese" },
];

const O = "#000";

export function CatSvg({ p, hat }: { p: Palette; hat: boolean }) {
  return (
    <svg viewBox="0 0 90 80" width="90" height="80" aria-hidden="true" focusable="false" className="overflow-visible">
      <path d="M20 54 C2 52 2 28 12 24" fill="none" stroke={O} strokeWidth="9" strokeLinecap="round" />
      <path d="M20 54 C2 52 2 28 12 24" fill="none" stroke={p.pattern === "siamese" ? p.stripe : p.body} strokeWidth="5" strokeLinecap="round" />
      <rect x="26" y="62" width="9" height="15" rx="4" fill={p.body} stroke={O} strokeWidth="2.5" />
      <rect x="56" y="62" width="9" height="15" rx="4" fill={p.body} stroke={O} strokeWidth="2.5" />
      <ellipse cx="45" cy="52" rx="29" ry="20" fill={p.body} stroke={O} strokeWidth="3" />
      <ellipse cx="55" cy="56" rx="13" ry="12" fill={p.chest} opacity={p.pattern === "tuxedo" ? 1 : 0.7} />
      {p.pattern === "tabby" && <path d="M28 36l4 8M38 33l3 9M48 33l-1 9" stroke={p.stripe} strokeWidth="3" strokeLinecap="round" fill="none" />}
      {p.pattern === "calico" && (<><circle cx="34" cy="44" r="8" fill={p.stripe} /><circle cx="48" cy="38" r="6" fill="#27272a" /></>)}
      <g className="cat-ear"><path d="M45 24 L47 6 L58 18z" fill={p.body} stroke={O} strokeWidth="3" strokeLinejoin="round" /><path d="M49 19 L50 11 L55 17z" fill={p.ear} /></g>
      <g className="cat-ear"><path d="M72 24 L74 6 L84 20z" fill={p.body} stroke={O} strokeWidth="3" strokeLinejoin="round" /><path d="M75 19 L76 11 L81 18z" fill={p.ear} /></g>
      <circle cx="64" cy="34" r="19" fill={p.body} stroke={O} strokeWidth="3" />
      {p.pattern === "tuxedo" && <path d="M64 24 C54 34 54 48 64 52 C74 48 74 34 64 24z" fill={p.chest} />}
      {p.pattern === "siamese" && <ellipse cx="68" cy="38" rx="10" ry="10" fill={p.stripe} opacity=".55" />}
      {p.pattern === "tabby" && <path d="M60 17v6M64 16v6M68 17v6" stroke={p.stripe} strokeWidth="2.5" strokeLinecap="round" />}
      {[57, 72].map((cx) => (
        <g key={cx}>
          <ellipse className="cat-eye" cx={cx} cy="33" rx="5" ry="5.5" fill="#fff" stroke={O} strokeWidth="1.5" />
          <circle data-pupil cx={cx} cy="33" r="3" fill={p.eye === "#facc15" ? "#000" : O} />
        </g>
      ))}
      <path d="M62 41 l3 3 l3 -3z" fill="#f472b6" stroke={O} strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M65 44 q-4 4 -8 1 M65 44 q4 4 8 1" fill="none" stroke={O} strokeWidth="1.5" strokeLinecap="round" />
      {hat && (
        <g>
          <path d="M50 20 L66 -14 L82 20z" fill="#7c3aed" stroke={O} strokeWidth="3" strokeLinejoin="round" />
          <ellipse cx="66" cy="20" rx="21" ry="5" fill="#6d28d9" stroke={O} strokeWidth="3" />
          <circle cx="66" cy="2" r="2.6" fill="#fde047" />
        </g>
      )}
    </svg>
  );
}

export function DogSvg() {
  return (
    <svg viewBox="0 0 160 140" width="160" height="140" aria-hidden="true" focusable="false" className="overflow-visible">
      <path d="M140 52 C158 40 158 22 148 16" fill="none" stroke={O} strokeWidth="11" strokeLinecap="round" />
      <path d="M140 52 C158 40 158 22 148 16" fill="none" stroke="#b45309" strokeWidth="6" strokeLinecap="round" />
      {[46, 62, 100, 116].map((x) => <rect key={x} x={x} y="92" width="13" height="40" rx="6" fill="#b45309" stroke={O} strokeWidth="3.5" />)}
      <ellipse cx="86" cy="76" rx="56" ry="34" fill="#d97706" stroke={O} strokeWidth="4" />
      <ellipse cx="80" cy="90" rx="34" ry="18" fill="#fde68a" />
      <circle cx="34" cy="56" r="28" fill="#d97706" stroke={O} strokeWidth="4" />
      <path d="M40 34 C52 26 60 40 54 56 C46 52 42 44 40 34z" fill="#78350f" stroke={O} strokeWidth="3" />
      <path d="M8 62 L22 64 L22 82 L8 80z" fill="#fde68a" stroke={O} strokeWidth="3.5" strokeLinejoin="round" />
      <ellipse cx="9" cy="62" rx="6" ry="5" fill="#000" />
      <g className="dog-jaw"><path d="M10 82 L30 84 L26 96 L12 92z" fill="#fca5a5" stroke={O} strokeWidth="3.5" strokeLinejoin="round" /><path d="M14 82 l3 6 l3 -6M22 83 l3 6 l3 -5" fill="#fff" stroke={O} strokeWidth="1.5" /></g>
      <circle cx="32" cy="50" r="6" fill="#fff" stroke={O} strokeWidth="2.5" /><circle cx="30" cy="50" r="3" fill={O} />
      <path d="M22 40 l12 -4" stroke={O} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

export function BallSvg() {
  return (
    <svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="18.5" fill="#ff4757" stroke={O} strokeWidth="3" />
      <path d="M4 14 Q20 24 36 14 M4 26 Q20 16 36 26" fill="none" stroke={O} strokeWidth="2" opacity=".5" />
      <circle cx="14" cy="18" r="2" fill={O} /><circle cx="26" cy="18" r="2" fill={O} />
      <path d="M16 25 q4 3 8 0" fill="none" stroke={O} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
