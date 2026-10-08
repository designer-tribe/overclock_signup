import Image from "next/image";
import { Logo } from "@/components/brand/Logo";
import { HeroCopy } from "@/components/hero/HeroCopy";
import { SignupForm } from "@/components/form/SignupForm";
import backdrop from "@/assets/variation-two-bg.webp";

/**
 * Variation 2 — the photograph runs full bleed behind everything, darkened,
 * with the copy in white over it and the form card on the right.
 *
 * Structurally it is the same two columns as variation 1; what changes is the
 * surface. There is no CRT figure here, so the left column is just the
 * headline and the photograph carries the rest.
 *
 * The form card is reused unchanged: its sand surface already reads as a panel
 * against a dark backdrop as well as it does against paper, and forking it for
 * a second surface would mean two copies of the validation wiring.
 */
export function VariantTwo() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      {/*
        `fill` rather than a sized image: the photograph has no say in the
        layout, it only has to cover whatever box the viewport gives it.
        `priority` because it is the LCP element here — lazily loaded it would
        leave the page black until well after first paint.
      */}
      <Image
        src={backdrop}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      {/*
        Two overlays rather than one flat tint. A single uniform scrim dark
        enough for the headline would flatten the photograph to mud; the
        vertical gradient puts the weight at the top where the copy sits, and
        the horizontal one deepens the left where the headline runs over the
        brightest part of the frame.
      */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/55 to-ink/70"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-ink/55 via-transparent to-transparent"
      />

      <div className="relative mx-auto flex w-full max-w-[1500px] flex-1 flex-col px-6 py-12 text-white sm:px-10 lg:px-14 lg:py-16">
        <div className="grid flex-1 items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:grid-rows-[auto_1fr]">
          <HeroCopy tone="light" className="lg:col-start-1" />

          {/*
            Same ordering trick as variation 1: the lockup leads in the DOM so
            that when this stacks on narrow screens it reads as a header above
            the copy, and `order` returns it to the right from sm up.
          */}
          <div className="flex flex-col items-start gap-8 sm:flex-row sm:justify-between lg:col-start-2 lg:row-start-1">
            <Logo className="h-8 shrink-0 text-white sm:order-2" />

            <div className="max-w-sm sm:order-1">
              <p className="font-sans text-[0.8rem] font-bold tracking-[0.06em] text-teal-light italic uppercase">
                You&rsquo;ve seen what&rsquo;s possible.
              </p>
              <p className="mt-3 text-[1.05rem] leading-relaxed text-white/85">
                Now let&rsquo;s map what it means for your people, your teams,
                and your strategy.
              </p>
            </div>
          </div>

          {/*
            The card sits in the second row of the right column and is pinned to
            the top of it, so the gap between the intro copy and the card stays
            constant instead of growing with the viewport.
          */}
          <SignupForm className="lg:col-start-2 lg:row-start-2 lg:self-start" />
        </div>
      </div>
    </main>
  );
}
