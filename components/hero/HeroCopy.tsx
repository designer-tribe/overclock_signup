"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Hero headline + supporting copy, with a per-line mask reveal.
 *
 * Copy is placeholder. The reveal pattern is the part worth keeping: it is the
 * same shape every text entrance on this page should use.
 */
export function HeroCopy() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const headline = root.current?.querySelector("[data-headline]");
      if (!headline) return;

      // Reduced motion: leave the markup untouched and let CSS show it.
      if (prefersReducedMotion()) {
        gsap.set(root.current!.children, { autoAlpha: 1, y: 0 });
        return;
      }

      // `mask: "lines"` has SplitText wrap each line in an overflow-hidden
      // parent, so lines slide out from behind their own edge rather than
      // fading in place. `autoSplit` re-splits on font load and resize, which
      // is what makes this safe with a webfont.
      const split = SplitText.create(headline, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        linesClass: "overflow-hidden",
      });

      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

      tl.from(split.lines, {
        yPercent: 115,
        duration: 1.1,
        stagger: 0.09,
      }).to(
        root.current!.querySelectorAll("[data-fade]"),
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08 },
        // Overlap: the supporting copy starts before the headline finishes, so
        // the section reads as one movement instead of a queue.
        "-=0.7",
      );

      // SplitText.create's revert is handled by useGSAP's cleanup scope.
      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="max-w-xl">
      <p
        data-fade
        className="mb-5 font-mono text-xs tracking-[0.25em] text-white/50 uppercase opacity-0"
        style={{ transform: "translateY(12px)" }}
      >
        Overclock · Webinar
      </p>

      <h1
        data-headline
        className="text-balance text-4xl leading-[1.05] font-medium tracking-tight text-white sm:text-5xl lg:text-6xl"
      >
        Lanjutkan percakapannya. Jadwalkan sesi 1-on-1 dengan tim Overclock.
      </h1>

      <p
        data-fade
        className="mt-6 max-w-md text-base leading-relaxed text-white/60 opacity-0"
        style={{ transform: "translateY(12px)" }}
      >
        Khusus peserta webinar. Isi formulir di samping, pilih waktu yang paling
        cocok, dan kami akan mengirimkan konfirmasi beserta tautan sesi.
      </p>
    </div>
  );
}
