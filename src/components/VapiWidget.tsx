import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Phone, PhoneOff, Loader2, AlertCircle, X, Settings, Compass } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

function detectIOSBrowser() {
  if (typeof navigator === "undefined") return { isIOS: false, needsSafari: false };
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 1);
  if (!isIOS) return { isIOS: false, needsSafari: false };
  // In-app browsers and non-Safari iOS browsers where mic access is unreliable
  const inApp = /(FBAN|FBAV|Instagram|Line|TikTok|LinkedInApp|Snapchat|Pinterest|MicroMessenger|Twitter|WhatsApp)/i.test(ua);
  const isChromeIOS = /CriOS/.test(ua);
  const isFirefoxIOS = /FxiOS/.test(ua);
  const isEdgeIOS = /EdgiOS/.test(ua);
  const isSafari = /Safari/.test(ua) && !inApp && !isChromeIOS && !isFirefoxIOS && !isEdgeIOS;
  return { isIOS: true, needsSafari: !isSafari };
}

function openInSafari() {
  if (typeof window === "undefined") return;
  const url = window.location.href;
  // iOS Safari deep link — strip protocol and prefix with x-safari-https://
  const safariUrl = url.startsWith("https://")
    ? `x-safari-https://${url.slice("https://".length)}`
    : url.startsWith("http://")
      ? `x-safari-http://${url.slice("http://".length)}`
      : url;
  window.location.href = safariUrl;
}


type VapiInstance = {
  on: (event: string, cb: (...args: unknown[]) => void) => void;
  start: (assistantId: string) => Promise<unknown>;
  stop: () => void;
};

declare global {
  interface Window {
    vapiSDK?: {
      run: (options: {
        apiKey: string;
        assistant: string;
        config?: Record<string, unknown>;
      }) => VapiInstance | null;
    };
  }
}

const VAPI_SCRIPT_SRC = "https://cdn.jsdelivr.net/gh/VapiAI/html-script-tag@latest/dist/assets/index.js";
const PUBLIC_KEY = "6b479ebd-c409-458f-9869-87e58acd2df8";
const ASSISTANT_ID = "c6a701d2-151b-40d4-99fe-b8be78843ca4";

let scriptPromise: Promise<void> | null = null;

type Status = "idle" | "connecting" | "active" | "ending";

type ErrorReason = "permission" | "no-device" | "device-busy" | "network" | "unsupported" | "unknown";

interface FriendlyError {
  reason: ErrorReason;
  title: string;
  message: string;
  steps: string[];
  action?: "retry" | "settings" | "safari";
}

function isBrowserUnsupported() {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;
  const insecure = window.location.protocol !== "https:" && window.location.hostname !== "localhost";
  const noMedia = !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia;
  return insecure || noMedia;
}

function getFriendlyError(error: unknown): FriendlyError {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua);

  if (error instanceof DOMException || error instanceof Error) {
    const name = "name" in error ? error.name : "";
    const message = error.message.toLowerCase();

    if (name === "NotAllowedError" || message.includes("permission") || message.includes("denied")) {
      return {
        reason: "permission",
        title: "Microphone access is blocked",
        message: "Sophia needs microphone permission to talk with you.",
        steps: isIOSDevice
          ? [
              "Open iPhone Settings → Safari → Microphone → Allow",
              "Return here and tap Try again",
            ]
          : [
              "Click the lock/mic icon in your browser address bar",
              "Set Microphone to Allow for this site",
              "Reload the page and tap Try again",
            ],
        action: isIOSDevice ? "safari" : "settings",
      };
    }

    if (name === "NotFoundError" || message.includes("no device") || message.includes("not found")) {
      return {
        reason: "no-device",
        title: "No microphone found",
        message: "We couldn't detect a microphone on this device.",
        steps: [
          "Plug in or enable a microphone",
          "Check your system sound settings",
          "Reload the page and try again",
        ],
        action: "retry",
      };
    }

    if (name === "NotReadableError" || message.includes("in use") || message.includes("busy")) {
      return {
        reason: "device-busy",
        title: "Microphone is busy",
        message: "Another app is currently using your microphone.",
        steps: [
          "Close other apps using the mic (Zoom, FaceTime, Meet…)",
          "Then tap Try again",
        ],
        action: "retry",
      };
    }

    if (
      message.includes("network") ||
      message.includes("fetch") ||
      message.includes("connection") ||
      message.includes("timeout") ||
      message.includes("offline")
    ) {
      return {
        reason: "network",
        title: "Connection problem",
        message: "Sophia couldn't reach the voice service.",
        steps: [
          "Check your Wi-Fi or mobile data",
          "Disable VPN or ad-blockers that may block WebRTC",
          "Then tap Try again",
        ],
        action: "retry",
      };
    }

    if (
      name === "NotSupportedError" ||
      message.includes("not supported") ||
      message.includes("securitycontext") ||
      message.includes("insecure")
    ) {
      return {
        reason: "unsupported",
        title: "Browser not supported",
        message: "This browser can't run the voice call here.",
        steps: isIOSDevice
          ? ["Open this page in Safari on iPhone", "Then tap Talk to Sophia"]
          : [
              "Use the latest Chrome, Edge, Firefox, or Safari",
              "Make sure the page is served over HTTPS",
            ],
        action: isIOSDevice ? "safari" : "retry",
      };
    }
  }

  return {
    reason: "unknown",
    title: "Couldn't start the call",
    message: "Something went wrong connecting to Sophia.",
    steps: [
      "Check your internet connection",
      "Make sure your microphone is allowed",
      "Then tap Try again",
    ],
    action: "retry",
  };
}

async function loadVapiScript(): Promise<void> {
  if (typeof window === "undefined") throw new Error("Voice is unavailable here");
  if (window.vapiSDK) return;
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${VAPI_SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Voice SDK failed to load")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = VAPI_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Voice SDK failed to load"));
      document.head.appendChild(script);
    });
  }
  await scriptPromise;
}

async function createVapiInstance(): Promise<VapiInstance> {
  await loadVapiScript();
  const instance = window.vapiSDK?.run({
    apiKey: PUBLIC_KEY,
    assistant: ASSISTANT_ID,
    config: {
      position: "bottom",
      offset: "0px",
      width: "0px",
      height: "0px",
    },
  });
  document.getElementById("vapi-support-btn")?.remove();
  if (!instance) throw new Error("Voice SDK failed to start");
  return instance;
}

export function VapiWidget({ className }: { className?: string }) {
  const vapiRef = useRef<VapiInstance | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);

  const ensureVapi = useCallback(async () => {
    if (vapiRef.current) return vapiRef.current;
    const v = await createVapiInstance();
    v.on("call-start", () => {
      setError(null);
      setStatus("active");
    });
    v.on("call-end", () => {
      setStatus("idle");
      setIsSpeaking(false);
    });
    v.on("speech-start", () => setIsSpeaking(true));
    v.on("speech-end", () => setIsSpeaking(false));
    v.on("error", (e: unknown) => {
      setError(getFriendlyError(e));
      setStatus("idle");
      setIsSpeaking(false);
    });
    vapiRef.current = v;
    return v;
  }, []);

  useEffect(() => {
    return () => {
      try {
        vapiRef.current?.stop();
      } catch {
        // no-op
      }
    };
  }, []);

  const start = useCallback(async () => {
    setError(null);

    if (isBrowserUnsupported()) {
      setError(getFriendlyError(new DOMException("Browser not supported", "NotSupportedError")));
      return;
    }

    setStatus("connecting");

    try {
      const v = await ensureVapi();
      await v.start(ASSISTANT_ID);
      toast.success("Microphone connected — say hello to Sophia!");
    } catch (e) {
      setError(getFriendlyError(e));
      setStatus("idle");
    }
  }, [ensureVapi]);

  const stop = useCallback(() => {
    setStatus("ending");
    try {
      vapiRef.current?.stop();
    } catch {
      // no-op
    }
  }, []);

  const openBrowserSettings = useCallback(() => {
    toast.info("Look for the microphone icon in your browser's address bar to allow access.");
  }, []);

  const active = status === "active";
  const connecting = status === "connecting";
  const { isIOS, needsSafari } = useMemo(() => detectIOSBrowser(), []);
  const [safariDismissed, setSafariDismissed] = useState(false);
  const showSafariHint = isIOS && needsSafari && !safariDismissed && !active && !connecting;

  return (
    <div className={cn("fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2", className)}>
      {showSafariHint && (
        <div className="max-w-xs rounded-lg border border-ink/10 bg-linen px-4 py-3 text-left shadow-lg">
          <div className="flex items-start gap-3">
            <Compass className="mt-0.5 h-4 w-4 shrink-0 text-ink" aria-hidden />
            <div className="flex-1">
              <p className="text-sm font-medium text-ink">Open in Safari for voice calls</p>
              <p className="mt-1 text-xs text-ink/70">
                Sophia needs microphone access, which works best in Safari on iPhone.
              </p>
              <button
                type="button"
                onClick={openInSafari}
                className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-linen hover:bg-ink/90"
              >
                <Compass className="h-3 w-3" />
                Open in Safari
              </button>
            </div>
            <button
              type="button"
              onClick={() => setSafariDismissed(true)}
              className="-mr-1 -mt-1 rounded p-1 text-ink/50 hover:bg-ink/5 hover:text-ink"
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {error && (() => {
        const reasonLabel: Record<ErrorReason, string> = {
          permission: "Microphone permission",
          "no-device": "No microphone",
          "device-busy": "Microphone in use",
          network: "Connectivity",
          unsupported: "Unsupported browser",
          unknown: "Unexpected error",
        };
        const primaryAction = error.action;
        return (
          <div
            role="alert"
            className="max-w-xs rounded-lg border border-red-200 bg-linen px-4 py-3 text-left shadow-lg"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
              <div className="flex-1">
                <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-mono-label uppercase tracking-wide text-red-700">
                  {reasonLabel[error.reason]}
                </span>
                <p className="mt-1.5 text-sm font-medium text-ink">{error.title}</p>
                <p className="mt-1 text-xs text-ink/70">{error.message}</p>
                {error.steps.length > 0 && (
                  <ol className="mt-2 list-decimal space-y-1 pl-4 text-xs text-ink/70">
                    {error.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {primaryAction === "settings" && (
                    <button
                      type="button"
                      onClick={openBrowserSettings}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-ink underline-offset-2 hover:underline"
                    >
                      <Settings className="h-3 w-3" />
                      How to allow access
                    </button>
                  )}
                  {primaryAction === "safari" && (
                    <button
                      type="button"
                      onClick={openInSafari}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-linen hover:bg-ink/90"
                    >
                      <Compass className="h-3 w-3" />
                      Open in Safari
                    </button>
                  )}
                  {primaryAction === "retry" && (
                    <button
                      type="button"
                      onClick={start}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-ink underline-offset-2 hover:underline"
                    >
                      <Phone className="h-3 w-3" />
                      Try again
                    </button>
                  )}
                  {isIOS && primaryAction !== "safari" && (
                    <button
                      type="button"
                      onClick={openInSafari}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-ink underline-offset-2 hover:underline"
                    >
                      <Compass className="h-3 w-3" />
                      Open in Safari
                    </button>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="-mr-1 -mt-1 rounded p-1 text-ink/50 hover:bg-ink/5 hover:text-ink"
                aria-label="Dismiss error"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })()}

      {(() => {
        const ending = status === "ending";
        const hasError = !!error;
        const label = hasError
          ? "Call failed"
          : connecting
            ? "Connecting…"
            : ending
              ? "Ending…"
              : active
                ? isSpeaking ? "Sophia speaking" : "Connected · Listening"
                : "Ready";
        const dot = hasError
          ? "bg-red-500"
          : connecting || ending
            ? "bg-amber-500 animate-pulse"
            : active
              ? (isSpeaking ? "bg-emerald-500 animate-pulse" : "bg-sky-500 animate-pulse")
              : "bg-ink/30";
        return (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center gap-2 rounded-full border border-ink/10 bg-linen px-3 py-1.5 text-xs shadow-sm"
          >
            <span className="relative inline-flex h-2.5 w-2.5" aria-hidden>
              <span className={`absolute inset-0 rounded-full opacity-60 ${dot}`} />
              <span className={`relative inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
            </span>
            <span className="font-mono-label text-ink">{label}</span>
          </div>
        );
      })()}

      <button
        type="button"
        onClick={active ? stop : start}
        disabled={connecting || status === "ending"}
        aria-label={active ? "End call with Sophia" : "Talk to Sophia"}
        className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium shadow-lg transition disabled:opacity-70 ${
          active
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-ink text-linen hover:bg-ink/90"
        }`}
      >
        {connecting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Connecting…
          </>
        ) : active ? (
          <>
            <PhoneOff className="h-4 w-4" />
            End call
          </>
        ) : (
          <>
            <Phone className="h-4 w-4" />
            Talk to Sophia
          </>
        )}
      </button>
    </div>
  );
}
