import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Facebook, Instagram, Mail, X, ChevronLeft, ChevronRight } from "lucide-react";
import { BUSINESS } from "@/lib/business-facts";
import facialSerum from "@/assets/gallery/facial-serum.jpg";
import facialProducts from "@/assets/gallery/facial-products.jpg";
import massageLinen from "@/assets/gallery/massage-linen.jpg";
import browsCloseup from "@/assets/gallery/brows-closeup.jpg";
import browTools from "@/assets/gallery/brow-tools.jpg";
import studioCorner from "@/assets/gallery/studio-corner.jpg";

type GalleryImage = {
  src: string;
  alt: string;
  caption: string;
  tag: string;
  w: number;
  h: number;
};

const IMAGES: GalleryImage[] = [
  {
    src: facialSerum,
    alt: "A hand holding a small amber serum dropper in warm window light",
    caption: "A single drop, warmed in the hand before it meets your skin.",
    tag: "Facials",
    w: 1024,
    h: 1280,
  },
  {
    src: facialProducts,
    alt: "Flat lay of amber skincare bottles, a ceramic jar and folded linen with dried marigold",
    caption: "The shelf — everything is chosen for one room, one client.",
    tag: "Facials",
    w: 1280,
    h: 1024,
  },
  {
    src: massageLinen,
    alt: "Stacked cream linen towels and a small amber oil bottle in a warm-lit treatment room",
    caption: "Towels warmed, oil poured — before you've taken off your coat.",
    tag: "Massage",
    w: 1280,
    h: 1024,
  },
  {
    src: browsCloseup,
    alt: "Extreme close-up of a shaped natural eyebrow lit by soft window light",
    caption: "Brows shaped to your face — not to a chart.",
    tag: "Brows & Lashes",
    w: 1024,
    h: 1280,
  },
  {
    src: browTools,
    alt: "Flat lay of brow tint, fine brush and cotton pads on cream linen",
    caption: "Tint mixed fresh, one appointment at a time.",
    tag: "Brows & Lashes",
    w: 1024,
    h: 1024,
  },
  {
    src: studioCorner,
    alt: "A quiet studio corner with a single marigold lily bloom and a cream linen curtain",
    caption: "A quiet corner of the studio at 3pm on a Wednesday.",
    tag: "The Room",
    w: 1024,
    h: 1280,
  },
];

type ClientPost = {
  src: string;
  alt: string;
  handle: string;
  caption: string;
  tag: string;
};

// Placeholder "tagged by clients" wall — swap for the live Behold feed once it's connected.
const CLIENT_POSTS: ClientPost[] = [
  {
    src: facialSerum,
    alt: "Client selfie after a hydrating facial, glowing skin in soft window light",
    handle: "@ellathreads",
    caption: "Skin feels like silk after Sonia's hydrating facial 🌼",
    tag: "Hydrating facial",
  },
  {
    src: browsCloseup,
    alt: "Close-up of freshly threaded brows tagged by a client",
    handle: "@maya.k",
    caption: "Brows finally shaped to *my* face. Thank you Sonia ✨",
    tag: "Brow threading",
  },
  {
    src: massageLinen,
    alt: "Client's view of the massage room from the treatment bed",
    handle: "@priyaa_",
    caption: "Left the studio floating. Lymphatic drainage = magic.",
    tag: "Lymphatic massage",
  },
  {
    src: browTools,
    alt: "Client post-lash-lift showing lifted natural lashes",
    handle: "@sarah.m",
    caption: "Two weeks in and my lash lift still looks amazing 😍",
    tag: "Lash lift & tint",
  },
  {
    src: facialProducts,
    alt: "Flat lay of skincare a client bought after their consultation",
    handle: "@nikita.h",
    caption: "Took Sonia's routine home with me. Worth every dollar.",
    tag: "Consultation",
  },
  {
    src: studioCorner,
    alt: "Client photo of the studio's quiet corner tagged on Instagram",
    handle: "@aanya.rose",
    caption: "The calmest room in Narellan. Booking again already.",
    tag: "The Room",
  },
];


export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Beauty & Beyond by Sonia · Narellan Beauty Studio" },
      {
        name: "description",
        content:
          "A quiet look inside Sonia's Narellan studio — facials, massage, brow and lash work, told in soft, unhurried images.",
      },
      { property: "og:title", content: "Gallery — Beauty & Beyond by Sonia" },
      {
        property: "og:description",
        content:
          "A quiet look inside Sonia's Narellan studio — facials, massage, brow and lash work.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/gallery" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/gallery" }],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [open, setOpen] = useState<number | null>(null);
  const [openClient, setOpenClient] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const next = useCallback(
    () => setOpen((i) => (i === null ? i : (i + 1) % IMAGES.length)),
    [],
  );
  const prev = useCallback(
    () => setOpen((i) => (i === null ? i : (i - 1 + IMAGES.length) % IMAGES.length)),
    [],
  );

  const closeClient = useCallback(() => setOpenClient(null), []);
  const nextClient = useCallback(
    () => setOpenClient((i) => (i === null ? i : (i + 1) % CLIENT_POSTS.length)),
    [],
  );
  const prevClient = useCallback(
    () => setOpenClient((i) => (i === null ? i : (i - 1 + CLIENT_POSTS.length) % CLIENT_POSTS.length)),
    [],
  );

  // Keyboard nav + body scroll lock when either lightbox is open
  useEffect(() => {
    const anyOpen = open !== null || openClient !== null;
    if (!anyOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (openClient !== null) {
        if (e.key === "Escape") closeClient();
        else if (e.key === "ArrowRight") nextClient();
        else if (e.key === "ArrowLeft") prevClient();
      } else {
        if (e.key === "Escape") close();
        else if (e.key === "ArrowRight") next();
        else if (e.key === "ArrowLeft") prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, openClient, close, next, prev, closeClient, nextClient, prevClient]);


  return (
    <div className="relative min-h-dvh bg-paper text-ink overflow-x-hidden">
      <Nav />
      <main id="main">
        {/* Header */}
        <section className="relative bg-plum text-paper px-5 md:px-8 pt-20 md:pt-28 pb-16 md:pb-24 grain overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 top-8 w-[380px] h-[380px] rounded-full blur-3xl"
            style={{
              background: "radial-gradient(circle, var(--marigold) 0%, transparent 70%)",
              opacity: 0.35,
            }}
          />
          <div className="relative mx-auto max-w-6xl">
            <p className="font-mono-label text-marigold">§ Gallery</p>
            <h1 className="mt-6 font-display text-[clamp(2.75rem,9vw,7rem)] leading-[0.9] tracking-tight text-balance">
              A quiet look <span className="font-serif-italic text-marigold wavy">inside</span>
              <br />
              the <span className="font-serif-italic text-blush">room.</span>
            </h1>
            <p className="mt-8 max-w-xl text-paper/80 leading-relaxed">
              Placeholder imagery while Sonia curates real studio photos. Click any
              frame to open it larger — arrow keys move through the set.
            </p>
          </div>
        </section>

        {/* Masonry grid */}
        <section className="relative px-5 md:px-8 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 md:gap-5 [column-fill:_balance]">
              {IMAGES.map((img, i) => (
                <button
                  key={img.src}
                  type="button"
                  onClick={() => setOpen(i)}
                  className="group mb-4 md:mb-5 block w-full break-inside-avoid overflow-hidden border border-ink bg-paper-2 rounded-md relative focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta"
                  style={{
                    boxShadow:
                      "0 20px 40px -20px color-mix(in oklab, var(--ink) 45%, transparent), 0 0 0 1px color-mix(in oklab, var(--marigold) 30%, transparent)",
                  }}
                  aria-label={`Open image: ${img.alt}`}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    width={img.w}
                    height={img.h}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-ink/70 via-ink/10 to-transparent">
                    <div className="text-paper">
                      <p className="font-mono-label text-marigold text-xs">{img.tag}</p>
                      <p className="mt-1 font-serif-italic text-lg leading-snug">
                        {img.caption}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <p className="mt-10 text-center font-mono-label text-ink/50 text-xs">
              Placeholder imagery · real studio photos coming soon
            </p>
          </div>
        </section>

        {/* Tagged by clients — Instagram-style wall */}
        <section className="relative px-5 md:px-8 py-16 md:py-24 bg-paper-2 border-t border-ink/10">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <p className="font-mono-label text-magenta">§ Tagged by clients</p>
                <h2 className="mt-3 font-display text-4xl md:text-6xl leading-[0.95]">
                  Real <span className="font-serif-italic text-magenta">clients</span>,
                  <br className="hidden sm:block" /> real <span className="font-serif-italic text-marigold">glow.</span>
                </h2>
              </div>
              <a
                href={BUSINESS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-mono-label border border-ink px-5 py-3 hover:bg-ink hover:text-paper transition"
              >
                <Instagram size={16} strokeWidth={1.75} />
                Follow @beautyandbeyondbysonia ↗
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
              {CLIENT_POSTS.map((post, i) => (
                <button
                  key={post.handle + post.caption}
                  type="button"
                  onClick={() => setOpenClient(i)}
                  className="group relative block aspect-square overflow-hidden border border-ink bg-paper rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-magenta text-left"
                  style={{
                    boxShadow:
                      "0 12px 30px -18px color-mix(in oklab, var(--ink) 55%, transparent)",
                  }}
                  aria-label={`Open client photo: ${post.handle} — ${post.caption}`}
                >
                  <img
                    src={post.src}
                    alt={post.alt}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-paper/90 backdrop-blur-sm px-2 py-1 rounded-full border border-ink/10">
                    <Instagram size={12} strokeWidth={2} className="text-magenta" />
                    <span className="font-mono-label text-[10px] text-ink">{post.handle}</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-ink/85 via-ink/40 to-transparent">
                    <p className="font-mono-label text-marigold text-[10px]">{post.tag}</p>
                    <p className="mt-1 font-serif-italic text-paper text-sm leading-snug">
                      {post.caption}
                    </p>
                  </div>
                </button>
              ))}
            </div>


            <p className="mt-8 text-center font-mono-label text-ink/50 text-xs">
              Placeholder client tags · live Instagram feed loads here once Behold is connected
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="relative px-5 md:px-8 py-20 md:py-24 bg-paper-2">
          <div className="mx-auto max-w-4xl text-center">
            <p className="font-mono-label text-magenta">§ Come see for yourself</p>
            <h2 className="mt-4 font-display text-4xl md:text-6xl leading-[0.95]">
              The room is <span className="font-serif-italic text-magenta">quieter</span> in person.
            </h2>
            <div className="mt-10 flex flex-wrap gap-3 justify-center">
              <a
                href={BUSINESS.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-marigold text-ink px-7 py-4 text-sm font-mono-label hover:bg-ink hover:text-marigold transition"
                style={{
                  boxShadow:
                    "0 20px 40px -20px color-mix(in oklab, var(--ink) 45%, transparent), 0 0 0 1px color-mix(in oklab, var(--marigold) 30%, transparent)",
                }}
              >
                Book online ↗
              </a>
              <a
                href={`tel:${BUSINESS.phoneTel}`}
                className="inline-flex items-center gap-3 border border-ink px-7 py-4 text-sm font-mono-label hover:bg-ink hover:text-paper transition"
              >
                <span aria-hidden>☎</span> Call {BUSINESS.phoneDisplay}
              </a>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-mono-label px-7 py-4 border border-ink/30 hover:bg-ink hover:text-paper transition"
              >
                ← Back home
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Lightbox */}
      {open !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={close}
        >
          {/* Close */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            aria-label="Close"
            className="absolute top-4 right-4 md:top-6 md:right-6 w-11 h-11 rounded-full bg-paper/10 hover:bg-marigold hover:text-ink text-paper border border-paper/30 flex items-center justify-center transition"
          >
            <X size={20} strokeWidth={1.75} />
          </button>

          {/* Prev */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous image"
            className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-paper/10 hover:bg-marigold hover:text-ink text-paper border border-paper/30 flex items-center justify-center transition"
          >
            <ChevronLeft size={22} strokeWidth={1.75} />
          </button>

          {/* Next */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next image"
            className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-paper/10 hover:bg-marigold hover:text-ink text-paper border border-paper/30 flex items-center justify-center transition"
          >
            <ChevronRight size={22} strokeWidth={1.75} />
          </button>

          {/* Frame */}
          <figure
            className="relative max-w-[92vw] max-h-[82vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={IMAGES[open].src}
              alt={IMAGES[open].alt}
              width={IMAGES[open].w}
              height={IMAGES[open].h}
              className="max-w-full max-h-[72vh] w-auto h-auto object-contain rounded-md border border-paper/20"
            />
            <figcaption className="text-center max-w-xl">
              <p className="font-mono-label text-marigold text-xs">
                {IMAGES[open].tag} · {open + 1} / {IMAGES.length}
              </p>
              <p className="mt-1 font-serif-italic text-paper text-lg md:text-xl leading-snug">
                {IMAGES[open].caption}
              </p>
            </figcaption>
          </figure>
        </div>
      )}

      {/* Client-tag Lightbox */}
      {openClient !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Client photo viewer"
          className="fixed inset-0 z-50 bg-ink/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={closeClient}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              closeClient();
            }}
            aria-label="Close"
            className="absolute top-4 right-4 md:top-6 md:right-6 w-11 h-11 rounded-full bg-paper/10 hover:bg-marigold hover:text-ink text-paper border border-paper/30 flex items-center justify-center transition"
          >
            <X size={20} strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevClient();
            }}
            aria-label="Previous client photo"
            className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-paper/10 hover:bg-marigold hover:text-ink text-paper border border-paper/30 flex items-center justify-center transition"
          >
            <ChevronLeft size={22} strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextClient();
            }}
            aria-label="Next client photo"
            className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 md:w-12 md:h-12 rounded-full bg-paper/10 hover:bg-marigold hover:text-ink text-paper border border-paper/30 flex items-center justify-center transition"
          >
            <ChevronRight size={22} strokeWidth={1.75} />
          </button>

          <figure
            className="relative max-w-[92vw] max-h-[86vh] flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={CLIENT_POSTS[openClient].src}
              alt={CLIENT_POSTS[openClient].alt}
              className="max-w-full max-h-[68vh] w-auto h-auto object-contain rounded-md border border-paper/20"
            />
            <figcaption className="text-center max-w-xl">
              <div className="inline-flex items-center gap-1.5 bg-paper/10 border border-paper/25 rounded-full px-3 py-1">
                <Instagram size={12} strokeWidth={2} className="text-marigold" />
                <span className="font-mono-label text-paper text-[11px]">
                  {CLIENT_POSTS[openClient].handle}
                </span>
              </div>
              <p className="mt-3 font-mono-label text-marigold text-xs">
                {CLIENT_POSTS[openClient].tag} · {openClient + 1} / {CLIENT_POSTS.length}
              </p>
              <p className="mt-2 font-serif-italic text-paper text-lg md:text-xl leading-snug">
                {CLIENT_POSTS[openClient].caption}
              </p>
              <a
                href={BUSINESS.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="mt-4 inline-flex items-center gap-2 text-xs font-mono-label text-paper/80 hover:text-marigold transition"
              >
                <Instagram size={13} strokeWidth={1.75} />
                View on Instagram ↗
              </a>
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}

/* --- Small nav that matches the site (self-contained so gallery route works standalone) --- */
function Nav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-paper/85 border-b border-ink/10">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-baseline gap-1.5 sm:gap-2">
          <span className="font-serif-italic text-xl sm:text-2xl leading-none">Beauty</span>
          <span className="font-mono-label text-ink/70 text-xs sm:text-sm">&amp;</span>
          <span className="font-serif-italic text-xl sm:text-2xl leading-none">Beyond</span>
          <span className="font-mono-label text-marigold text-xs sm:text-sm">by Sonia</span>
        </Link>
        <nav className="hidden md:flex items-center gap-7 text-sm">
          <Link to="/" hash="services" className="hover:text-magenta transition">Services</Link>
          <Link to="/" hash="room" className="hover:text-magenta transition">The Room</Link>
          <Link to="/gallery" className="text-magenta font-mono-label">Gallery</Link>
          <Link to="/" hash="visit" className="hover:text-magenta transition">Visit</Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1 sm:gap-2">
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
              href={BUSINESS.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-ink/15 text-ink/80 hover:bg-ink hover:text-paper hover:border-ink transition"
            >
              <Instagram size={18} strokeWidth={1.5} />
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
            className="sticker transition-transform"
          >
            <span aria-hidden>☎</span> Book by Call
          </a>
        </div>
      </div>
    </header>
  );
}
