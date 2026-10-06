export type SkinId = "minimal" | "brutal" | "constructivism" | "swiss" | "handdrawn";
export const skinOrder: SkinId[] = ["minimal", "brutal", "constructivism", "swiss", "handdrawn"];

/** Final clip-paths, initial (collapsed) clip-paths and centers (% of hero) per cell. */
export const cellGeometry = [
  { final: "polygon(0% 0%, 45% 0%, 40% 52%, 0% 45%)", initial: "polygon(0% 0%, 0% 0%, 0% 52%, 0% 45%)", center: [21.25, 24.25] },
  { final: "polygon(45% 0%, 100% 0%, 100% 40%, 70% 48%, 40% 52%)", initial: "polygon(45% 0%, 45% 0%, 45% 52%, 45% 48%, 45% 52%)", center: [71, 28] },
  { final: "polygon(0% 45%, 40% 52%, 35% 100%, 0% 100%)", initial: "polygon(0% 45%, 40% 45%, 40% 45%, 0% 45%)", center: [18.75, 74.25] },
  { final: "polygon(40% 52%, 70% 48%, 65% 100%, 35% 100%)", initial: "polygon(40% 52%, 40% 52%, 40% 100%, 40% 100%)", center: [52.5, 75] },
  { final: "polygon(70% 48%, 100% 40%, 100% 100%, 65% 100%)", initial: "polygon(70% 48%, 70% 48%, 70% 100%, 70% 100%)", center: [83.75, 72] },
] as const;

/** Heading sizes and block positions are bound to the cell so text always fits its polygon. */
const headingSize = [
  "text-5xl md:text-6xl lg:text-7xl",
  "text-6xl md:text-7xl lg:text-8xl",
  "text-7xl md:text-8xl",
  "text-6xl md:text-7xl",
  "text-3xl md:text-4xl text-center",
];
const blockPos = [
  "md:left-[8%] md:top-[14%] md:text-left md:items-start",
  "md:left-[71%] md:top-[28%] md:-translate-x-1/2 md:-translate-y-1/2 md:text-center md:items-center",
  "md:left-[5%] md:bottom-[12%] md:text-left md:items-start",
  "md:left-[52%] md:bottom-[15%] md:-translate-x-1/2 md:text-left md:items-start",
  "md:right-[8%] md:bottom-[15%] max-w-[280px] md:text-center md:items-center",
];
const mobileTop = ["0%", "12.5%", "37.5%", "62.5%", "87.5%"];
const puppetPos = [
  "left-[26%] top-[10%]",
  "left-[50%] top-[22%]",
  "left-[16%] top-[56%]",
  "left-[40%] top-[46%]",
  "left-[60%] top-[52%]",
];

const dotGrid = (size: number, op: number) =>
  `background-image:radial-gradient(#e4e4e7 1px,transparent 1px);background-size:${size}px ${size}px;opacity:${op}`;

const puppetSvg = `
<div id="hero-puppet-bounds" class="absolute inset-0 z-20 p-6 hidden md:block pointer-events-none">
  <div id="hero-puppet-window" class="absolute {POS} w-28 h-44 cursor-grab active:cursor-grabbing pointer-events-auto" data-cursor="brutal">
    <div class="absolute -top-6 -right-2 z-10 bg-[#ff85a2] border-2 border-black shadow-[2px_2px_0_#000] rotate-6 px-1.5 font-handwritten text-[10px] font-bold">ME!</div>
    <svg viewBox="0 0 142 217" class="w-full h-full overflow-visible" aria-hidden="true" focusable="false" fill="none" stroke="#000" stroke-width="5" stroke-linecap="round">
      <path class="puppet-left-arm-path" d="M56 88 Q30 104 20 132"/>
      <path class="puppet-right-arm-path" d="M86 88 Q112 104 122 132"/>
      <path class="puppet-left-leg-path" d="M62 146 Q55 178 50 208"/>
      <path class="puppet-right-leg-path" d="M80 146 Q87 178 92 208"/>
      <defs>
        <pattern id="puppet-check" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="#fff" stroke="none"/><path d="M0 3H12M3 0V12" stroke="#111" stroke-width="1.4" stroke-linecap="butt"/></pattern>
        <clipPath id="puppet-face"><path d="M44 36C44 18 56 12 71 12S98 18 98 36V44C98 52 94 58 88 62L80 68C77 70 74 71 71 71S65 70 62 68L54 62C48 58 44 52 44 44Z"/></clipPath>
      </defs>
      <rect x="52" y="70" width="38" height="78" rx="6" fill="url(#puppet-check)"/>
      <rect x="63" y="62" width="16" height="14" fill="#B98254" stroke-width="3.5"/>
      <path d="M63 70L71 86L79 70Z" fill="#B98254" stroke-width="3"/>
      <path d="M54 70L63 70L71 86L58 83Z M88 70L79 70L71 86L84 83Z" fill="url(#puppet-check)" stroke-width="3" stroke-linejoin="round"/>
      <path d="M44 36C44 18 56 12 71 12S98 18 98 36V44C98 52 94 58 88 62L80 68C77 70 74 71 71 71S65 70 62 68L54 62C48 58 44 52 44 44Z" fill="#C48B5A"/>
      <g clip-path="url(#puppet-face)"><path d="M40 36C44 50 54 56 63 57C67 52 75 52 79 57C88 56 98 50 102 36V80H40Z" fill="#1F1A17" stroke="none" opacity=".95"/></g>
      <path d="M44 36C44 18 56 12 71 12S98 18 98 36V44C98 52 94 58 88 62L80 68C77 70 74 71 71 71S65 70 62 68L54 62C48 58 44 52 44 44Z"/>
      <path d="M44 38C40 20 50 5 71 4C92 3 102 20 98 38C97 30 94 24 90 21L86 24 82 18 77 24 72 17 66 24 61 18 56 24 51 20C47 26 45 32 44 38Z" fill="#0B0B0B" stroke-width="3.5" stroke-linejoin="round"/>
      <path d="M44 38C43 44 44 50 46 54L49 46C48 42 48 38 49 34ZM98 38C99 44 98 50 96 54L93 46C94 42 94 38 93 34Z" fill="#0B0B0B" stroke="none" opacity=".45"/>
      <g data-puppet-eye><circle cx="60" cy="38" r="6" fill="#fff" stroke-width="3"/><circle data-puppet-pupil cx="60" cy="38" r="3" fill="#000" stroke="none"/></g>
      <g data-puppet-eye><circle cx="82" cy="38" r="6" fill="#fff" stroke-width="3"/><circle data-puppet-pupil cx="82" cy="38" r="3" fill="#000" stroke="none"/></g>
      <path d="M52 30Q60 26 67 30M75 30Q82 26 90 30" stroke-width="4"/>
      <path d="M71 40L69 47Q71 49 74 47" stroke-width="2.5"/>
      <path d="M58 52C64 47 68 51 71 50C74 51 78 47 84 52C78 55 74 53 71 53C68 53 64 55 58 52Z" fill="#0B0B0B" stroke="none"/>
      <ellipse cx="71" cy="60" rx="8" ry="3.5" fill="#B67A4C" stroke="none"/>
      <path d="M65 59Q71 63 77 59" stroke-width="2.5"/>
    </svg>
  </div>
</div>`;

interface SkinDef {
  root: string;
  filter?: string;
  texture: string;
  decor: (cell: number) => string;
  block: (word: string, cell: number) => string;
}

const skins: Record<SkinId, SkinDef> = {
  minimal: {
    root: "bg-[#0b0b10] hover:bg-[#0e0e15] transition-colors duration-500 border border-white/5 text-zinc-200",
    texture: dotGrid(24, 0.14),
    decor: () => `
      <div class="absolute -left-[10%] -top-[20%] w-[70%] h-[80%] rounded-full bg-[#a855f7]/25 blur-[90px] pointer-events-none"></div>
      <div class="absolute -right-[15%] top-[10%] w-[60%] h-[70%] rounded-full bg-[#DC2626]/20 blur-[100px] pointer-events-none"></div>
      <div class="absolute left-[20%] -bottom-[30%] w-[50%] h-[60%] rounded-full bg-[#22d3ee]/10 blur-[90px] pointer-events-none"></div>
      <div data-orb class="absolute w-40 h-40 rounded-full bg-gradient-to-br from-[#a855f7]/30 to-[#DC2626]/20 blur-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none left-0 top-0"></div>
      <span class="hidden md:block absolute top-5 left-5 w-5 h-5 border-t-2 border-l-2 border-[#a855f7]/70 pointer-events-none"></span>
      <span class="hidden md:block absolute top-5 right-5 w-5 h-5 border-t-2 border-r-2 border-[#DC2626]/70 pointer-events-none"></span>
      <span class="hidden md:block absolute bottom-5 left-5 w-5 h-5 border-b-2 border-l-2 border-[#DC2626]/70 pointer-events-none"></span>
      <p class="hidden md:flex absolute bottom-5 right-8 items-center gap-2 text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-500 pointer-events-none"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]"></span>signal clear</p>`,
    block: (w, c) => `
      <p class="hero-text-anim hidden md:inline-flex items-center gap-2 text-[11px] tracking-[0.4em] uppercase text-[#c084fc] font-mono mb-3"><span class="w-6 h-px bg-gradient-to-r from-[#a855f7] to-transparent"></span>[ style 01 : minimalism ]</p>
      <h2 class="hero-text-anim ${headingSize[c]} font-light tracking-widest font-sans lowercase leading-none bg-gradient-to-r from-white via-[#e9d5ff] to-[#fb7185] bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(168,85,247,0.35)]">${w}</h2>
      <div class="hero-text-anim hidden md:block mt-4 w-24 h-[3px] bg-gradient-to-r from-[#a855f7] via-[#DC2626] to-transparent"></div>
      <p class="hero-text-anim hidden md:block mt-4 text-[12px] font-light tracking-[0.2em] text-zinc-300 max-w-[260px]">redefined through subtraction and <span class="text-[#fb7185] font-medium">absolute focus.</span></p>`,
  },
  brutal: {
    root: "bg-[#fde047] text-black border border-black/10",
    texture: "background-image:linear-gradient(to right,#000 1px,transparent 1px),linear-gradient(to bottom,#000 1px,transparent 1px);background-size:30px 30px;opacity:.15",
    decor: (c) => puppetSvg.replace("{POS}", puppetPos[c]),
    block: (w, c) => `
      <p class="hero-text-anim hidden md:inline-block px-3 py-1 bg-black text-[#fde047] text-[10px] tracking-[0.2em] font-mono uppercase mb-4 shadow-[2px_2px_0_#000] border-2 border-black">STYLE 02 // NEOBRUTALISM</p>
      <h2 class="hero-text-anim ${headingSize[c]} font-extrabold tracking-tighter uppercase text-black font-neobrutal drop-shadow-[5px_5px_0_rgba(0,0,0,1)] leading-none">${w}</h2>`,
  },
  constructivism: {
    root: "bg-[#E7E2D8] text-black",
    texture: "display:none",
    decor: () => `
      <div data-bar class="absolute left-1/2 top-[30%] w-[170%] h-14 bg-[#991B1B] pointer-events-none transition-transform duration-700" style="transform:translate(-50%,-50%) rotate(-12deg)"></div>
      <div data-ring class="absolute left-[78%] top-[22%] w-28 h-28 border-[10px] border-zinc-950 rounded-full pointer-events-none transition-transform duration-1000" style="transform:translate(-50%,-50%)"></div>
      <div class="hidden md:block absolute right-6 bottom-6 w-0 h-0 border-l-[56px] border-l-transparent border-b-[70px] border-b-zinc-950 pointer-events-none"></div>`,
    block: (w, c) => `
      <p class="hero-text-anim hidden md:inline-block bg-black text-[#E7E2D8] px-2 py-0.5 text-[10px] font-mono font-bold tracking-[0.3em] mb-2">СТРУКТУРА / 03</p>
      <h2 class="hero-text-anim ${headingSize[c]} font-constructivism uppercase text-zinc-950 -rotate-3 tracking-wider leading-none">${w}</h2>`,
  },
  swiss: {
    root: "bg-[#E11D48] text-white",
    texture: "display:none",
    decor: () => `
      <p class="hidden md:block absolute top-6 left-6 text-[9px] font-mono uppercase text-white/40">Grid 12-B // Internat. Typographic Style</p>
      <div class="hidden md:block absolute bottom-6 right-6 w-8 h-8 opacity-[.85]"><span class="absolute left-1/2 top-0 h-full w-[6px] -translate-x-1/2 bg-white"></span><span class="absolute top-1/2 left-0 w-full h-[6px] -translate-y-1/2 bg-white"></span></div>`,
    block: (w, c) => `
      <p class="hero-text-anim font-swiss font-black text-xs text-white/50 mb-2"><span class="swiss-grid-item inline-block">[04]</span>&nbsp;&nbsp;<span class="swiss-grid-item inline-block">CH-8000</span></p>
      <h2 class="hero-text-anim swiss-grid-item ${headingSize[c]} font-swiss font-black uppercase tracking-tighter leading-none text-white">${w}</h2>
      <div class="hero-text-anim hidden md:grid grid-cols-3 gap-4 border-t border-white/30 pt-3 mt-5 text-[9px] font-mono text-white/70">
        <span class="swiss-grid-item">HELVETICA</span><span class="swiss-grid-item">ASYMMETRIC</span><span class="swiss-grid-item">STRUCTURE</span>
      </div>`,
  },
  handdrawn: {
    root: "bg-[#FBF7F0] text-zinc-900",
    filter: "url(#handdrawn-wobble)",
    texture: "background-image:radial-gradient(#000 .7px,transparent .7px);background-size:16px 16px;opacity:.15",
    decor: () => `
      <svg data-star class="absolute top-12 left-12 w-10 h-10 text-amber-500 animate-pulse transition-transform duration-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.1L12 17.6 5.7 21.3l1.7-7.1L2 9.5l7.1-.6z"/></svg>
      <div data-arrow data-hero-rotate role="button" tabindex="0" aria-label="Rotate the hero styles" class="hidden md:block absolute bottom-16 right-16 w-12 h-12 text-blue-500 cursor-pointer transition-transform duration-500">
        <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 26c10-3 22-3 34-1"/><path d="M30 12l12 13-13 11"/></svg>
      </div>`,
    block: (w, c) => `
      <p class="hero-text-anim hidden md:inline-block text-[11px] font-mono uppercase tracking-widest text-zinc-500 font-bold border-b border-dashed border-zinc-400 pb-1 mb-3">* aesthetic #05 *</p>
      <h2 class="hero-text-anim ${headingSize[c]} font-extrabold tracking-tight font-handwritten text-zinc-900 leading-tight">${w}</h2>
      <div class="hero-text-anim w-16 h-1 bg-black rounded-full animate-bounce mt-3 hidden md:block"></div>`,
  },
};

/** Renders the inner contents of a hero cell for a given skin. Used on server and client. */
export function renderCell(cell: number, skin: SkinId, word: string): string {
  const s = skins[skin];
  return `
<div data-skin="${skin}" data-cursor="${skin}" class="absolute inset-0 overflow-hidden ${s.root}" style="${s.filter ? `filter:${s.filter}` : ""}">
  <div class="absolute inset-0 pointer-events-none" style="${s.texture}" aria-hidden="true"></div>
  ${s.decor(cell)}
  <div class="hero-block absolute flex flex-col pointer-events-none ${blockPos[cell]}" style="--mt:${mobileTop[cell]}">
    ${s.block(word, cell)}
  </div>
</div>`;
}
