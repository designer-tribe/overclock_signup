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
 * copy of the breakpoints — and so nudging it is a CSS change here rather than
 * a number in the simulation.
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
        cursor still reaches the mark from anywhere on the page. Being behind
        the content is also what lets the form card sit over the mark on narrow
        screens — no stacking work, the card is simply opaque.
      */}
      <ParticleMarkCanvas
        anchorRef={anchorRef}
        onReady={() => setSceneReady(true)}
        className="pointer-events-none fixed inset-0 z-0"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        {/*
          Two running orders, so every item carries an explicit `order` at both
          sizes — one item left unset would default to 0 and jump ahead of all
          of them.

          Below sm: lockup, headline, intro, mark, form. From sm the lockup and
          intro share a line, and the headline goes back on top of them, where
          an intro that opens "You've seen what's possible" needs it to be. From
          lg the explicit column and row placement takes over and `order` stops
          mattering.
        */}
        <div className="grid flex-1 items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
          {/*
            `contents` below sm dissolves this wrapper, so the lockup and the
            intro become grid items in their own right and can be ordered
            independently — the lockup has to get above the headline, which sits
            outside this wrapper entirely. From sm it is a flex row again and
            the pair sits on one line, as in the other variations.
          */}
          <div className="contents sm:order-2 sm:flex sm:items-start sm:justify-between sm:gap-8 lg:col-start-2 lg:row-start-1">
            <Logo className="order-1 h-8 shrink-0 text-cream sm:order-2" />

            <div className="order-3 max-w-sm sm:order-1">
              <p className="font-sans text-[0.8rem] font-bold tracking-[0.06em] text-teal-light italic uppercase">
                You&rsquo;ve seen what&rsquo;s possible.
              </p>
              <p className="mt-3 text-[1.05rem] leading-relaxed text-cream/85">
                Now let&rsquo;s map what it means for your people, your teams,
                and your strategy.
              </p>
            </div>
          </div>

          <HeroCopy
            tone="light"
            className="order-2 sm:order-1 lg:col-start-1 lg:row-start-1"
          />

          {/*
            The anchor. Empty, but it holds the mark's place in the grid and is
            what the scene measures — so the mark's size and position are set
            here, in the layout, rather than in the simulation.

            Below lg it runs the full width of the viewport and is given a
            height outright, because the canvas it stands for has no intrinsic
            size and the row would otherwise collapse. From lg it stretches into
            the second row instead, shifted a little off centre to sit under the
            headline rather than square in the column.

            It carries the flat mark until the scene reports for duty — and
            keeps it for good where WebGL is unavailable, which is the one case
            the canvas cannot cover for itself.
          */}
          <div
            ref={anchorRef}
            className="relative order-4 -mx-6 h-[28rem] sm:order-3 sm:-mx-10 lg:col-start-1 lg:row-start-2 lg:mx-0 lg:h-auto lg:-translate-x-[5%] lg:self-stretch"
          >
            {!sceneReady && <MarkFallback />}
          </div>

          {/*
            Pulled up over the mark below lg. The mark wants to be large on a
            phone and the form wants to be near the top of the fold; letting the
            card overlap the foot of the logo buys both, and costs nothing —
            the card is opaque and the particles are behind it anyway.
          */}
          <SignupForm className="order-5 -mt-28 sm:order-4 lg:col-start-2 lg:row-start-2 lg:mt-0 lg:self-start" />
        </div>
      </div>
    </main>
  );
}
