import { Logo } from "@/components/brand/Logo";
import { HeroCopy } from "@/components/hero/HeroCopy";
import { SignupForm } from "@/components/form/SignupForm";
import { ParticleMarkCanvas } from "./particles/ParticleMarkCanvas";

/**
 * Variation 3 — the same two columns as the others, on deep black, with the
 * mark rebuilt out of particles where the CRT figure sits in variation 1.
 *
 * The left column is where the mark goes because that is the column the layout
 * already gives to the image: the headline sits above it, the form beside it,
 * and nothing had to move to make room. It also keeps the cursor interaction
 * away from the form — the particles break apart under the pointer, and having
 * that happen while someone is aiming at an input would be noise.
 *
 * `overflow-hidden` matters here for the same reason as variation 1, for a
 * different element: particles drift in from outside the mark and would
 * otherwise widen the page.
 */
export function VariantThree() {
  return (
    <main className="flex min-h-dvh flex-col overflow-hidden bg-void text-cream">
      <div className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="grid flex-1 items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
          {/*
            z-10 so the headline stays above the canvas. The canvas box reaches
            up into this row — the particle stream needs room around the mark,
            and cropping it to the mark's own bounds would clip the incoming
            particles off mid-flight.
          */}
          <HeroCopy tone="light" className="relative z-10 lg:col-start-1" />

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
            A fixed height below lg: the canvas has no intrinsic size, so in the
            stacked single-column order it would collapse to nothing. From lg it
            stretches into the second row instead, and the negative margins let
            the drifting particles run past the container's padding to the page
            edge rather than stopping inside it.
          */}
          <ParticleMarkCanvas className="h-[22rem] sm:h-[26rem] lg:col-start-1 lg:row-start-2 lg:-mx-14 lg:-mb-16 lg:h-auto lg:self-stretch" />

          <SignupForm className="lg:col-start-2 lg:row-start-2 lg:self-start" />
        </div>
      </div>
    </main>
  );
}
