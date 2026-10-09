import { SignupForm } from "@/components/form/SignupForm";
import {
  LandingBrandBar,
  LandingHeroBackdrop,
  LandingHeroCopy,
} from "./LandingHero";
import { SpeakerBio } from "./SpeakerBio";
import { Takeaways } from "./Takeaways";

/**
 * Landing V1 — a scrolling page, not the one-section signup.
 *
 * Two columns that are **one grid row**, which is the whole trick behind the
 * sticky form. The left column is a single tall grid item carrying every
 * section; the right is one short item beside it. Because they share a row,
 * the right item can stick against a viewport edge while the row scrolls past
 * — and it needs `self-start`, since a grid item stretched to its row's full
 * height has nothing left to travel and will not stick at all.
 *
 * The photo band is a layer behind that grid rather than a section inside it,
 * so the form column starts at the very top of the page and overlaps it, as
 * the comp has it. Its height and the hero block's minimum are set together:
 * the band has to finish just below the standfirst.
 *
 * Below lg the columns stack and the form simply follows the content. Sticking
 * on a short screen means a card that covers most of the viewport the whole
 * way down the page.
 */
export function LandingOne() {
  return (
    <main className="relative min-h-dvh bg-paper text-ink">
      {/*
        The band's height and the hero block's minimum below are one decision
        in two places: the band has to finish in the gap between the standfirst
        and the speaker card. Taller and it cuts across the card; shorter and
        the copy sits half off it. Change either and check the other.
      */}
      <LandingHeroBackdrop className="h-[23rem] sm:h-[24rem] lg:h-[25rem]" />

      <div className="relative mx-auto w-full max-w-[1500px] px-6 pb-24 sm:px-10 lg:px-14 lg:pb-32">
        <LandingBrandBar className="py-7 lg:py-8" />

        <div className="grid gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:gap-x-16">
          {/* Everything that scrolls, as one grid item. */}
          <div className="lg:col-start-1 lg:row-start-1">
            {/*
              justify-end with a minimum height rather than padding: it pins the
              copy to the foot of the photo band whatever the headline wraps to,
              which padding alone would not — a third line would push the copy
              off the bottom of the band instead of growing upward into it.
            */}
            <div className="flex min-h-[17rem] flex-col justify-end pb-14 sm:min-h-[20rem] lg:min-h-[22rem] lg:pb-16">
              <LandingHeroCopy />
            </div>

            <SpeakerBio />
            <Takeaways className="mt-14" />
          </div>

          {/*
            The sticky column. `top` clears the band's own breathing room, and
            `self-start` is load-bearing — see the note above.
          */}
          <div className="lg:col-start-2 lg:row-start-1 lg:sticky lg:top-8 lg:self-start">
            <SignupForm />
          </div>
        </div>
      </div>
    </main>
  );
}
