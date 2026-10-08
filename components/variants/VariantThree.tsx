"use client";

import { useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { HeroCopy } from "@/components/hero/HeroCopy";
import { SignupForm } from "@/components/form/SignupForm";
import { MarkFallback } from "./particles/MarkFallback";
import { ParticleMarkCanvas } from "./particles/ParticleMarkCanvas";

/**
 * Variation 3 — the same two columns as the others, on deep black, with the
 * Overclock mark rebuilt out of particles where variation 1 puts the CRT figure.
 *
 * The canvas is the **whole page**, not the column the mark sits in. That looks
 * like a detail and is not: particles have to come from somewhere, and if the
 * canvas is only as big as the mark's own column then the edge of that column
 * is where they appear — a rectangle of empty page with particles streaming out
 * of its sides, which is exactly the box you can see in a screenshot once you
 * know to look for it. Spanning the viewport, they arrive from the edges of the
 * site.
 *
 * Which leaves the mark needing to know where in that viewport to draw itself.
 * It measures the anchor below, an empty box sitting in the grid where the
 * figure would be, so the logo tracks the layout instead of carrying its own
 * copy of the breakpoints.
 *
 * The left column also keeps the cursor interaction away from the form: the
 * particles break apart under the pointer, and having that happen while
 * someone is aiming at an input would be noise.
 */
export function VariantThree() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [sceneReady, setSceneReady] = useState(false);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-void text-cream">
      {/*
        Behind everything and deaf to the mouse: the form and its inputs must
        get their own clicks. The scene listens on the document instead, so the
        cursor still reaches the mark from anywhere on the page.
      */}
      <ParticleMarkCanvas
        anchorRef={anchorRef}
        onReady={() => setSceneReady(true)}
        className="pointer-events-none fixed inset-0 z-0"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="grid flex-1 items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
          <HeroCopy tone="light" className="lg:col-start-1" />

          {/*
            Same ordering as the other variations: the lockup leads in the DOM
            so it reads as a header when this stacks, and `order` returns it to
            the right from sm up.
          */}
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:justify-between lg:col-start-2 lg:row-start-1">
            <Logo className="h-8 shrink-0 text-cream sm:order-2" />

            <div className="max-w-sm sm:order-1">
              <p className="font-sans text-[0.8rem] font-bold tracking-[0.06em] text-teal-light italic uppercase">
                You&rsquo;ve seen what&rsquo;s possible.
              </p>
              <p className="mt-3 text-[1.05rem] leading-relaxed text-cream/85">
                Now let&rsquo;s map what it means for your people, your teams,
                and your strategy.
              </p>
            </div>
          </div>

          {/*
            The anchor. Empty, but it holds the mark's place in the grid and is
            what the scene measures. A fixed height below lg, because the canvas
            it stands for has no intrinsic size and the row would otherwise
            collapse; from lg it stretches into the second row instead.

            It carries the flat mark until the scene reports for duty — and
            keeps it for good where WebGL is unavailable, which is the one case
            the canvas cannot cover for itself.
          */}
          <div
            ref={anchorRef}
            className="relative h-[22rem] sm:h-[26rem] lg:col-start-1 lg:row-start-2 lg:h-auto lg:self-stretch"
          >
            {!sceneReady && <MarkFallback />}
          </div>

          <SignupForm className="lg:col-start-2 lg:row-start-2 lg:self-start" />
        </div>
      </div>
    </main>
  );
}
