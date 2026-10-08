import { Logo } from "@/components/brand/Logo";
import { HeroCopy } from "@/components/hero/HeroCopy";
import { HeroVisual } from "@/components/hero/HeroVisual";
import { SignupForm } from "@/components/form/SignupForm";

/**
 * Variation 1 — the approved comp: paper background, CRT figure on the left.
 *
 * One section, laid out as two columns on desktop:
 * headline over portrait on the left, intro over form on the right.
 *
 * On narrow screens it collapses to a single column in reading order —
 * headline, intro, portrait, form — which puts the form last, where someone
 * scrolling has read the pitch before being asked for details.
 *
 */
export function VariantOne() {
  return (
    // overflow-hidden so the portrait can bleed off the bottom edge, as the
    // comp has it, without adding page scroll.
    <main className="flex min-h-dvh flex-col overflow-hidden bg-paper">
      {/*
        The flex chain matters: min-h-dvh only stretches `main`. Without
        flex-1 passed down to the grid, the grid stays content-height and the
        portrait anchors to the bottom of the content rather than the bottom of
        the page — which on a tall viewport leaves it visibly floating.
      */}
      <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        {/* grid-rows-[auto_1fr]: the second row takes all the leftover height,
            which is what gives the portrait a box to fill down to the edge. */}
        <div className="grid flex-1 items-start gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
          {/* Left column — order on mobile puts the portrait after the intro. */}
          {/* Above the video: the figure now reaches up into this row, and its
              backdrop is opaque, so without this it paints over the headline.
              Only the empty part of the frame overlaps the text — the monitor
              itself sits below it. */}
          <HeroCopy className="relative z-10 lg:col-start-1" />

          {/*
            Right column header: intro copy with the lockup pinned right.
            The lockup comes first in the DOM so that on narrow screens, where
            this stacks, it reads as a header above the copy rather than being
            stranded below it; `order` puts it back on the right from sm up.
          */}
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:justify-between lg:col-start-2 lg:row-start-1">
            {/* Height only — the lockup's viewBox carries its own aspect ratio. */}
            <Logo className="h-8 shrink-0 sm:order-2" />

            <div className="max-w-sm sm:order-1">
              <p className="font-sans text-[0.8rem] font-bold tracking-[0.06em] text-teal italic uppercase">
                You&rsquo;ve seen what&rsquo;s possible.
              </p>
              <p className="mt-3 text-[1.05rem] leading-relaxed text-ink/85">
                Now let&rsquo;s map what it means for your people, your teams,
                and your strategy.
              </p>
            </div>
          </div>

          {/* Stretches to fill the second row, so the figure has a box running
              all the way to the page edge; the negative margins cancel the
              container's padding so it reaches that edge rather than stopping
              inside it. lg-only: in the stacked mobile order the form sits
              directly below and would be pulled into the image. */}
          <HeroVisual className="lg:col-start-1 lg:row-start-2 lg:-mb-16 lg:-ml-24 lg:self-stretch" />

          <SignupForm className="lg:col-start-2 lg:row-start-2" />
        </div>
      </div>
    </main>
  );
}
