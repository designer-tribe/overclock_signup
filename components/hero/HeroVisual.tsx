"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePointer } from "@/hooks/usePointer";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import body from "@/assets/hero-portrait-body.webp";
import monitor from "@/assets/hero-portrait-monitor.webp";

/**
 * The CRT-head portrait, with the monitor turning to follow the cursor.
 *
 * The photograph is split into two layers — the monitor and everything below it
 * — and only the monitor is rotated. Both layers are the full original canvas
 * with the other part erased, so they stack with no offset arithmetic: the two
 * together are pixel-identical to the original when the monitor is at rest.
 *
 * The split is at the narrowest row of the silhouette, measured from the alpha
 * channel (row 719 of 1414, where the neck is 317px across). The body layer
 * keeps a 28px band above that line, hidden under the monitor at rest, so the
 * rotation cannot open the seam into a transparent gap.
 *
 * The pivot sits at that seam rather than at the layer's centre, so the monitor
 * turns about the neck the way a head does. Pivoting at the centre would swing
 * the base out from the shoulders and read as a floating box.
 *
 * Why CSS perspective rather than real 3D: the photograph's realism — worn
 * plastic, dust, the grille — is the point, and nothing modelled would match it
 * beside a photographic body. The cost is that the angles have to stay modest;
 * much past these and a flat layer stops reading as a turning head and starts
 * reading as tilting paper.
 */
const MAX_YAW = 13;
const MAX_PITCH = 7;

/** Measured from the alpha channel: the centre of the neck at the seam row. */
const PIVOT = "51.23% 50.85%";

export function HeroVisual({ className = "" }: { className?: string }) {
  const scope = useRef<HTMLDivElement>(null);
  const monitorRef = useRef<HTMLDivElement>(null);
  const pointer = usePointer();

  useGSAP(
    () => {
      const el = monitorRef.current;
      if (!el || prefersReducedMotion()) return;

      // quickTo keeps a live tween per property, so feeding it the raw target
      // every frame yields smooth easing without hand-rolling a lerp — and
      // without allocating a tween per pointer event.
      const yaw = gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3" });
      const pitch = gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3" });

      const onTick = () => {
        const p = pointer.current;
        // `active` is 0 until the pointer first moves and returns to 0 when it
        // leaves the window, so the monitor rests square instead of snapping.
        yaw(p.x * p.active * MAX_YAW);
        // Negated: CSS rotateX(+) tips the top away, which reads as looking
        // down, and the cursor being high should make it look up.
        pitch(-p.y * p.active * MAX_PITCH);
      };

      gsap.ticker.add(onTick);
      return () => gsap.ticker.remove(onTick);
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      <div
        className="relative mx-auto w-full max-w-[33rem] lg:mx-0 lg:w-[42rem] lg:max-w-none"
        // Perspective on the shared parent so both layers resolve to one
        // vanishing point. Large value: a short one exaggerates the foreshortening
        // and the monitor starts to look like it is lunging at the cursor.
        style={{ perspective: "1600px" }}
      >
        {/*
          The body is in normal flow, so it sets the box size for both layers
          and there is no height to declare by hand.
        */}
        <Image
          src={body}
          alt=""
          priority
          placeholder="blur"
          sizes="(min-width: 1024px) 42rem, (min-width: 640px) 60vw, 90vw"
          className="h-auto w-full"
        />

        <div
          ref={monitorRef}
          className="absolute inset-0"
          style={{ transformOrigin: PIVOT, willChange: "transform" }}
        >
          <Image
            src={monitor}
            alt=""
            priority
            sizes="(min-width: 1024px) 42rem, (min-width: 640px) 60vw, 90vw"
            className="h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}
