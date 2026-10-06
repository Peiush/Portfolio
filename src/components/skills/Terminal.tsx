import { useEffect, useRef, useState } from "react";
import { manifesto, os, tips, windows, type WinId } from "../../data/skills";
import { track } from "../../lib/track";

type Line = { text: string; color?: string };

const boot: Line[] = [
  { text: os.version },
  { text: "(c) Piyush. All rights reserved." },
  { text: `${os.prompt} load skills --all` },
  { text: "[################] frontend ...... OK" },
  { text: "[################] backend ....... OK" },
  { text: "[################] devops ........ OK" },
  { text: "[################] satchel.zip ... ONLINE" },
  { text: `${os.prompt} measure craft --percent` },
  { text: "ERROR: craft cannot be quantified.", color: "#ff6b6b" },
  { text: "TIP: try 'help' or open a window from the desktop.", color: "#f4a261" },
];

interface Props {
  booted: boolean;
  reduced: boolean;
  openWindow: (id: WinId) => void;
  closeSelf: () => void;
  summon: () => void;
}

export function Terminal({ booted, reduced, openWindow, closeSelf, summon }: Props) {
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState<Line | null>(null);
  const [ready, setReady] = useState(false);
  const [value, setValue] = useState("");
  const history = useRef<string[]>([]);
  const hIdx = useRef(0);
  const tip = useRef(0);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!booted) return;
    if (reduced) { setLines(boot); setReady(true); return; }
    let cancelled = false;
    (async () => {
      for (const line of boot) {
        for (let i = 1; i <= line.text.length; i += 3) {
          if (cancelled) return;
          setTyping({ ...line, text: line.text.slice(0, i) });
          await new Promise((r) => setTimeout(r, 14));
        }
        if (cancelled) return;
        setLines((l) => [...l, line]);
        setTyping(null);
        await new Promise((r) => setTimeout(r, 90));
      }
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, [booted, reduced]);

  useEffect(() => { scroller.current?.scrollTo({ top: 1e6 }); }, [lines, typing]);

  const print = (...t: (string | Line)[]) => setLines((l) => [...l, ...t.map((x) => (typeof x === "string" ? { text: x } : x))]);

  const run = (raw: string) => {
    const cmd = raw.trim();
    print(`${os.prompt} ${cmd}`);
    if (!cmd) return;
    history.current.push(cmd);
    hIdx.current = history.current.length;
    const [head, ...rest] = cmd.toLowerCase().split(/\s+/);
    const arg = rest.join(" ");
    track("terminal_command", { command: head });

    const find = (name: string) => windows.find((w) => w.aliases.includes(name));

    switch (head) {
      case "help":
        print("available commands:", "  help  dir  whoami  ver  date  matrix", "  open <name>  cat manifesto.txt  resume", "  play  pause  next  prev  summon  hello  clear  exit");
        break;
      case "dir": case "ls":
        print(...windows.map((w) => w.dirLine), { text: "TIP: 'open <name>' launches any file.", color: "#f4a261" });
        break;
      case "whoami": print("piyush saini — full-stack developer, gurgaon"); break;
      case "resume": case "about":
        print(
          "PIYUSH SAINI — Full Stack Developer",
          "React · Next.js · Node.js · TypeScript · PostgreSQL",
          "",
          "experience:",
          "  ISRO NRSC ........ Full Stack Developer (Feb–Sep 2026)",
          "  FIEN Foundation .. Full Stack Intern (Jun–Aug 2025)",
          "education:",
          "  B.Tech Data Science, The NorthCap University (2022–2026)",
          "certs:",
          "  Azure AI Fundamentals · AWS Academy: Data Engineering",
          "contact: sainipiyush941@gmail.com",
        );
        break;
      case "ver": print(os.version); break;
      case "date": print(new Date().toString()); break;
      case "matrix": {
        const chars = "01アイウエオカキクケコ";
        print(...Array.from({ length: 4 }, () => ({ text: Array.from({ length: 30 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""), color: "#52b788" })), "wake up, recruiter...");
        break;
      }
      case "sudo":
        print({ text: "ERROR: nice try. root is reserved for the deploy pipeline.", color: "#ff6b6b" });
        break;
      case "open": case "start": {
        const w = find(arg);
        if (!w) { print({ text: `ERROR: '${arg || "?"}' not found. try 'dir'.`, color: "#ff6b6b" }); break; }
        openWindow(w.id);
        print(`opening ${w.title}... OK`);
        break;
      }
      case "cat": case "type":
        if (["manifesto.txt", "manifesto", "scroll.txt", "philosophy"].includes(arg)) print(manifesto.header, ...manifesto.principles.map((p, i) => `${i + 1}. ${p}`));
        else print({ text: `ERROR: cannot read '${arg || "?"}'.`, color: "#ff6b6b" });
        break;
      case "cast": case "summon":
        summon();
        print("✦ the fireflies answer. ✦", "feel verified.");
        break;
      case "hello": case "mascot":
        print("launching dialogue sequence... OK");
        window.dispatchEvent(new CustomEvent("open-dialogue"));
        break;
      case "play": case "pause": case "next": case "prev": {
        window.dispatchEvent(new CustomEvent("jukebox", { detail: head }));
        print(head === "pause" ? "♪ paused." : head === "play" ? "♪ now playing from jukebox.exe (volume is in the player)." : `♪ ${head} track.`);
        break;
      }
      case "clear": case "cls": setLines([]); break;
      case "exit": case "quit":
        print("goodbye. the grove will remember you.");
        setTimeout(closeSelf, 600);
        break;
      default:
        print({ text: `'${head}' is not recognized as a command.`, color: "#ff6b6b" }, { text: tips[tip.current++ % tips.length], color: "#f4a261" });
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { run(value); setValue(""); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      hIdx.current = Math.max(0, hIdx.current - 1);
      setValue(history.current[hIdx.current] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      hIdx.current = Math.min(history.current.length, hIdx.current + 1);
      setValue(history.current[hIdx.current] ?? "");
    }
  };

  return (
    <div
      ref={scroller}
      data-cursor="retro-text"
      onClick={() => input.current?.focus()}
      className="bg-[#152e22] p-2.5 font-mono text-[11px] leading-[1.6] text-[#e9d8a6] h-[200px] overflow-y-auto shadow-[inset_2px_2px_6px_rgba(0,0,0,.5)]"
    >
      {lines.map((l, i) => <div key={i} className="whitespace-pre-wrap break-words" style={{ color: l.color }}>{l.text}</div>)}
      {typing && <div className="whitespace-pre-wrap" style={{ color: typing.color }}>{typing.text}<span className="inline-block w-1.5 h-3 bg-[#e9d8a6] align-middle animate-pulse" /></div>}
      {ready && (
        <label className="flex items-center gap-1.5">
          <span>{os.prompt}</span>
          <input
            ref={input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKey}
            aria-label="PiyushOS command prompt"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 min-w-0 bg-transparent outline-none text-[#e9d8a6] caret-[#e9d8a6] select-text"
          />
        </label>
      )}
    </div>
  );
}
