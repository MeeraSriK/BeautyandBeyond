import { createFileRoute, Link } from "@tanstack/react-router";
import { VapiWidget } from "@/components/VapiWidget";
import { Mic, ArrowLeft, Monitor, Smartphone } from "lucide-react";

export const Route = createFileRoute("/voice-test")({
  component: VoiceTestPage,
  head: () => ({
    meta: [
      { title: "Voice test — Beauty & Beyond by Sonia" },
      { name: "description", content: "Quickly verify the Sophia voice assistant works on your device." },
      { property: "og:title", content: "Voice test — Beauty & Beyond by Sonia" },
      { property: "og:description", content: "Quickly verify the Sophia voice assistant works on your device." },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "/voice-test" }],
  }),
});

function VoiceTestPage() {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto max-w-2xl px-5 py-8 md:py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-ink/70 hover:text-ink transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>

        <h1 className="mt-6 font-display text-3xl md:text-5xl tracking-tight">
          Voice test
        </h1>
        <p className="mt-3 text-ink/70 max-w-lg">
          Tap the button below to start a call with Sophia. This page is handy
          for checking microphone permissions and call state on both mobile
          and desktop.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-ink/10 bg-linen p-5">
            <div className="flex items-center gap-3 text-ink">
              <Smartphone className="h-5 w-5" />
              <h2 className="font-mono-label text-sm uppercase tracking-wide">Mobile</h2>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-ink/70 list-disc pl-4">
              <li>Use Safari (iOS) or Chrome (Android)</li>
              <li>Allow microphone when prompted</li>
              <li>Keep the page visible during the call</li>
            </ul>
          </div>

          <div className="rounded-xl border border-ink/10 bg-linen p-5">
            <div className="flex items-center gap-3 text-ink">
              <Monitor className="h-5 w-5" />
              <h2 className="font-mono-label text-sm uppercase tracking-wide">Desktop</h2>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-ink/70 list-disc pl-4">
              <li>Chrome, Edge, or Firefox work best</li>
              <li>Check the mic icon in the address bar</li>
              <li>Speakers or headphones required</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-ink/10 bg-plum/5 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink text-linen">
            <Mic className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl">Ready to talk?</h2>
          <p className="mt-2 text-sm text-ink/70">
            The floating button in the bottom-right corner controls the call.
          </p>
        </div>
      </div>

      <VapiWidget />
    </div>
  );
}
