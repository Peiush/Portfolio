import { useEffect, useRef } from "react";
import type { ReactNode, RefObject, CSSProperties } from "react";
import { Draggable } from "../../lib/gsap";
import { PixelIcon } from "./Pixel";
import type { IconId } from "../../data/skills";

export const theme = {
  frame:
    "bg-[#d4a373] border-t-2 border-l-2 border-t-[#f4e3b1] border-l-[#f4e3b1] border-r-2 border-b-2 border-r-[#5c3d24] border-b-[#5c3d24] shadow-[4px_4px_0_rgba(61,37,20,.35)]",
  title: "bg-gradient-to-r from-[#8c6239] to-[#d4a373] border-b border-[#5c3d24]",
  btn: "bg-[#dda15e] text-[#3d2514] rounded-[3px] font-mono border-t border-l border-t-white border-l-white border-r border-b border-r-[#3d2514] border-b-[#3d2514] hover:bg-[#e9c46a] active:border-t-[#3d2514] active:border-l-[#3d2514] active:border-r-white active:border-b-white",
  raised: "border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#404040] border-b-[#404040]",
  sunken: "border-t-2 border-l-2 border-t-[#404040] border-l-[#404040] border-r-2 border-b-2 border-r-white border-b-white",
};

interface Props {
  id: string;
  title: string;
  icon: IconId;
  left: string;
  top: string;
  width: string;
  z: number;
  visible: boolean;
  cursor?: string;
  desktopRef: RefObject<HTMLDivElement | null>;
  onFocus: () => void;
  onMinimize: () => void;
  onClose: () => void;
  children: ReactNode;
  bodyClass?: string;
}

export function Window({ id, title, icon, left, top, width, z, visible, cursor, desktopRef, onFocus, onMinimize, onClose, children, bodyClass = "" }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const focusRef = useRef(onFocus);
  focusRef.current = onFocus;

  useEffect(() => {
    const node = el.current, handle = bar.current;
    if (!node || !handle) return;
    const mq = window.matchMedia("(min-width:768px)");
    let d: Draggable | undefined;
    const make = () => {
      d?.kill();
      d = undefined;
      if (mq.matches) {
        d = Draggable.create(node, {
          type: "x,y",
          trigger: handle,
          bounds: desktopRef.current ?? undefined,
          dragClickables: false,
          onPress: () => focusRef.current(),
        })[0];
      }
    };
    make();
    mq.addEventListener("change", make);
    return () => { mq.removeEventListener("change", make); d?.kill(); };
  }, [desktopRef]);

  const style = {
    "--wx": left, "--wy": top, "--ww": width, zIndex: z,
    display: visible ? undefined : "none",
  } as CSSProperties;

  return (
    <div
      ref={el}
      data-win={id}
      data-cursor={cursor}
      onPointerDown={onFocus}
      className={`edos-window edos-window-boot relative mx-3 mb-4 max-w-[calc(100vw-24px)] md:mx-0 md:mb-0 md:max-w-none md:absolute md:left-[var(--wx)] md:top-[var(--wy)] md:w-[var(--ww)] ${theme.frame}`}
      style={style}
      role="dialog"
      aria-label={title}
    >
      <div ref={bar} data-cursor="retro-move" className={`edos-titlebar flex items-center gap-1.5 pl-1.5 pr-1 py-1 md:py-[3.5px] cursor-grab active:cursor-grabbing select-none ${theme.title}`}>
        <PixelIcon id={icon} size={14} />
        <span className="flex-1 text-[#fdfbf7] text-[11px] font-bold tracking-wide font-mono truncate">{title}</span>
        <button type="button" data-cursor="retro-hand" onClick={onMinimize} title="Minimize" aria-label={`Minimize ${title}`} className={`w-8 h-8 md:w-4 md:h-4 flex items-end justify-center pb-[11px] md:pb-[3px] ${theme.btn}`}>
          <span className="block w-2 h-[2px] bg-[#3d2514]" />
        </button>
        <button type="button" data-cursor="retro-hand" onClick={onClose} title="Close" aria-label={`Close ${title}`} className={`w-8 h-8 md:w-4 md:h-4 text-base md:text-[11px] leading-none flex items-center justify-center ${theme.btn}`}>×</button>
      </div>
      <div className="p-1 bg-[#d4a373]">
        <div className={`bg-[#fdfbf7] text-[#3d2514] ${bodyClass}`}>{children}</div>
      </div>
    </div>
  );
}
