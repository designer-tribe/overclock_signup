"use client";

import { useRef } from "react";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Hero headline, with a per-line mask reveal.
 *
 * SplitText preserves nested markup when it splits, so the teal italic clause
 * survives the split and reveals as part of its line.
 *
 * The motion here is a placeholder — a plain, restrained entrance pending the
 * animation pass. The pattern is the part worth keeping: it is the shape every
 * text entrance on this page should use.
 */
export function HeroCopy({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const headline = root.current?.querySelector("[data-headline]");
      if (!headline) return;

      // Reduced motion: leave the markup alone and let CSS show it.
      if (prefersReducedMotion()) return;

      // `mask: "lines"` wraps each line in an overflow-hidden parent, so lines
      // slide out from behind their own edge rather than fading in place.
      // `autoSplit` re-splits on font load and resize, which is what makes this
      // safe with a webfont.
      const split = SplitText.create(headline, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
      });

      gsap.from(split.lines, {
        yPercent: 115,
        duration: 1.1,
        stagger: 0.08,
        ease: "expo.out",
      });

      return () => split.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {/* No `text-balance` here: the comp breaks after "your", and balancing
          would override that to even out the line lengths instead. */}
      <h1
        data-headline
        className="font-serif text-[2rem] leading-[1.14] tracking-[-0.015em] sm:text-[2.4rem] lg:text-[2.6rem]"
      >
        AI is already reshaping your workforce.{" "}
        <em className="text-teal">Lead the change.</em>
      </h1>
    </div>
  );
}
