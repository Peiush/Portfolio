import { useEffect, useRef, useState } from "react";
import { site } from "../../data/site";
import { manifesto, portalBlurbs } from "../../data/skills";
import { track } from "../../lib/track";
import { theme } from "./Window";

const chip = "px-1.5 py-0.5 bg-[#fefae0] border border-[#dda15e] rounded text-[10px] font-mono text-[#3d2514]";
const win95 = "bg-[#c0c0c0] text-black border-t-2 border-l-2 border-t-white border-l-white border-r-2 border-b-2 border-r-[#404040] border-b-[#404040] font-mono text-[11px] px-2 py-0.5 active:border-t-[#404040] active:border-l-[#404040] active:border-r-white active:border-b-white";

export function Chips({ items }: { items: string[] }) {
  return <div className="flex flex-wrap gap-1 mt-2">{items.map((c) => <span key={c} className={chip}>{c}</span>)}</div>;
}

export function FrontendWindow() {
  const [n, setN] = useState(0);
  return (
    <div className="p-3 text-[11px] leading-relaxed font-sans">
      <p><b>Interface engineering.</b> Responsive React and Next.js UIs with smooth GSAP motion.</p>
      <div className="flex items-center gap-2 mt-3">
        <button type="button" data-cursor="retro-hand" onClick={() => setN((v) => v + 1)} className={win95}>setState(+1)</button>
        <span className="font-mono text-[11px]">renders: {n}</span>
      </div>
      <Chips items={["React", "Next.js", "TypeScript", "Tailwind CSS", "GSAP"]} />
    </div>
  );
}

const rows = [
  { id: "usr_01", name: "ada", ms: 18 },
  { id: "usr_02", name: "linus", ms: 7 },
  { id: "usr_03", name: "grace", ms: 12 },
];

export function BackendWindow() {
  const [ms, setMs] = useState<number | null>(null);
  const [sorted, setSorted] = useState<"id" | "ms">("id");
  const data = [...rows].sort((a, b) => (sorted === "ms" ? a.ms - b.ms : a.id.localeCompare(b.id)));
  return (
    <div className="p-3 text-[11px] leading-relaxed font-sans">
      <p><b>APIs, data &amp; auth.</b> Zod-validated REST APIs, Prisma and secure auth (JWT, NextAuth, TOTP 2FA).</p>
      <div className="flex items-center gap-2 mt-3">
        <button type="button" data-cursor="retro-hand" onClick={() => setMs(Math.round(8 + Math.random() * 20))} className={win95}>send request</button>
        <code className="text-[10px] bg-[#152e22] text-[#e9d8a6] px-1.5 py-1 flex-1">
          {ms === null ? "GET /api/health" : `GET /api/health → 200 OK ${ms}ms`}
        </code>
      </div>
      <table className="w-full mt-3 text-[10px] font-mono border border-[#dda15e]">
        <thead className="bg-[#fefae0]">
          <tr>
            <th className="text-left p-1"><button type="button" data-cursor="retro-hand" onClick={() => setSorted("id")} className="underline decoration-dotted">id</button></th>
            <th className="text-left p-1">name</th>
            <th className="text-left p-1"><button type="button" data-cursor="retro-hand" onClick={() => setSorted("ms")} className="underline decoration-dotted">latency</button></th>
          </tr>
        </thead>
        <tbody>{data.map((r) => <tr key={r.id} className="border-t border-[#dda15e]/50"><td className="p-1">{r.id}</td><td className="p-1">{r.name}</td><td className="p-1">{r.ms}ms</td></tr>)}</tbody>
      </table>
      <Chips items={["Node.js", "Express", "PostgreSQL", "Prisma", "Zod", "JWT"]} />
    </div>
  );
}

const steps = ["build", "test", "deploy"];
export function DevopsWindow() {
  const [step, setStep] = useState(-1);
  const timer = useRef(0);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const run = () => {
    if (step >= 0 && step < steps.length) return;
    setStep(0);
    let i = 0;
    const tick = () => {
      i++;
      setStep(i);
      if (i < steps.length) timer.current = window.setTimeout(tick, 700);
    };
    timer.current = window.setTimeout(tick, 700);
  };
  return (
    <div className="p-3 text-[11px] leading-relaxed font-sans">
      <p><b>Shipping &amp; infra.</b> GitHub Actions CI with Vitest and type-checks gating every merge.</p>
      <div className="flex items-center gap-2 mt-3">
        <button type="button" data-cursor="retro-hand" onClick={run} className={win95}>deploy</button>
        <div className="flex items-center gap-1 font-mono text-[10px]">
          {steps.map((s, i) => (
            <span key={s} className="flex items-center gap-1">
              <span className={i < step ? "text-[#2d6a4f] font-bold" : i === step ? "text-[#bc6c25] font-bold animate-pulse" : "text-[#3d2514]/50"}>
                {s}{i < step || (i === step && step === steps.length) ? " ✓" : ""}
              </span>
              {i < steps.length - 1 && <span>→</span>}
            </span>
          ))}
        </div>
      </div>
      <Chips items={["Docker", "Kubernetes", "GitHub Actions", "AWS S3"]} />
    </div>
  );
}

export function Notepad() {
  return (
    <div className="bg-[#c0c0c0] p-1 font-mono text-[11px]">
      <div className="bg-white text-black p-3 border-t-2 border-l-2 border-t-[#404040] border-l-[#404040] border-r-2 border-b-2 border-r-white border-b-white leading-relaxed">
        <p className="text-[#808080] mb-2">{manifesto.header}</p>
        <ol className="list-decimal pl-5 space-y-1">
          {manifesto.principles.map((p) => <li key={p}>{p}</li>)}
        </ol>
      </div>
    </div>
  );
}

type Repo = { name: string; url: string; pushed: string; lang: string | null };

const ago = (iso: string) => {
  const d = Math.max(0, Date.now() - new Date(iso).getTime()) / 864e5;
  return d < 1 ? "today" : d < 2 ? "yesterday" : d < 30 ? `${Math.floor(d)}d ago` : d < 365 ? `${Math.floor(d / 30)}mo ago` : `${Math.floor(d / 365)}y ago`;
};

/** Latest pushed public repos, fetched client-side once and cached for the session. Fails silently. */
function useRepos(handle: string) {
  const [repos, setRepos] = useState<Repo[] | null>(null);
  useEffect(() => {
    const key = `gh-repos:${handle}`;
    try {
      const hit = sessionStorage.getItem(key);
      if (hit) { setRepos(JSON.parse(hit)); return; }
    } catch { /* storage unavailable */ }
    const ac = new AbortController();
    fetch(`https://api.github.com/users/${handle}/repos?sort=pushed&per_page=3&type=owner`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((rows: { name: string; html_url: string; pushed_at: string; language: string | null; fork: boolean }[]) => {
        const out = rows.filter((r) => !r.fork).map((r) => ({ name: r.name, url: r.html_url, pushed: r.pushed_at, lang: r.language }));
        setRepos(out);
        try { sessionStorage.setItem(key, JSON.stringify(out)); } catch { /* ignore */ }
      })
      .catch(() => setRepos([]));
    return () => ac.abort();
  }, [handle]);
  return repos;
}

const glyph: Record<string, string> = { github: "GH", linkedin: "in", instagram: "IG", email: "@" };

export function Atlas() {
  const [sel, setSel] = useState(site.socials[0].id);
  const cur = site.socials.find((s) => s.id === sel) ?? site.socials[0];
  const gh = site.socials.find((s) => s.id === "github");
  const repos = useRepos(gh ? new URL(gh.url).pathname.slice(1) : "");
  return (
    <div className="p-3 text-[#3d2514]">
      <div className="flex items-center gap-3 rounded-md border border-[#dda15e] bg-[#fefae0]/80 p-2 shadow-[inset_0_0_18px_rgba(221,161,94,.1)]">
        <div className="w-12 h-12 rounded-full bg-[#2d6a4f] text-[#fefae0] flex items-center justify-center font-serif font-bold text-lg shrink-0">{site.name[0]}</div>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-sm font-bold truncate">{site.name}'s social satchel</p>
          <p className="font-mono text-[10px] text-[#606c38]">Four portals. One curious maker.</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#2d6a4f]">
          <span className="flex items-end gap-[2px] h-3" aria-hidden="true">
            {[0, 140, 280].map((d) => <i key={d} className="satchel-bar block w-[3px] h-full bg-[#52b788]" style={{ animationDelay: `${d}ms` }} />)}
          </span>
          live
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="grid grid-cols-2 gap-2 content-start">
          {site.socials.map((s) => {
            const on = s.id === sel;
            return (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${site.name} on ${s.label}: ${s.handle}`}
                data-cursor="retro-hand"
                onMouseEnter={() => setSel(s.id)}
                onFocus={() => setSel(s.id)}
                onClick={() => { setSel(s.id); track("social_click", { network: s.id }); }}
                className={`group rounded-md border p-2 flex flex-col gap-1 transition-all ${on ? "border-[#bc6c25] bg-[#fff7dc] shadow-[2px_2px_0_#d4a373] -translate-y-px" : "border-[#dda15e]/60 bg-white/75"}`}
              >
                <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold transition-transform group-hover:-rotate-6 group-hover:scale-105" style={{ background: s.color }}>{glyph[s.id]}</span>
                <span className="font-serif text-[12px] font-bold flex items-center justify-between">{s.label}<span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">↗</span></span>
                <span className="font-mono text-[10px] text-[#606c38] truncate">{s.handle}</span>
              </a>
            );
          })}
        </div>
        <div className="rounded-md bg-[#283618] text-[#fefae0] p-2.5 flex flex-col gap-2" style={{ backgroundImage: "radial-gradient(rgba(254,250,224,.07) 1px,transparent 1px)", backgroundSize: "8px 8px" }}>
          <p className="font-mono text-[10px] text-[#dda15e]">BUILD LOG ✦ connected</p>
          <p className="font-serif text-sm font-bold">{cur.label}</p>
          <p className="text-[11px] leading-snug flex-1">{portalBlurbs[cur.id]}</p>
          {cur.id === "github" && repos && repos.length > 0 && (
            <ul className="font-mono text-[10px] space-y-0.5 border-t border-dashed border-[#dda15e]/50 pt-1.5" aria-label="Recently pushed repositories">
              {repos.map((r) => (
                <li key={r.name} className="flex justify-between gap-2">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="truncate hover:text-[#e9c46a]">▸ {r.name}</a>
                  <span className="shrink-0 text-[#dda15e]">{ago(r.pushed)}</span>
                </li>
              ))}
            </ul>
          )}
          <a href={cur.url} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-[#e9c46a] underline">{cur.handle} open ↗</a>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-dashed border-[#dda15e] flex justify-between font-mono text-[9px] text-[#606c38]">
        <span>meet me beyond the grove</span><span>safe portals only ✦</span>
      </div>
    </div>
  );
}

export function Portrait() {
  return (
    <div className="p-2 text-center">
      <div className="relative bg-white border border-[#dda15e] p-2">
        {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, i) => (
          <span key={pos} className={`absolute ${pos} text-xs leading-none`} aria-hidden="true">{["🌸", "🍃", "🍃", "🌸"][i]}</span>
        ))}
        {/* {{TODO}} replace with a 1-bit dithered pixel portrait of Piyush (512px) */}
        <img src="/images/assets/portrait.svg" alt={`Pixelated portrait of ${site.name}`} width="170" height="236" loading="lazy" className="w-[170px] mx-auto" style={{ imageRendering: "pixelated", filter: "grayscale(1) contrast(1.6)" }} />
      </div>
      <p className="font-mono text-[9px] mt-1 text-[#606c38]">me.bmp — 1-bit, hand-dithered</p>
    </div>
  );
}
