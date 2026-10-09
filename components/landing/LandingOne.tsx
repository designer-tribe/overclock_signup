import {
  LandingBrandBar,
  LandingHeroBackdrop,
  LandingHeroCopy,
} from "./LandingHero";
import { LandingFooter } from "./LandingFooter";
import { NametagForm } from "./NametagForm";
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
 * Below lg the columns stack, with the form straight under the hero copy (see
 * the `contents` note below), and it does not stick: on a short screen that
 * would be a card covering most of the viewport the whole way down the page.
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
    /*
      Three numbers the page is built from, as variables rather than as values
      repeated down the file. The band is 620px, as specified; the brand bar
      takes a fixed slice off the top of it; and the copy block takes what is
      left, so it ends exactly where the photograph does.

      `--cell` is the gap between the foot of the band and the first rule, and
      it is also the side of the accent block that fills it — the block takes
      it for both its height and its width, so the block is square by
      construction rather than by two numbers that happen to agree. Shrink it
      and everything below the band rises with it.
    */
    <main
      className="relative min-h-dvh bg-paper text-ink"
      style={
        {
          "--band": "620px",
          "--bar": "5.5rem",
          "--cell": "2.75rem",
        } as React.CSSProperties
      }
    >
      <LandingHeroBackdrop className="h-[var(--band)]" />

      <div className="relative mx-auto w-full max-w-[1500px]">
        {/*
          From lg the lockup's right edge lines up with the badge's: the bar
          repeats the page grid's columns, and in the second one it takes the
          same padding and the same centred 30rem box the badge sits in.
          z-30: aligned like this the lockup sits over the badge's strap, and
          the logos have to stay legible where the ribbon passes behind them.
        */}
        <div
          className="relative z-30 h-[var(--bar)] px-6 sm:px-10 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:px-0"
        >
          <div className="h-full lg:col-start-2 lg:px-10">
            <LandingBrandBar className="mx-auto h-full max-w-[30rem]" />
          </div>
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          {/*
            Everything that scrolls, as one grid item — from lg. Below lg it is
            `display: contents`, so its blocks become grid items of their own
            and the form can be ordered in between them: straight under the
            hero copy, rather than after every section on the page.
          */}
          <div className="contents lg:relative lg:col-start-1 lg:row-start-1 lg:block">
            {/*
              The rest of the band, after the brand bar. justify-end with a
              minimum height rather than padding: it pins the copy to the foot
              of the photograph whatever the headline wraps to, which padding
              alone would not — a third line would push the copy off the bottom
              of the band instead of growing upward into it.
            */}
            <div
              className={`order-1 flex min-h-[calc(var(--band)-var(--bar))] flex-col justify-end pb-9 ${BAND}`}
            >
              <LandingHeroCopy />
            </div>

            {/*
              The cell between the foot of the photograph and the first rule.
              The accent block fills it top to bottom, so it meets the
              photograph with no gap. `left-full` puts its left edge on the
              column rule and the small negative shift straddles it the way the
              comp does — a few pixels into the column, the rest across the
              gutter, stopping short of the form card. lg-only: below lg there
              is no gutter for it to sit in.
            */}
            <div className="relative order-3 h-[var(--cell)]">
              <span
                aria-hidden
                className="absolute inset-y-0 left-full hidden w-[var(--cell)] -translate-x-1.5 bg-rust lg:block"
              />
            </div>

            {/*
              The grid's vertical rules live here, on the bands, rather than on
              the column or the container — so they begin where the photo band
              ends. Carried any higher they cross the photograph, and a pale
              hairline over a dark image is not a grid line, it is a scratch.
            */}
            <div className={`order-3 lg:border-x ${RULE}`}>
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
          </div>

          {/*
            The sticky column. `top` clears the band's own breathing room, and
            `self-start` is load-bearing — see the note above.

            Below lg this column starts exactly at the photograph's bottom
            edge, and the clip-path cuts the badge's strap off flat there, so
            it reads as running up behind the photo. Top edge only: the other
            three insets are pushed far out so the badge's shadow is kept.
            Not `overflow: hidden`, which would also stop the column sticking.
          */}
          <div
            className={`order-2 px-6 pt-10 sm:px-10 max-lg:[clip-path:inset(0_-100vw_-100vh_-100vw)] lg:col-start-2 lg:row-start-1 lg:sticky lg:top-8 lg:self-start lg:px-10 lg:pt-0`}
          >
            <NametagForm />
          </div>
        </div>
      </div>

      {/* Outside the container: the footer is a black panel edge to edge, and
          it is also where the sticky column's row finally ends. */}
      <LandingFooter />
    </main>
  );
}
