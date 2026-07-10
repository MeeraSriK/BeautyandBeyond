import { useEffect, useRef, useState } from "react";

/**
 * A dashed "stitched thread" SVG that runs down the page as a visual spine.
 * The stroke-dashoffset animates based on scroll progress, so the thread
 * appears to be hand-stitched into the page as the user scrolls.
 */
export function ThreadSpine() {
  const pathRef = useRef<SVGPathElement | null>(null);
  const [length, setLength] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = () => setReduced(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!pathRef.current) return;
    const total = pathRef.current.getTotalLength();
    setLength(total);
    pathRef.current.style.strokeDasharray = `6 6`;
    pathRef.current.style.strokeDashoffset = reduced ? "0" : `${total}`;
  }, [reduced]);

  useEffect(() => {
    if (reduced || !length) return;
    const path = pathRef.current;
    if (!path) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollable = doc.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
        const clamped = Math.min(1, Math.max(0, progress));
        path.style.strokeDashoffset = String(length * (1 - clamped));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [length, reduced]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-y-0 left-1/2 hidden md:block -translate-x-1/2 z-0"
      style={{ width: "min(1200px, 92vw)" }}
    >
      <svg
        className="w-full h-full"
        viewBox="0 0 100 1000"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          ref={pathRef}
          d="M50 0 C 30 120, 70 240, 50 360 S 30 600, 50 720 S 70 900, 50 1000"
          stroke="var(--thread)"
          strokeWidth="0.35"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* Anchor stitches */}
        {[0, 250, 500, 750, 995].map((y) => (
          <g key={y}>
            <circle cx="50" cy={y} r="0.9" fill="var(--thread)" opacity="0.7" />
            <circle cx="50" cy={y} r="2.4" fill="none" stroke="var(--thread)" strokeWidth="0.2" opacity="0.35" />
          </g>
        ))}
      </svg>
    </div>
  );
}
