import { streamText, type ModelMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { SYSTEM_PROMPT } from "@/lib/business-facts";

type ChatMessage = { role: "user" | "assistant"; content: string };

type SydneyNow = {
  full: string;
  weekday: string;
  iso: string;
  utc: string;
  validation: string;
};

/**
 * Compute the current wall-clock time in Australia/Sydney via two independent
 * methods and cross-check them. If they disagree (e.g. a stale/incorrect cached
 * clock, wrong host TZ, or DST rollover skew), we fall back to a manually
 * derived value from UTC and flag the drift so the model knows it was corrected.
 */
export function getValidatedSydneyNow(): SydneyNow {
  const now = new Date();
  const utc = now.toISOString();

  // Method A: Intl (authoritative when the ICU/tz database is correct).
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    weekday: "long",
    hour12: false,
  }).formatToParts(now);
  const pick = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const intlIso = `${pick("year")}-${pick("month")}-${pick("day")}`;
  const intlWeekday = pick("weekday");
  const intlHour = Number(pick("hour"));
  const intlMinute = Number(pick("minute"));

  // Method B: derive from UTC epoch + Sydney offset (AEST +10 / AEDT +11).
  // DST in NSW: starts first Sunday of October, ends first Sunday of April.
  const derived = deriveSydneyFromUtc(now);

  // Cross-check: same calendar date and within 2 minutes of derived wall time.
  const deltaMin =
    Math.abs(intlHour * 60 + intlMinute - (derived.hour * 60 + derived.minute));
  const wrappedDeltaMin = Math.min(deltaMin, 1440 - deltaMin);
  const inSync = intlIso === derived.iso && wrappedDeltaMin <= 2;

  const chosen = inSync
    ? {
        iso: intlIso,
        weekday: intlWeekday,
        hour: intlHour,
        minute: intlMinute,
      }
    : derived;

  const hour12 = ((chosen.hour + 11) % 12) + 1;
  const ampm = chosen.hour < 12 ? "AM" : "PM";
  const minuteStr = String(chosen.minute).padStart(2, "0");
  const [y, m, d] = chosen.iso.split("-").map(Number);
  const monthName = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ][(m ?? 1) - 1];
  const full = `${chosen.weekday}, ${d} ${monthName} ${y}, ${hour12}:${minuteStr} ${ampm} AEST/AEDT`;

  return {
    full,
    weekday: chosen.weekday,
    iso: chosen.iso,
    utc,
    validation: inSync
      ? "ok (Intl and UTC-derived Sydney time agree)"
      : `corrected (Intl said ${intlIso} ${intlWeekday} ${intlHour}:${String(intlMinute).padStart(2, "0")}, UTC-derived said ${derived.iso} ${derived.weekday} ${derived.hour}:${String(derived.minute).padStart(2, "0")} — using UTC-derived value)`,
  };
}

function deriveSydneyFromUtc(now: Date) {
  const offsetHours = isSydneyDst(now) ? 11 : 10;
  const shifted = new Date(now.getTime() + offsetHours * 3600 * 1000);
  const iso = `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, "0")}-${String(shifted.getUTCDate()).padStart(2, "0")}`;
  const weekday = [
    "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
  ][shifted.getUTCDay()];
  return {
    iso,
    weekday,
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

function isSydneyDst(now: Date): boolean {
  // NSW DST: 1st Sunday of Oct 02:00 → 1st Sunday of Apr 03:00 (local).
  // Approximate using UTC: shift by +10h to get local wall clock, then test.
  const local = new Date(now.getTime() + 10 * 3600 * 1000);
  const year = local.getUTCFullYear();
  const firstSunday = (month: number) => {
    const d = new Date(Date.UTC(year, month, 1));
    const day = d.getUTCDay();
    return 1 + ((7 - day) % 7);
  };
  const dstStart = Date.UTC(year, 9, firstSunday(9), 2 - 10, 0);   // Oct, 02:00 local = 16:00 UTC prev day handled via -10
  const dstEnd = Date.UTC(year, 3, firstSunday(3), 3 - 11, 0);     // Apr, 03:00 AEDT = 16:00 UTC prev day
  const t = now.getTime();
  // Southern hemisphere: DST spans Oct → Apr next year.
  return t >= dstStart || t < dstEnd;
}


export async function handleChatPost(request: Request) {
  const body = (await request.json()) as { messages?: ChatMessage[] };
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response("Messages required", { status: 400 });
  }

  const key = process.env.LOVABLE_API_KEY;
  if (!key) {
    return new Response("Missing LOVABLE_API_KEY", { status: 500 });
  }

  const gateway = createLovableAiGatewayProvider(key);
  const model = gateway("google/gemini-3-flash-preview");

  const modelMessages: ModelMessage[] = body.messages
    .filter((m) => typeof m?.content === "string" && m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content }));

  const sydney = getValidatedSydneyNow();
  const realtimeContext = `Current real-time context (authoritative — override any training-time assumptions about the date):
- Current date & time in Narellan/Sydney (Australia/Sydney): ${sydney.full}
- Day of week (Sydney): ${sydney.weekday}
- ISO date (Sydney): ${sydney.iso}
- UTC timestamp: ${sydney.utc}
- Timezone validation: ${sydney.validation}
Use this whenever the user asks about today, tomorrow, the current day of the week, today's opening hours, or scheduling. Never state a different day of the week than the one above.`;


  // Hidden debug log — visible in server function logs (stack_modern--server-function-logs).
  console.log("[chat] sydney-now", {
    iso: sydney.iso,
    weekday: sydney.weekday,
    full: sydney.full,
    utc: sydney.utc,
    validation: sydney.validation,
  });

  const result = streamText({
    model,
    system: `${SYSTEM_PROMPT}\n\n${realtimeContext}`,
    messages: modelMessages,
  });

  const response = result.toTextStreamResponse();
  // Debug headers so you can inspect the exact Sydney time used for this reply
  // via DevTools → Network → the /api/public/chat request → Response Headers.
  response.headers.set("X-Sydney-Iso", sydney.iso);
  response.headers.set("X-Sydney-Weekday", sydney.weekday);
  response.headers.set("X-Sydney-Full", sydney.full);
  response.headers.set("X-Sydney-Utc", sydney.utc);
  response.headers.set("X-Sydney-Validation", sydney.validation);
  return response;
}