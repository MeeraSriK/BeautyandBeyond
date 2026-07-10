import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

type SydneyNow = {
  full: string;
  weekday: string;
  iso: string;
  utc: string;
  validation: string;
};

export const Route = createFileRoute("/admin/clock")({
  component: AdminClock,
  head: () => ({
    meta: [
      { title: "Clock debug — admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

function AdminClock() {
  const [data, setData] = useState<SydneyNow | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/public/debug/clock", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as SydneyNow;
        if (!cancelled) {
          setData(json);
          setFetchedAt(new Date().toLocaleTimeString());
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    };
    load();
    const id = setInterval(load, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const okValidation = data?.validation.startsWith("ok");

  return (
    <div className="mx-auto max-w-2xl p-8 font-mono text-sm">
      <h1 className="mb-6 text-2xl font-semibold">Chatbot clock — debug view</h1>
      <p className="mb-6 text-muted-foreground">
        This is the exact Sydney date/time injected into every chat reply. Auto-refreshes every 5s.
      </p>

      {error && (
        <div className="mb-4 rounded border border-destructive/50 bg-destructive/10 p-3 text-destructive">
          Failed to load: {error}
        </div>
      )}

      {data && (
        <dl className="space-y-3 rounded-lg border p-5">
          <Row label="Full (Sydney)" value={data.full} />
          <Row label="Weekday" value={data.weekday} />
          <Row label="ISO date" value={data.iso} />
          <Row label="UTC" value={data.utc} />
          <Row
            label="Validation"
            value={data.validation}
            tone={okValidation ? "ok" : "warn"}
          />
          <div className="pt-2 text-xs text-muted-foreground">
            Last fetched at {fetchedAt} (browser local time)
          </div>
        </dl>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn";
}) {
  const toneClass =
    tone === "warn"
      ? "text-amber-600"
      : tone === "ok"
        ? "text-emerald-600"
        : "";
  return (
    <div className="grid grid-cols-[10rem_1fr] gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={`break-words ${toneClass}`}>{value}</dd>
    </div>
  );
}
