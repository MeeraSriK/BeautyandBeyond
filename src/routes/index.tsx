import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { Facebook, Instagram, Mail, ChevronLeft, ChevronRight } from "lucide-react";
import { BUSINESS } from "@/lib/business-facts";
import { getRequestOrigin } from "@/lib/origin.functions";
import { ThreadSpine } from "@/components/ThreadSpine";
import { ChatWidget } from "@/components/ChatWidget";
import { VapiWidget } from "@/components/VapiWidget";
import logoAsset from "@/assets/logo.png.asset.json";
import studio1 from "@/assets/studio-1.jpg.asset.json";
import studio2 from "@/assets/studio-2.jpg.asset.json";
import studio3 from "@/assets/studio-3.jpg.asset.json";
import studio4 from "@/assets/studio-4.jpg.asset.json";
import studio5 from "@/assets/studio-5.jpg.asset.json";
import studio6 from "@/assets/studio-6.jpg.asset.json";
import studio7 from "@/assets/studio-7.jpg.asset.json";

const STUDIO_PHOTOS = [studio1, studio2, studio3, studio4, studio5, studio6, studio7];

function StudioCarousel() {
  const [i, setI] = useState(0);
  const n = STUDIO_PHOTOS.length;
  const go = (d: number) => setI((p) => (p + d + n) % n);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % n), 5000);
    return () => clearInterval(t);
  }, [n]);
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 overflow-hidden">
        {STUDIO_PHOTOS.map((p, idx) => (
          <img
            key={p.asset_id}
            src={p.url}
            alt={`Studio photo ${idx + 1}`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
            style={{ opacity: idx === i ? 1 : 0 }}
            loading={idx === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>
      <button
        type="button"
        aria-label="Previous photo"
        onClick={() => go(-1)}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-paper/85 border border-ink text-ink hover:bg-paper z-10"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        aria-label="Next photo"
        onClick={() => go(1)}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-paper/85 border border-ink text-ink hover:bg-paper z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {STUDIO_PHOTOS.map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to photo ${idx + 1}`}
            onClick={() => setI(idx)}
            className="w-2 h-2 rounded-full border border-ink transition-all"
            style={{ background: idx === i ? "var(--ink)" : "transparent" }}
          />
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/")({
  component: Home,
  loader: async () => {
    const origin = await getRequestOrigin();
    return { origin };
  },
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? "";
    const imageMeta = origin
      ? [
          { property: "og:image", content: `${origin}/og-image.jpg` },
          { property: "og:image:width", content: "1200" },
          { property: "og:image:height", content: "630" },
          { property: "og:image:type", content: "image/jpeg" },
          { property: "twitter:image", content: `${origin}/og-image.jpg` },
        ]
      : [];
    return {
      meta: [{ property: "og:url", content: "/" }, ...imageMeta],
      links: [{ rel: "canonical", href: "/" }],
    };
  },
});

function Home() {
  useReveal();
  return (
    <div className="relative min-h-dvh bg-paper text-ink overflow-x-hidden">
      <ThreadSpine />
      <div className="relative z-10">
        <Nav />
        <main id="main">
          <Hero />
          <Marquee />
          <Services />
          <TheRoom />
          <Treatments />
          <Words />
          <Visit />
          <FooterCta />
        </main>
      </div>
      <VapiWidget className="bottom-24 right-5" />
      <ChatWidget />
    </div>
  );
}

/* --- Scroll reveal --- */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* --- Bloom SVG (soft, painted lily — filled petals, no harsh outlines) --- */
type BloomVariant = "full" | "wild" | "bud";

function Bloom({
  className = "",
  stroke = "currentColor",
  variant = "full",
}: {
  className?: string;
  /** Accent tint — component uses currentColor so pass via text-* utility */
  stroke?: string;
  variant?: BloomVariant;
}) {
  // Unique gradient IDs so multiple lilies on the page don't collide
  const uid = useId().replace(/:/g, "");
  const gPetal = `p-${uid}`;
  const gPetalSoft = `ps-${uid}`;
  const gCenter = `c-${uid}`;
  const gAnther = `a-${uid}`;
  const gLeaf = `lf-${uid}`;

  // A single lily petal — elongated almond, pointing UP from (100,100)
  const petal =
    "M100 100 C 78 82, 78 46, 100 10 C 122 46, 122 82, 100 100 Z";
  // Slim inner highlight to give petal dimension
  const petalHighlight =
    "M100 96 C 92 82, 92 52, 100 22 C 108 52, 108 82, 100 96 Z";
  // Central vein
  const petalVein = "M100 96 Q100 60 100 20";

  // Six-petal count for lily; two layers offset 60° for that classic star-lily look
  const backRot = [30, 90, 150, 210, 270, 330];
  const frontRot = [0, 60, 120, 180, 240, 300];

  // Wild = stargazer with visible speckles; bud = fewer/tighter petals
  const showSpeckles = variant === "wild";
  const isBud = variant === "bud";

  // Bud: only three tightly-closed petals, smaller reach, no stamens
  const budPetal =
    "M100 100 C 84 84, 84 56, 100 34 C 116 56, 116 84, 100 100 Z";

  // Long, drooping leaf hanging below the bloom
  const leaf =
    "M100 130 C 70 150, 50 178, 46 200 C 62 188, 82 172, 100 150 Z";
  const leafVein = "M100 132 Q78 168 52 196";

  // Stamens — thin filament curving out with an oval anther tip
  const filament = (dx: number, tipX: number, tipY: number) =>
    `M100 108 C ${100 + dx * 0.4} ${108 - 6}, ${100 + dx * 0.8} ${tipY + 14}, ${tipX} ${tipY}`;

  const stamens = [
    { fx: -18, tx: 82, ty: 74 },
    { fx: -10, tx: 90, ty: 66 },
    { fx: 0,   tx: 100, ty: 62 },
    { fx: 10,  tx: 110, ty: 66 },
    { fx: 18,  tx: 118, ty: 74 },
    { fx: 6,   tx: 106, ty: 80 },
  ];

  return (
    <svg viewBox="0 0 200 210" className={className} aria-hidden>
      <defs>
        {/* Petal fill — soft cream/blush at base, deeper toward the tip edge */}
        <radialGradient id={gPetal} cx="50%" cy="95%" r="90%">
          <stop offset="0%"  stopColor="currentColor" stopOpacity="0.08" />
          <stop offset="55%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.75" />
        </radialGradient>
        {/* Inner highlight — subtle brighter core down petal length */}
        <linearGradient id={gPetalSoft} x1="50%" y1="100%" x2="50%" y2="0%">
          <stop offset="0%"  stopColor="currentColor" stopOpacity="0" />
          <stop offset="60%" stopColor="currentColor" stopOpacity="0.15" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        {/* Center throat */}
        <radialGradient id={gCenter} cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="currentColor" stopOpacity="0.9" />
          <stop offset="70%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
        {/* Anther (pollen tip) */}
        <radialGradient id={gAnther} cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.6" />
        </radialGradient>
        {/* Leaf fill */}
        <linearGradient id={gLeaf} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"  stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.18" />
        </linearGradient>
      </defs>

      <g stroke="none">
        {/* Leaves hanging behind the bloom */}
        {!isBud && (
          <g className="animate-bloom-leaf">
            {[-28, 28].map((r) => (
              <g key={`leaf-${r}`} transform={`rotate(${r} 100 130)`}>
                <path d={leaf} fill={`url(#${gLeaf})`} />
                <path
                  d={leafVein}
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity="0.35"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
        )}

        {isBud ? (
          <>
            {/* Bud: three overlapping closed petals */}
            <g className="animate-bloom-outer">
              {[-14, 0, 14].map((r) => (
                <g key={`bud-${r}`} transform={`rotate(${r} 100 100)`}>
                  <path d={budPetal} fill={`url(#${gPetal})`} />
                  <path d={budPetal} fill={`url(#${gPetalSoft})`} />
                </g>
              ))}
            </g>
            {/* small sepal cup at base */}
            <ellipse cx="100" cy="102" rx="14" ry="6" fill="currentColor" opacity="0.35" />
          </>
        ) : (
          <>
            {/* Back layer of petals */}
            <g className="animate-bloom-outer">
              {backRot.map((r) => (
                <g key={`back-${r}`} transform={`rotate(${r} 100 100)`}>
                  <path d={petal} fill={`url(#${gPetal})`} />
                  <path d={petalHighlight} fill={`url(#${gPetalSoft})`} />
                </g>
              ))}
            </g>

            {/* Front layer, offset — creates the classic 6-point lily */}
            <g className="animate-bloom-mid">
              {frontRot.map((r) => (
                <g key={`front-${r}`} transform={`rotate(${r} 100 100)`}>
                  <path d={petal} fill={`url(#${gPetal})`} />
                  <path d={petalHighlight} fill={`url(#${gPetalSoft})`} />
                  <path
                    d={petalVein}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.28"
                    strokeWidth="0.7"
                    strokeLinecap="round"
                  />
                  {showSpeckles && (
                    <g fill="currentColor" opacity="0.55">
                      <circle cx="96" cy="72" r="0.9" />
                      <circle cx="104" cy="66" r="0.8" />
                      <circle cx="98" cy="58" r="0.7" />
                      <circle cx="102" cy="82" r="0.9" />
                      <circle cx="94" cy="88" r="0.7" />
                    </g>
                  )}
                </g>
              ))}
            </g>

            {/* Warm throat */}
            <g className="animate-bloom-inner">
              <circle cx="100" cy="100" r="18" fill={`url(#${gCenter})`} />
            </g>

            {/* Stamens with anther tips */}
            <g className="animate-bloom-center">
              {stamens.map((s, i) => (
                <g key={`st-${i}`}>
                  <path
                    d={filament(s.fx, s.tx, s.ty)}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.6"
                    strokeWidth="0.9"
                    strokeLinecap="round"
                  />
                  <ellipse
                    cx={s.tx}
                    cy={s.ty}
                    rx="2.2"
                    ry="1.2"
                    fill={`url(#${gAnther})`}
                    transform={`rotate(${(s.fx) * 1.5} ${s.tx} ${s.ty})`}
                  />
                </g>
              ))}
              {/* pistil */}
              <circle cx="100" cy="100" r="2.4" fill="currentColor" />
            </g>
          </>
        )}
      </g>
    </svg>
  );
}

/* --- WhatsApp icon (not in main lucide-react set) --- */
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.746.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

/* --- Nav --- */
function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-paper/85 border-b border-ink/10">
      <div className="mx-auto max-w-6xl px-4 sm:px-5 md:px-8 py-3 sm:py-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-4">
        <a href="#top" className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src={logoAsset.url}
            alt="Beauty & Beyond by Sonia logo"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shrink-0"
          />
          <span className="flex flex-col sm:flex-row sm:flex-wrap sm:items-baseline gap-0 sm:gap-x-2 min-w-0">
            <span className="flex items-baseline gap-x-1.5 sm:gap-2">
              <span className="font-serif-italic text-lg sm:text-2xl leading-none">Beauty</span>
              <span className="font-mono-label text-ink/70 text-xs sm:text-sm">&amp;</span>
              <span className="font-serif-italic text-lg sm:text-2xl leading-none">Beyond</span>
            </span>
            <span className="font-mono-label text-marigold text-sm leading-none mt-1 sm:mt-0">by Sonia</span>
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm">
          <a href="#services" className="hover:text-magenta transition">Services</a>
          <a href="#room" className="hover:text-magenta transition">The Room</a>
          <a href="#treatments" className="hover:text-magenta transition">Treatments</a>
          <Link to="/gallery" className="hover:text-magenta transition">Gallery</Link>
          <a href="#words" className="hover:text-magenta transition">Words</a>
          <a href="#visit" className="hover:text-magenta transition">Visit</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1 sm:gap-2">
            <a
              href={BUSINESS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink/15 text-ink/80 hover:bg-ink hover:text-paper hover:border-ink transition"
            >
              <Instagram size={18} strokeWidth={1.5} />
            </a>
            <a
              href={BUSINESS.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink/15 text-ink/80 hover:bg-ink hover:text-paper hover:border-ink transition"
            >
              <Facebook size={18} strokeWidth={1.5} />
            </a>
            <a
              href={BUSINESS.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink/15 text-ink/80 hover:bg-ink hover:text-paper hover:border-ink transition"
            >
              <WhatsAppIcon size={18} />
            </a>
            <a
              href={`mailto:${BUSINESS.email}`}
              aria-label="Email"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink/15 text-ink/80 hover:bg-ink hover:text-paper hover:border-ink transition"
            >
              <Mail size={18} strokeWidth={1.5} />
            </a>
          </div>
          <a
            href={`tel:${BUSINESS.phoneTel}`}
            aria-label="Book by Call"
            className="sticker transition-transform whitespace-nowrap text-xs sm:text-sm px-3 py-2 sm:px-4"
          >
            <span aria-hidden>☎</span>
            <span className="hidden sm:inline"> Book by Call</span>
            <span className="sm:hidden"> Call</span>
          </a>
        </div>
      </div>
    </header>
  );
}

/* --- Hero --- */
function Hero() {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-plum text-paper px-5 md:px-8 pt-20 md:pt-28 pb-24 md:pb-40 grain"
    >
      {/* floating bloom */}
      <Bloom
        variant="wild"
        className="pointer-events-none absolute -right-24 -top-24 w-[420px] h-[420px] text-marigold/40 animate-bloom-spin hidden md:block"
        stroke="currentColor"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-0 w-[300px] h-[300px] rounded-full blur-3xl"
        style={{ background: "radial-gradient(circle, var(--magenta) 0%, transparent 70%)", opacity: 0.55 }}
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-center gap-4 reveal">
          <span className="sticker">★ {BUSINESS.rating} · {BUSINESS.reviews} reviews</span>
          <span className="font-mono-label text-paper/60 hidden sm:inline">
            Narellan · NSW · by appointment
          </span>
        </div>

        <h1 className="mt-10 font-display text-[clamp(3rem,11vw,9rem)] leading-[0.86] tracking-tight text-balance reveal">
          <span className="block">Unhurried</span>
          <span className="block font-serif-italic text-marigold wavy">care,</span>
          <span className="block text-outline text-blush">one client</span>
          <span className="block">at a <span className="font-serif-italic text-blush">time.</span></span>
        </h1>

        <div className="mt-12 grid md:grid-cols-12 gap-8 items-end reveal">
          <p className="md:col-span-6 text-lg leading-relaxed text-paper/85 max-w-xl">
            A single treatment room in Narellan, run by Sonia. Facials, massage
            and brows — priced after a short chat, because your skin, your body
            and your week are never the same as anyone else's.
          </p>
          <div className="md:col-span-6 flex flex-wrap items-center gap-3 md:justify-end">
            <a
              href={BUSINESS.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-marigold text-ink px-7 py-4 text-sm font-mono-label hover:bg-paper transition"
              style={{ boxShadow: "0 20px 40px -20px color-mix(in oklab, var(--ink) 45%, transparent), 0 0 0 1px color-mix(in oklab, var(--marigold) 30%, transparent)" }}
            >
              Book online ↗
            </a>
            <a
              href={`tel:${BUSINESS.phoneTel}`}
              className="inline-flex items-center gap-3 bg-ink text-marigold border border-marigold/60 px-7 py-4 text-sm font-mono-label hover:bg-marigold hover:text-ink transition"
            >
              <span aria-hidden>☎</span> Call {BUSINESS.phoneDisplay}
            </a>
            <a
              href="#treatments"
              className="inline-flex items-center gap-2 border border-paper/60 text-paper px-6 py-4 text-sm font-mono-label hover:bg-paper hover:text-ink transition"
            >
              See treatments →
            </a>
          </div>
        </div>

        <div className="mt-20 grid grid-cols-3 gap-6 md:gap-12 max-w-3xl reveal">
          {[
            ["01", "One room"],
            ["02", "One client at a time"],
            ["03", "Every visit begins with a chat"],
          ].map(([a, b]) => (
            <div key={a} className="border-t border-paper/25 pt-4">
              <p className="font-serif-italic text-4xl text-marigold leading-none">{a}</p>
              <p className="mt-3 font-display text-base leading-tight text-paper/90">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Marquee --- */
function Marquee() {
  const items = ["Facials", "✿", "Lymphatic Massage", "✿", "Brow Threading", "✿", "Lash Tint", "✿", "Waxing", "✿", "Consultation-first", "✿"];
  const row = [...items, ...items];
  return (
    <div
      aria-hidden
      className="relative border-y border-ink/25 bg-ink text-marigold overflow-hidden py-4"
    >
      <div className="flex gap-10 whitespace-nowrap animate-marquee font-display text-3xl md:text-5xl leading-none">
        {row.map((t, i) => (
          <span key={i} className={i % 2 === 0 ? "" : "text-magenta font-serif-italic"}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* --- Services (category cards → Square booking) --- */
const SERVICES = [
  {
    tag: "Skin",
    name: "Facials",
    desc: "Consultation-first facials with full head & scalp treatment. Tailored to your skin that day — sensitivity, dryness, congestion, or a quiet reset.",
    // Swap this to the direct Square service URL when available.
    bookUrl: BUSINESS.bookingUrl,
    tint: "var(--marigold)",
    bg: "var(--blush)",
  },
  {
    tag: "Body",
    name: "Massage",
    desc: "Lymphatic drainage and relaxation. Pressure and focus calibrated after a short chat about how the week has landed in your body.",
    bookUrl: BUSINESS.bookingUrl,
    tint: "var(--magenta)",
    bg: "var(--pistachio)",
  },
  {
    tag: "Face",
    name: "Brows & Lashes",
    desc: "Threading, waxing and tinting — including tricky brow colour-matching many clients only trust Sonia to get right.",
    bookUrl: BUSINESS.bookingUrl,
    tint: "var(--plum)",
    bg: "var(--marigold)",
  },
];

function Services() {
  return (
    <section id="services" className="relative px-5 md:px-8 py-24 md:py-32 bg-paper-2 overflow-hidden">
      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-6 flex-wrap reveal">
          <div>
            <p className="font-mono-label text-magenta">§ Services</p>
            <h2 className="mt-4 font-display text-5xl md:text-7xl leading-[0.9] text-balance">
              Pick a <span className="font-serif-italic text-magenta">room</span> to book.
            </h2>
          </div>
          <p className="max-w-sm text-sm text-ink/70">
            Each card opens Sonia's Square booking. Prefer a chat first? Call or
            text <a href={`tel:${BUSINESS.phoneTel}`} className="underline underline-offset-4 hover:text-magenta">{BUSINESS.phoneDisplay}</a>.
          </p>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-5 md:gap-6">
          {SERVICES.map((s, i) => (
            <a
              key={s.name}
              href={s.bookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Book ${s.name} on Square`}
              className="reveal group relative flex flex-col justify-between p-6 md:p-7 border border-ink bg-paper rounded-md overflow-hidden transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta"
              style={{
                boxShadow:
                  "0 20px 40px -20px color-mix(in oklab, var(--ink) 45%, transparent), 0 0 0 1px color-mix(in oklab, var(--marigold) 30%, transparent)",
              }}
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-16 -top-16 w-56 h-56 rounded-full blur-2xl opacity-70 transition-opacity group-hover:opacity-100"
                style={{ background: `radial-gradient(circle, ${s.bg} 0%, transparent 70%)` }}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span
                    className="sticker"
                    style={{ background: s.bg, color: "var(--ink)" }}
                  >
                    {s.tag}
                  </span>
                  <span
                    className="font-display text-3xl leading-none text-outline"
                    style={{ color: "transparent", WebkitTextStroke: `1.2px ${s.tint}` }}
                  >
                    0{i + 1}
                  </span>
                </div>
                <h3 className="mt-8 font-display text-4xl md:text-5xl leading-[0.95]">
                  {s.name}
                </h3>
                <p className="mt-4 text-ink/75 leading-relaxed text-sm md:text-base">
                  {s.desc}
                </p>
              </div>
              <div className="relative mt-8 flex items-center justify-between pt-5 border-t border-ink/15">
                <span className="font-serif-italic text-lg" style={{ color: s.tint }}>
                  By consultation
                </span>
                <span className="inline-flex items-center gap-2 font-mono-label text-sm text-ink group-hover:text-magenta transition">
                  Book on Square
                  <span aria-hidden className="transition-transform group-hover:translate-x-0.5">↗</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
function TheRoom() {
  return (
    <section id="room" className="relative px-5 md:px-8 py-24 md:py-36">
      <div className="mx-auto max-w-6xl grid md:grid-cols-12 gap-10 md:gap-12 items-center">
        <div className="md:col-span-6 reveal relative mx-auto w-full max-w-md md:max-w-none">
          <div
            className="absolute -inset-3 rounded-lg -z-10"
            style={{ background: "var(--magenta)" }}
            aria-hidden
          />
          <div
            className="aspect-[4/5] w-full bg-blush border border-ink relative overflow-hidden rounded-md"
            style={{ boxShadow: "0 20px 40px -20px color-mix(in oklab, var(--ink) 45%, transparent), 0 0 0 1px color-mix(in oklab, var(--marigold) 30%, transparent)" }}
          >
            <StudioCarousel />
          </div>
        </div>
        <div className="md:col-span-6 reveal">
          <p className="font-mono-label text-magenta">§ The Room</p>
          <h2 className="mt-4 font-display text-5xl md:text-7xl leading-[0.92] text-balance">
            Small <span className="font-serif-italic text-magenta">on</span> purpose.
          </h2>
          <p className="mt-8 text-ink/80 leading-relaxed max-w-lg">
            Inside Lexyor Beauty Centre on Camden Valley Way — one quiet room,
            one guest at a time, no overlap between appointments. It's a room
            built around slowing down, not scaling up.
          </p>
          <figure
            className="mt-10 p-6 bg-paper-2 border border-ink relative rounded-md"
            style={{ boxShadow: "0 20px 40px -20px color-mix(in oklab, var(--ink) 45%, transparent), 0 0 0 1px color-mix(in oklab, var(--marigold) 30%, transparent)" }}
          >
            <span
              className="absolute -top-3 left-6 sticker"
              style={{ background: "var(--pistachio)" }}
            >
              from Sonia
            </span>
            <blockquote className="font-serif-italic text-2xl md:text-3xl leading-snug text-ink">
              &ldquo;Before I touch your skin, I want to know what your week has
              looked like. The treatment follows the conversation — never the
              other way around.&rdquo;
            </blockquote>
          </figure>
        </div>
      </div>
    </section>
  );
}

/* --- Treatments --- */
const TREATMENTS = [
  {
    n: "01",
    name: "Facials",
    desc: "Not just a cleanse. A full head and scalp treatment paired with a face ritual tailored to what your skin needs today — sensitivity, dryness, congestion, or simply an hour of quiet.",
    tint: "var(--marigold)",
  },
  {
    n: "02",
    name: "Massage",
    desc: "Lymphatic drainage and relaxation, always led by a short consultation about pressure, focus areas, and what your body has been carrying.",
    tint: "var(--blush)",
  },
  {
    n: "03",
    name: "Brows & Lashes",
    desc: "Threading, waxing and tinting. Sonia is particularly known for matching harder-to-match brow colours — the reason many clients only trust her with their brows.",
    tint: "var(--pistachio)",
  },
];

function Treatments() {
  return (
    <section
      id="treatments"
      className="relative px-5 md:px-8 py-24 md:py-36 bg-plum text-paper grain overflow-hidden"
    >
      <Bloom
        variant="full"
        className="pointer-events-none absolute -left-32 top-40 w-[520px] h-[520px] text-magenta/25 animate-bloom-spin hidden md:block"
        stroke="currentColor"
      />
      <div className="relative mx-auto max-w-6xl">
        <div className="flex items-end justify-between gap-6 flex-wrap reveal">
          <div>
            <p className="font-mono-label text-marigold">§ Treatments</p>
            <h2 className="mt-4 font-display text-5xl md:text-7xl leading-[0.9]">
              The <span className="font-serif-italic text-marigold">ledger.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-paper/75">
            No published price list — every visit is priced after a short
            consultation, so you only pay for what your session actually needs.
          </p>
        </div>

        <div className="mt-14 space-y-1">
          {TREATMENTS.map((t) => (
            <article
              key={t.n}
              className="reveal group grid md:grid-cols-12 gap-4 md:gap-8 items-start py-8 md:py-10 border-t border-paper/20"
            >
              <div className="md:col-span-2">
                <p
                  className="font-display text-[6rem] md:text-[8rem] leading-[0.8] text-outline"
                  style={{ color: "transparent", WebkitTextStroke: `1.5px ${t.tint}` }}
                >
                  {t.n}
                </p>
              </div>
              <div className="md:col-span-4">
                <h3 className="font-display text-3xl md:text-5xl leading-tight">
                  {t.name}
                </h3>
              </div>
              <div className="md:col-span-4 text-paper/80 leading-relaxed">{t.desc}</div>
              <div className="md:col-span-2 md:text-right">
                <p className="font-serif-italic text-2xl" style={{ color: t.tint }}>
                  By consultation
                </p>
                <a
                  href={`tel:${BUSINESS.phoneTel}`}
                  className="mt-2 inline-block font-mono-label text-paper hover:text-marigold hover:underline underline-offset-4"
                >
                  Enquire →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Words --- */
const THEMES = [
  {
    tag: "Massage & Facials",
    note: "Regulars describe the massages and facials as some of the most relaxing they've had — pressure calibrated to how the day has gone, not to a template.",
    tint: "var(--marigold)",
    rot: "",
  },
  {
    tag: "The Studio",
    note: "Reviewers keep returning to the atmosphere: clean, well-organised, peaceful. A room that feels intentionally quiet, not clinical.",
    tint: "var(--pistachio)",
    rot: "",
  },
  {
    tag: "Brows & Lashes",
    note: "Long-standing brow clients say Sonia is the only person they trust — especially for tricky colour-matching that other places have gotten wrong.",
    tint: "var(--blush)",
    rot: "",
  },
];

function Words() {
  return (
    <section id="words" className="px-5 md:px-8 py-24 md:py-36 relative">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-6 reveal">
          <div>
            <p className="font-mono-label text-magenta">§ Words</p>
            <h2 className="mt-4 font-display text-5xl md:text-7xl leading-[0.9]">
              What clients keep <span className="font-serif-italic text-magenta">saying.</span>
            </h2>
          </div>
          <div
            className="border border-ink bg-paper px-5 py-3 flex items-center gap-4"
            style={{ boxShadow: "0 20px 40px -20px color-mix(in oklab, var(--ink) 45%, transparent), 0 0 0 1px color-mix(in oklab, var(--marigold) 30%, transparent)" }}
          >
            <div className="flex gap-0.5 text-marigold" aria-hidden>
              {[0, 1, 2, 3, 4].map((i) => (
                <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.9 6.9 7.1.6-5.4 4.7 1.7 7.3L12 17.8 5.7 21.5l1.7-7.3L2 9.5l7.1-.6z" />
                </svg>
              ))}
            </div>
            <div className="text-sm">
              <span className="font-display italic text-lg">{BUSINESS.rating}</span>
              <span className="font-mono-label text-ink/60 ml-2">
                {BUSINESS.reviews} Google reviews
              </span>
            </div>
          </div>
        </div>

        <div className="mt-14 grid md:grid-cols-3 gap-6">
          {THEMES.map((t) => (
            <figure
              key={t.tag}
              className={`reveal ${t.rot} bg-paper border border-ink p-6 relative rounded-md transition-transform`}
              style={{ boxShadow: "0 30px 60px -30px color-mix(in oklab, var(--ink) 50%, transparent), inset 0 0 0 1px color-mix(in oklab, var(--marigold) 30%, transparent)" }}
            >
              <p className="font-mono-label text-magenta">{t.tag}</p>
              <blockquote className="mt-4 font-serif-italic text-xl md:text-2xl leading-snug text-ink">
                &ldquo;{t.note}&rdquo;
              </blockquote>
              <p className="mt-6 font-mono-label text-ink/50 text-[10px]">
                Theme drawn from public reviews · paraphrased
              </p>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* --- Visit --- */
function Visit() {
  const todayIdx = useTodayIdx();
  return (
    <section id="visit" className="px-5 md:px-8 py-24 md:py-36 bg-paper-2 relative overflow-hidden">
      <p
        aria-hidden
        className="absolute -top-6 right-4 font-display text-[22vw] leading-none text-outline text-magenta/60 select-none pointer-events-none"
      >
        Visit
      </p>

      <div className="relative mx-auto max-w-6xl grid md:grid-cols-12 gap-10">
        <div className="md:col-span-7 reveal">
          <p className="font-mono-label text-magenta">§ Hours</p>
          <h2 className="mt-4 font-display text-5xl md:text-6xl leading-[0.95]">
            When the <span className="font-serif-italic text-magenta">door</span> is open.
          </h2>
          <table className="mt-8 w-full text-sm border-t border-ink/25">
            <caption className="sr-only">Opening hours by day</caption>
            <tbody>
              {BUSINESS.hours.map((h, i) => {
                const isToday = i === todayIdx;
                return (
                  <tr
                    key={h.day}
                    className={`border-b border-ink/15 ${isToday ? "bg-marigold/15" : ""}`}
                  >
                    <th scope="row" className="text-left py-3 pr-4 font-mono-label align-middle">
                      {h.day}
                      {isToday && (
                        <span className="ml-2 inline-block text-magenta normal-case tracking-normal font-serif-italic text-base">
                          today
                        </span>
                      )}
                    </th>
                    <td className="py-3 text-right font-display text-lg">{h.short}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <aside className="md:col-span-5 reveal">
          <div
            className="border border-ink p-6 bg-paper rounded-md relative"
            style={{ boxShadow: "0 20px 40px -20px color-mix(in oklab, var(--ink) 45%, transparent), 0 0 0 1px color-mix(in oklab, var(--marigold) 30%, transparent)" }}
          >
            <span className="sticker absolute -top-4 -right-3">The Studio</span>
            <address className="not-italic mt-4 font-display text-2xl leading-snug">
              1/302 Camden Valley Way<br />
              Narellan NSW 2567<br />
              Australia
            </address>
            <p className="mt-3 text-sm text-ink/60 font-serif-italic text-lg">
              Inside Lexyor Beauty Centre
            </p>

            <div className="mt-6 pt-6 border-t border-ink/15 space-y-3 text-sm">
              <Row label="Phone" value={
                <a href={`tel:${BUSINESS.phoneTel}`} className="font-display text-lg hover:text-magenta">
                  {BUSINESS.phoneDisplay}
                </a>
              } />
              <Row label="WhatsApp" value={
                <a href={BUSINESS.whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-display text-lg hover:text-magenta">
                  Message on WhatsApp ↗
                </a>
              } />
              <Row label="Instagram" value={
                <a href={BUSINESS.instagramUrl} target="_blank" rel="noopener noreferrer" className="font-display text-lg hover:text-magenta">
                  @beautyandbeyondbysonia ↗
                </a>
              } />
              <Row label="Facebook" value={
                <a href={BUSINESS.facebookUrl} target="_blank" rel="noopener noreferrer" className="font-display text-lg hover:text-magenta">
                  Beautyandbeyondbysonia ↗
                </a>
              } />
              <Row label="Email" value={
                <a href={`mailto:${BUSINESS.email}`} className="font-display text-lg hover:text-magenta">
                  {BUSINESS.email}
                </a>
              } />
              <Row label="Rating" value={<span className="font-display text-lg">{BUSINESS.rating} · {BUSINESS.reviews} reviews</span>} />
              <Row label="Owned" value={<span className="font-serif-italic text-xl text-magenta">Women-owned</span>} />
            </div>

            <a
              href={BUSINESS.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm bg-ink text-paper px-4 py-2 hover:bg-magenta transition"
            >
              Open in Google Maps ↗
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono-label text-ink/60">{label}</span>
      {value}
    </div>
  );
}

/* --- Footer CTA --- */
function FooterCta() {
  return (
    <section className="relative px-5 md:px-8 pt-24 md:pt-32 pb-40 md:pb-24 bg-ink text-paper grain overflow-hidden">
      <Bloom
        variant="wild"
        className="pointer-events-none absolute -right-40 -bottom-40 w-[600px] h-[600px] text-marigold/25 animate-bloom-spin"
        stroke="currentColor"
      />
      <div className="relative mx-auto max-w-6xl">
        <p className="font-mono-label text-marigold">§ Ready</p>
        <h2 className="mt-6 font-display text-[clamp(2.5rem,9vw,7rem)] leading-[0.9] text-balance">
          Come sit for an <span className="font-serif-italic text-marigold wavy">hour</span>.
          <br />
          Sonia <span className="font-serif-italic text-blush">will do</span> the rest.
        </h2>
        <div className="mt-12 flex flex-wrap gap-3">
          <a
            href={BUSINESS.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-marigold text-ink px-8 py-4 text-sm font-mono-label hover:bg-paper transition"
            style={{ boxShadow: "0 20px 40px -20px color-mix(in oklab, var(--ink) 45%, transparent), 0 0 0 1px color-mix(in oklab, var(--marigold) 30%, transparent)" }}
          >
            Book online ↗
          </a>
          <a
            href={`tel:${BUSINESS.phoneTel}`}
            className="inline-flex items-center gap-3 border border-paper/40 px-7 py-4 text-sm font-mono-label hover:bg-paper hover:text-ink transition"
          >
            <span aria-hidden>☎</span> Call {BUSINESS.phoneDisplay}
          </a>
          <a
            href={BUSINESS.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-paper/40 px-7 py-4 text-sm font-mono-label hover:bg-paper hover:text-ink transition"
          >
            Directions ↗
          </a>
        </div>

        <div className="mt-16 flex flex-wrap items-center gap-4">
          <a
            href={BUSINESS.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-paper/80 hover:text-marigold transition"
          >
            <Facebook size={20} strokeWidth={1.5} />
            <span className="font-mono-label text-sm">Facebook</span>
          </a>
          <a
            href={BUSINESS.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-paper/80 hover:text-marigold transition"
          >
            <Instagram size={20} strokeWidth={1.5} />
            <span className="font-mono-label text-sm">Instagram</span>
          </a>
          <a
            href={`mailto:${BUSINESS.email}`}
            className="inline-flex items-center gap-2.5 text-paper/80 hover:text-marigold transition"
          >
            <Mail size={20} strokeWidth={1.5} />
            <span className="font-mono-label text-sm">Email</span>
          </a>
        </div>

        <div className="mt-20 pt-8 border-t border-paper/15 flex flex-col items-center text-center gap-3 text-xs pb-6 md:pb-8 px-10 md:px-0">
          <div className="font-mono-label text-paper/60">
            1/302 Camden Valley Way · Narellan NSW · Australia
          </div>
          <div className="font-mono-label text-paper/60">
            © {new Date().getFullYear()} Beauty &amp; Beyond by Sonia
          </div>
        </div>
      </div>
    </section>
  );
}

function useTodayIdx() {
  const ref = useRef<number>(-1);
  if (ref.current === -1) {
    const jsDay = new Date().getDay();
    ref.current = jsDay === 0 ? 6 : jsDay - 1;
  }
  return ref.current;
}
