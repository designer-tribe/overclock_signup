import { Logo } from "@/components/brand/Logo";
import { HeroCopy } from "@/components/hero/HeroCopy";
import { HeroVisual } from "@/components/hero/HeroVisual";
import { SignupForm } from "@/components/form/SignupForm";

/**
 * The page is one section, laid out as two columns on desktop:
 * headline over portrait on the left, intro over form on the right.
 *
 * On narrow screens it collapses to a single column in reading order —
 * headline, intro, portrait, form — which puts the form last, where someone
 * scrolling has read the pitch before being asked for details.
 *
 * The WebGL pieces under components/hero (HeroCanvas, HeroScene, Backdrop) are
 * intentionally not mounted yet: the design is a light, flat page, so the
 * full-bleed shader backdrop they draw does not belong here. They stay in the
 * repo as the starting point for the 3D mark that goes inside the CRT screen.
 */
export default function Page() {
  return (
    <main className="min-h-dvh bg-paper">
      <div className="mx-auto w-full max-w-[1500px] px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="grid items-start gap-x-16 gap-y-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)]">
          {/* Left column — order on mobile puts the portrait after the intro. */}
          <HeroCopy className="lg:col-start-1" />

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

          <HeroVisual className="lg:col-start-1 lg:row-start-2" />

          <SignupForm className="lg:col-start-2 lg:row-start-2" />
        </div>
      </div>
    </main>
  );
}
