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
 * the comp has it.
 *
 * Below lg the columns stack and the form simply follows the content. Sticking
 * on a short screen means a card that covers most of the viewport the whole
 * way down the page.
 */

/** The comp draws its modular grid. Every rule on the page is this one line. */
const RULE = "border-rule";

/**
 * A band's top rule, carried on across the gutter and the form column.
 *
 * The rule itself is a border on the band, so it can never drift out of line
 * with the content it separates. But the band only spans the left column, and
 * in the comp the rules cross the whole page — hence the pseudo-element, which
 * picks up at the column's right edge and runs to the container's.
 *
 * `95%` is that remaining width, and it is exactly the grid ratio below: the
 * columns are `1fr` and `0.95fr` with no gap, so the right column is 95% of
 * this band. Change the ratio and this has to change with it. The alternative
 * — an over-long rule and `overflow` to clip it — is worse than the coupling:
 * `overflow: hidden` on an ancestor turns it into a scroll container and stops
 * the form sticking at all.
 */
const BAND_RULE = `relative border-t ${RULE} after:absolute after:-top-px after:left-full after:hidden after:h-px after:w-[95%] after:bg-rule lg:after:block`;

/**
 * Horizontal padding for the bands. The left column's right side is narrower
 * than its left: that edge is the column rule, a gutter rather than the page
 * margin, and matching the two would push the content off centre.
 */
const BAND = "px-6 sm:px-10 lg:pl-14 lg:pr-10";

export function LandingOne() {
  return (
    <main className="relative min-h-dvh bg-paper text-ink">
      {/*
        620px exactly, as specified. The hero block's minimum below is sized
        against it so the copy lands near the foot of the band and the first
        rule falls clear of it — change one and check the other.
      */}
      <LandingHeroBackdrop className="h-[620px]" />

      <div
        className={`relative mx-auto w-full max-w-[1500px] border-x ${RULE}`}
      >
        <LandingBrandBar className={`${BAND} py-7 lg:pr-14`} />

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          {/* Everything that scrolls, as one grid item. */}
          <div
            className={`relative lg:col-start-1 lg:row-start-1 lg:border-r ${RULE}`}
          >
            {/*
              justify-end with a minimum height rather than padding: it pins the
              copy to the foot of the photo band whatever the headline wraps to,
              which padding alone would not — a third line would push the copy
              off the bottom of the band instead of growing upward into it.
            */}
            <div
              className={`relative flex min-h-[36rem] flex-col justify-end pb-24 lg:min-h-[38rem] lg:pb-28 ${BAND}`}
            >
              <LandingHeroCopy />

              {/*
                The accent block, filling the gutter cell between the foot of
                the photo band and the first rule. `left-full` puts its left
                edge on the column rule, and the small negative shift straddles
                it the way the comp does — a few pixels into the column, the
                rest across the gutter, stopping just short of the form card.
                lg-only: below lg there is no gutter for it to sit in.
              */}
              <span
                aria-hidden
                className="absolute bottom-0 left-full hidden h-11 w-11 -translate-x-1.5 bg-rust lg:block"
              />
            </div>

            <div className={`${BAND_RULE} ${BAND} py-12`}>
              <SpeakerBio />
            </div>

            <div className={`${BAND_RULE} ${BAND} py-12`}>
              <Takeaways />
            </div>

            {/* Closes the column: without it the last band has no bottom edge
                and the grid stops mid-air. */}
            <div className={`${BAND_RULE} h-20`} />
          </div>

          {/*
            The sticky column. `top` clears the band's own breathing room, and
            `self-start` is load-bearing — see the note above.
          */}
          <div
            className={`px-6 pb-16 sm:px-10 lg:col-start-2 lg:row-start-1 lg:sticky lg:top-8 lg:self-start lg:px-10 lg:pb-0`}
          >
            <SignupForm />
          </div>
        </div>
      </div>
    </main>
  );
}
