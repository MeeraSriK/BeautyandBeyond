import { useEffect, useRef, useState, type ReactNode } from "react";
import { BUSINESS } from "@/lib/business-facts";
import assistantFace from "@/assets/assistant-face.png";

type Msg = { role: "user" | "assistant"; content: string };

const OPENING: Msg = {
  role: "assistant",
  content:
    "Hi — I'm Sonia's Studio Assistant. Ask me about hours, services or how to book. For real appointments, call or text Sonia on " +
    BUSINESS.phoneDisplay + ".",
};

const FAQS: { label: string; question: string; answer: ReactNode }[] = [
  {
    label: "Opening hours",
    question: "What are your opening hours?",
    answer:
      "Mon 10–4:30 · Tue/Wed 10–5:30 · Thu 10–7 · Fri/Sat 10–5:30 · Sun closed. All visits are by appointment — call or text " +
      BUSINESS.phoneDisplay + " to book a time.",
  },
  {
    label: "Where are you?",
    question: "Where is the studio located?",
    answer:
      "Inside Lexyor Beauty Centre at 1/302 Camden Valley Way, Narellan NSW 2567. One quiet treatment room, one client at a time.",
  },
  {
    label: "Treatments offered",
    question: "What treatments do you offer?",
    answer:
      "Facials (with full head & scalp treatment), lymphatic massage, and brows & lashes — threading, waxing and tinting. Every session begins with a short consultation.",
  },
  {
    label: "Pricing",
    question: "How does pricing work?",
    answer: (
      <>
        Prices below match Sonia's{" "}
        <a
          href={BUSINESS.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-thread underline hover:no-underline"
        >
          Square booking form
        </a>
        . All prices in AUD.
        <div className="mt-3 space-y-3 text-sm">
          <div>
            <div className="font-medium">Threading & waxing (face)</div>
            <ul className="mt-1 space-y-0.5">
              <li>Eyebrow threading / wax — $20</li>
              <li>Upper lip threading / wax — $10</li>
              <li>Chin threading / wax — $10</li>
              <li>Forehead threading / wax — $10</li>
              <li>Nostrils waxing — $15</li>
              <li>Sideburns threading / wax — $20</li>
              <li>Full face wax (incl. brows) — $49</li>
              <li>Full face threading (incl. brows) — $59</li>
            </ul>
          </div>
          <div>
            <div className="font-medium">Body waxing</div>
            <ul className="mt-1 space-y-0.5">
              <li>Under arms — $20</li>
              <li>Half arm — $25 · Half upper arms — $30 · Full arms — $40</li>
              <li>Shoulder — $20</li>
              <li>Half legs — $30 · Full legs — $60</li>
              <li>Bikini line — $30 · Brazilian — $60</li>
              <li>Stomach — $20 · Back — $40</li>
              <li>Full body (excl. Brazilian) — $120</li>
            </ul>
          </div>
          <div>
            <div className="font-medium">Brows & lashes</div>
            <ul className="mt-1 space-y-0.5">
              <li>Eyebrow tint — $20 · Eyebrow henna — $35</li>
              <li>Eyelash tint — $20</li>
              <li>Eyebrow tint & shaping — $35</li>
              <li>Eyebrow henna & shaping — $49</li>
              <li>Eyelash & brow tint — $35</li>
              <li>Eyebrow tint, shaping & lash tint — $50</li>
              <li>Lash lift — $70 · Lash lift & tint — $85</li>
              <li>Brow lamination — $70 · Brow lamination & tint — $85</li>
              <li>Lash removal — $25 · Lash model — $50</li>
            </ul>
          </div>
          <div>
            <div className="font-medium">Facials</div>
            <ul className="mt-1 space-y-0.5">
              <li>Express facial — $50</li>
              <li>Express peel facial — from $75</li>
              <li>Classic relaxation facial — $100</li>
              <li>Deep cleansing facial — $120</li>
              <li>Anti-ageing facial — $120</li>
              <li>Hydrating glow facial — $120</li>
              <li>Vitamin C facial — $150</li>
              <li>Back facial — $90</li>
            </ul>
          </div>
          <div>
            <div className="font-medium">Massage & body</div>
            <ul className="mt-1 space-y-0.5">
              <li>Head, neck & shoulder massage — $50</li>
              <li>Indian head massage — $50</li>
              <li>Back massage — $50 · Half leg massage — $50</li>
              <li>Gua sha drainage massage — $65</li>
              <li>Foot reflexology — $65</li>
              <li>Swedish relaxation full body massage — $90</li>
              <li>Lymphatic drainage body massage — $120</li>
              <li>Hot stone massage — $139</li>
              <li>Back scrub, massage & mask — $65</li>
              <li>Arm scrub, massage & mask — $65</li>
              <li>Half leg scrub, massage & mask — $75</li>
              <li>Body polishing (scrub, massage, mask) — $250</li>
            </ul>
          </div>
          <div>
            <div className="font-medium">Other</div>
            <ul className="mt-1 space-y-0.5">
              <li>Laser hair removal — price varies</li>
              <li>Consultation — price varies</li>
            </ul>
          </div>
        </div>
        <div className="mt-3">
          Call or text {BUSINESS.phoneDisplay} if you'd like help picking the right service.
        </div>
      </>
    ),
  },
  {
    label: "How to book",
    question: "How do I book an appointment?",
    answer:
      "Call or text Sonia directly on " + BUSINESS.phoneDisplay +
      ". She'll find a time that suits and go over what you'd like — this assistant can't hold appointments.",
  },
  {
    label: "First visit",
    question: "What should I expect on my first visit?",
    answer:
      "A short chat first — about your skin, your week, and what you're hoping for. The treatment follows the conversation, never the other way around. Please arrive a few minutes early.",
  },
];

// Minimal SpeechRecognition typing (browsers vary)
type SR = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SR;
    webkitSpeechRecognition?: new () => SR;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([OPENING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);

  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const recognitionRef = useRef<SR | null>(null);

  useEffect(() => {
    setVoiceSupported(!!getSpeechRecognition() && typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Auto-scroll the opened FAQ answer into view (nice on mobile)
  useEffect(() => {
    if (!openFaq) return;
    const id = `faq-panel-${openFaq.replace(/\s+/g, "-")}`;
    // wait a frame for the panel to mount
    const raf = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    return () => cancelAnimationFrame(raf);
  }, [openFaq]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  const speak = (text: string) => {
    if (!voiceOn || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1;
    u.pitch = 1;
    u.lang = "en-AU";
    window.speechSynthesis.speak(u);
  };

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || pending) return;
    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setPending(true);

    try {
      const res = await fetch("/api/public/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) {
        const errText =
          res.status === 402
            ? "The assistant is out of credits right now — please call " + BUSINESS.phoneDisplay + " and Sonia will help you directly."
            : res.status === 429
            ? "I'm getting a lot of questions right now — try again in a moment, or call " + BUSINESS.phoneDisplay + "."
            : "I couldn't reach the assistant. Please call " + BUSINESS.phoneDisplay + ".";
        setMessages([...next, { role: "assistant", content: errText }]);
        setPending(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      // seed empty assistant message
      setMessages([...next, { role: "assistant", content: "" }]);
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }
      speak(acc);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: "I couldn't reach the assistant. Please call " + BUSINESS.phoneDisplay + ".",
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  const startListening = () => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-AU";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      void send(transcript);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    setVoiceOn(true);
    try { rec.start(); } catch { setListening(false); }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch { /* ignore */ }
    setListening(false);
  };

  const toggleVoice = () => {
    if (!voiceSupported) return;
    if (listening) { stopListening(); return; }
    if (voiceOn) {
      // turning voice off — silence any speech
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
      setVoiceOn(false);
      return;
    }
    startListening();
  };

  return (
    <>
      {/* Bubble */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 h-16 w-16 rounded-full bg-linen text-thread shadow-xl overflow-hidden ring-2 ring-thread/60 hover:ring-thread transition-transform hover:scale-105 animate-pulse-thread flex items-center justify-center"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <img
            src={assistantFace}
            alt=""
            width={64}
            height={64}
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Sonia's Studio Assistant"
          className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-sm h-[32rem] max-h-[calc(100vh-8rem)] bg-linen border border-ink/25 shadow-2xl rounded-md flex flex-col animate-chat-in overflow-hidden"
        >
          {/* Header */}
          <header className="px-4 py-3 border-b border-ink/15 bg-linen-2 flex items-center justify-between">
            <div>
              <p className="font-mono-label text-thread">Studio Assistant</p>
              <h2 className="font-display text-lg leading-tight">Sonia's Studio Assistant</h2>
            </div>
            <button
              onClick={toggleVoice}
              disabled={!voiceSupported}
              aria-pressed={voiceOn}
              aria-label={
                !voiceSupported
                  ? "Voice unavailable in this browser"
                  : listening
                  ? "Stop listening"
                  : voiceOn
                  ? "Turn voice off"
                  : "Talk to the assistant"
              }
              title={!voiceSupported ? "Voice unavailable in this browser" : "Voice mode"}
              className={`h-9 w-9 rounded-full flex items-center justify-center border transition ${
                listening
                  ? "bg-thread text-linen border-thread animate-pulse"
                  : voiceOn
                  ? "bg-moss text-linen border-moss"
                  : "border-ink/30 hover:bg-ink hover:text-linen"
              } disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="6" height="12" rx="3"/>
                <path d="M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8"/>
              </svg>
            </button>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 text-sm">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                {m.role === "assistant" ? (
                  <div className="max-w-[90%]">
                    <p className="font-mono-label text-thread/70 mb-1">Sonia's Studio</p>
                    <p className="whitespace-pre-wrap leading-relaxed text-ink">
                      {m.content || <span className="opacity-50">…</span>}
                    </p>
                  </div>
                ) : (
                  <div className="max-w-[85%] rounded-md bg-ink text-linen px-3 py-2 leading-relaxed">
                    {m.content}
                  </div>
                )}
              </div>
            ))}
            {pending && messages[messages.length - 1]?.role === "user" && (
              <div className="text-xs text-muted-foreground italic">thinking…</div>
            )}
          </div>

          {/* FAQ accordion — show while the conversation hasn't started yet */}
          {messages.length <= 1 && !pending && (
            <div className="px-4 pb-3 pt-2 border-t border-ink/10 bg-linen max-h-56 overflow-y-auto">
              <p className="font-mono-label text-thread/70 mb-2">Quick questions</p>
              <ul className="space-y-1.5">
                {FAQS.map((f) => {
                  const isOpen = openFaq === f.label;
                  const panelId = `faq-panel-${f.label.replace(/\s+/g, "-")}`;
                  return (
                    <li key={f.label} className="border border-thread/25 rounded-md overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : f.label)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className={`w-full flex items-center justify-between gap-2 text-xs px-3 py-2 text-left transition ${
                          isOpen ? "bg-thread text-linen" : "text-thread hover:bg-thread/10"
                        }`}
                      >
                        <span>{f.label}</span>
                        <span aria-hidden className={`transition-transform ${isOpen ? "rotate-180" : ""}`}>▾</span>
                      </button>
                      {isOpen && (
                        <div id={panelId} className="px-3 py-3 bg-linen-2 border-t border-thread/20 space-y-2 animate-chat-in">
                          <p className="text-sm leading-relaxed text-ink whitespace-pre-wrap">{f.answer}</p>
                          <button
                            type="button"
                            onClick={() => { setOpenFaq(null); void send(f.question); }}
                            className="text-[10px] font-mono uppercase tracking-widest text-thread hover:underline"
                          >
                            Ask assistant for more →
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Composer */}
          <form
            onSubmit={(e) => { e.preventDefault(); void send(input); }}
            className="border-t border-ink/15 p-3 bg-linen"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                placeholder={listening ? "Listening…" : "Ask about hours, services, or booking…"}
                rows={1}
                className="flex-1 resize-none bg-linen-2 border border-ink/15 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-thread max-h-28"
              />
              <button
                type="submit"
                disabled={pending || !input.trim()}
                aria-label="Send message"
                className="h-9 w-9 rounded-md bg-thread text-linen flex items-center justify-center hover:opacity-90 disabled:opacity-40"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
              </button>
            </div>
            <p className="mt-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Info only · bookings via {BUSINESS.phoneDisplay}
            </p>
          </form>
        </div>
      )}
    </>
  );
}
