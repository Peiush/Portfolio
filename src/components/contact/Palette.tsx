import type { Tool } from "./DrawingCanvas";

export const pencils = [
  { name: "Charcoal", hex: "#1C1C1C" },
  { name: "Pencil Blue", hex: "#2563EB" },
  { name: "Waxy Red", hex: "#DC2626" },
  { name: "Forest Green", hex: "#16A34A" },
  { name: "Waxy Orange", hex: "#EA580C" },
];

interface Props {
  visible: boolean;
  tool: Tool;
  color: string;
  onColor: (hex: string) => void;
  onEraser: () => void;
  onClear: () => void;
  /** coarse pointer: show the draw/scroll switch */
  coarse: boolean;
  touchDraw: boolean;
  onTouchDraw: () => void;
}

export function Palette({ visible, tool, color, onColor, onEraser, onClear, coarse, touchDraw, onTouchDraw }: Props) {
  return (
    <div
      data-cursor="default"
      aria-label="Drawing palette"
      role="toolbar"
      className={`fixed z-30 left-1/2 bottom-3 -translate-x-1/2 flex-row max-w-[calc(100vw-16px)] md:left-6 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:translate-x-0 md:flex-col flex items-center bg-[#fbfbfb] border-2 border-zinc-800 p-2.5 gap-2.5 md:p-3.5 md:gap-3.5 shadow-[4px_4px_0_#27272a] transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <span className="hidden md:block text-[9px] font-mono font-bold tracking-wider text-zinc-400 md:-rotate-90 md:mb-3 md:mt-2">PALETTE</span>
      {coarse && (
        <>
          <button type="button" aria-label={touchDraw ? "Drawing on: tap to scroll instead" : "Scrolling: tap to draw instead"} aria-pressed={touchDraw} onClick={onTouchDraw} className={`h-10 px-2.5 flex items-center justify-center border-2 border-zinc-800 text-base leading-none ${touchDraw ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"}`}>{touchDraw ? "✏️" : "👆"}</button>
          <span className="w-px h-6 bg-zinc-300" />
        </>
      )}
      {pencils.map((p) => {
        const on = tool === "pencil" && color === p.hex;
        return (
          <button
            key={p.hex}
            type="button"
            title={p.name}
            aria-label={p.name}
            aria-pressed={on}
            onClick={() => onColor(p.hex)}
            className={`w-8 h-8 md:w-6 md:h-6 rounded-full border-2 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${on ? "border-zinc-950 scale-105 shadow-[2px_2px_0_#000]" : "border-zinc-300 hover:scale-110"}`}
            style={{ background: p.hex }}
          />
        );
      })}
      <span className="w-px h-6 md:w-6 md:h-px bg-zinc-300" />
      <button type="button" title="Eraser" aria-label="Eraser" aria-pressed={tool === "eraser"} onClick={onEraser} className={`w-10 h-10 md:w-7 md:h-7 flex items-center justify-center border-2 border-zinc-800 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${tool === "eraser" ? "bg-zinc-900 text-white" : "bg-white text-zinc-900"}`}>
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"/><path d="M22 21H7"/><path d="m5 11 9 9"/></svg>
      </button>
      <button type="button" title="Clear drawing" aria-label="Clear drawing" onClick={onClear} className="w-10 h-10 md:w-7 md:h-7 flex items-center justify-center border-2 border-zinc-800 bg-white text-zinc-900 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900">
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    </div>
  );
}
