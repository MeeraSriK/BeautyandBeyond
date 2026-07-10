import { useCallback, useEffect, useState } from "react";
import { useConversation } from "@elevenlabs/react";
import { useServerFn } from "@tanstack/react-start";
import { Mic, PhoneOff, Loader2, AudioLines } from "lucide-react";
import { BUSINESS } from "@/lib/business-facts";
import { getSophiaVoiceToken } from "@/lib/elevenlabs.functions";


export function VoiceAgent() {
  const [open, setOpen] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = useServerFn(getSophiaVoiceToken);

  const conversation = useConversation({
    onConnect: () => setError(null),
    onDisconnect: () => setConnecting(false),
    onError: (e) => {
      const msg = typeof e === "string" ? e : (e as { message?: string })?.message ?? "Couldn't reach Sophia. Please try again.";
      setError(msg);
      setConnecting(false);
    },
  });

  const connected = conversation.status === "connected";
  const isSpeaking = conversation.isSpeaking;

  const start = useCallback(async () => {
    setError(null);
    setConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { token } = await fetchToken();
      await conversation.startSession({
        conversationToken: token,
        connectionType: "webrtc",
      });
    } catch (e) {
      const msg =
        (e as Error)?.name === "NotAllowedError"
          ? "Microphone access is needed to talk with Sophia. Please allow it and try again."
          : (e as Error)?.message ?? "Couldn't start the voice chat.";
      setError(msg);
    } finally {
      setConnecting(false);
    }
  }, [conversation, fetchToken]);


  const stop = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  // End the session if the panel is closed while connected
  useEffect(() => {
    if (!open && connected) {
      void conversation.endSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      {/* Floating launcher — sits above the text chat FAB */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close voice assistant" : "Talk to Sophia, the voice assistant"}
        aria-expanded={open}
        className="fixed bottom-24 right-5 md:bottom-28 md:right-8 z-40 group flex items-center gap-2 pl-4 pr-5 py-3 rounded-full bg-magenta text-paper border border-ink shadow-lg hover:bg-ink hover:text-marigold transition"
        style={{
          boxShadow:
            "0 20px 40px -18px color-mix(in oklab, var(--ink) 55%, transparent), 0 0 0 1px color-mix(in oklab, var(--marigold) 40%, transparent)",
        }}
      >
        <span className="relative flex items-center justify-center w-6 h-6">
          <Mic size={18} strokeWidth={1.75} />
          {connected && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-marigold animate-pulse" />
          )}
        </span>
        <span className="font-mono-label text-xs uppercase tracking-wider">
          {connected ? "On call · Sophia" : "Talk to Sophia"}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Sophia voice assistant"
          className="fixed bottom-40 right-5 md:bottom-44 md:right-8 z-40 w-[min(92vw,340px)] bg-paper border border-ink rounded-2xl overflow-hidden"
          style={{
            boxShadow:
              "0 30px 60px -30px color-mix(in oklab, var(--ink) 65%, transparent), 0 0 0 1px color-mix(in oklab, var(--marigold) 30%, transparent)",
          }}
        >
          <div className="bg-plum text-paper px-5 py-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full bg-marigold text-ink flex items-center justify-center font-serif-italic text-lg"
              aria-hidden
            >
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono-label text-marigold text-[10px] uppercase tracking-wider">
                Voice assistant
              </p>
              <p className="font-serif-italic text-lg leading-tight truncate">Sophia</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="text-paper/70 hover:text-marigold text-lg leading-none px-1"
            >
              ×
            </button>
          </div>

          <div className="px-5 py-5 space-y-4">
            <p className="text-sm text-ink/75 leading-relaxed">
              Sophia can answer questions about services, hours and how to book — out loud.
              She can't hold appointments; call {BUSINESS.phoneDisplay} for that.
            </p>

            {/* Status pill */}
            <div className="flex items-center gap-2 text-xs font-mono-label">
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  connected ? "bg-marigold animate-pulse" : "bg-ink/30"
                }`}
                aria-hidden
              />
              <span className="text-ink/70">
                {connecting
                  ? "Connecting…"
                  : connected
                  ? isSpeaking
                    ? "Sophia is speaking"
                    : "Listening…"
                  : "Idle"}
              </span>
              {connected && isSpeaking && (
                <AudioLines size={14} strokeWidth={2} className="text-magenta" />
              )}
            </div>

            {error && (
              <p role="alert" className="text-xs text-magenta bg-magenta/5 border border-magenta/30 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            {/* Controls */}
            {!connected ? (
              <button
                type="button"
                onClick={start}
                disabled={connecting}
                className="w-full inline-flex items-center justify-center gap-2 bg-marigold text-ink font-mono-label text-sm uppercase tracking-wider px-5 py-3 rounded-full border border-ink hover:bg-ink hover:text-marigold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {connecting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Connecting
                  </>
                ) : (
                  <>
                    <Mic size={16} strokeWidth={1.75} /> Start voice chat
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={stop}
                className="w-full inline-flex items-center justify-center gap-2 bg-ink text-paper font-mono-label text-sm uppercase tracking-wider px-5 py-3 rounded-full border border-ink hover:bg-magenta transition"
              >
                <PhoneOff size={16} strokeWidth={1.75} /> End call
              </button>
            )}

            <p className="text-[11px] text-ink/50 text-center">
              Uses your microphone. Powered by ElevenLabs.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
