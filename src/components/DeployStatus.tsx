import { useEffect, useState } from "react";

declare const __BUILD_TIME__: string;
const BUILD_TIME = typeof __BUILD_TIME__ !== "undefined" ? __BUILD_TIME__ : "";

function formatAgo(ms: number): string {
  const s = Math.max(1, Math.floor(ms / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function DeployStatus() {
  const [mounted, setMounted] = useState(false);
  const [ago, setAgo] = useState("");
  const maintenance = false; // flip to true to show maintenance

  useEffect(() => {
    setMounted(true);
    const build = BUILD_TIME ? new Date(BUILD_TIME).getTime() : Date.now();
    const tick = () => setAgo(formatAgo(Date.now() - build));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  const isMaint = maintenance;
  const label = isMaint ? "Maintenance" : "Live";
  const dot = isMaint ? "bg-amber-500" : "bg-emerald-500";
  const ring = isMaint ? "bg-amber-500/60" : "bg-emerald-500/60";
  const title = BUILD_TIME
    ? `Deployed ${new Date(BUILD_TIME).toLocaleString()}`
    : "Deployment time unavailable";

  return (
    <div
      className="fixed bottom-3 left-3 z-40 select-none"
      title={title}
      aria-label={`${label} · updated ${ago}`}
    >
      <div className="flex items-center gap-2 rounded-full border border-ink/10 bg-paper/85 backdrop-blur px-2.5 py-1 text-[11px] font-mono-label text-ink/70 shadow-sm">
        <span className="relative inline-flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full ${ring} opacity-60 ${isMaint ? "" : "animate-ping"}`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${dot}`} />
        </span>
        <span>{label}</span>
        {ago && <span className="text-ink/45">· {ago}</span>}
      </div>
    </div>
  );
}
