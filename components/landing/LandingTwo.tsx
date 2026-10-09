import Image from "next/image";
import portrait from "@/assets/ahmed-haque.png";
import branch from "@/assets/landing-v2-branch.png";
import {
  LandingBrandBar,
  LandingHeroBackdrop,
  LandingHeroCopy,
} from "./LandingHero";
import { LandingFooter } from "./LandingFooter";
import { NametagForm } from "./NametagForm";
import { FileRow } from "./Takeaways";

/**
 * Landing V2 — the same content as V1, laid out as the comp has it: the badge
 * pinned in the hero rather than riding down a sticky column, a run of
 * pixel blocks stepping down off its left edge, and the takeaway pitch and the
 * speaker side by side underneath.
 *
 * Both rows share one column template, so the speaker block below lines up
 * under the badge above without either knowing about the other.
 */

/**
 * From xl the badge column is the badge's own width (V1's, 30rem) and the
 * copy takes what is left. At lg that would still leave the headline narrow,
 * so the two split evenly there instead.
 */
const COLUMNS =
  "lg:grid-cols-2 lg:gap-x-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,30rem)]";

const NAME = "Ahmed Haque";
const ROLE = "Co-Founder and CEO, Overclock Accelerator";

export function LandingTwo() {
  return (
    /*
      `--band` is the photograph's height; `--form-top` is how far down it the
      badge starts. The blocks beside the badge are placed from the band, so
      they sit on the photograph's bottom edge however tall the badge is.
    */
    <main
      className="relative min-h-dvh bg-paper text-ink"
      style={
        {
          "--band": "600px",
          "--form-top": "10rem",
        } as React.CSSProperties
      }
    >
      <LandingHeroBackdrop className="h-[var(--band)]" />

      {/*
        The figure on the branch, hanging off the page's left edge just under
        the photograph, as the comp has it — so it is placed against the page,
        not the centred container. Its top sits exactly on the photograph's
        bottom edge — under it, not over it.

        Decorative, and desktop only: below lg the form follows the copy
        directly and there is no free corner for it.
      */}
      <Image
        src={branch}
        alt=""
        sizes="352px"
        className="pointer-events-none absolute top-[var(--band)] left-0 hidden h-auto w-[22rem] lg:block"
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-6 sm:px-10 lg:px-14">
        {/*
          Above the badge's strap in the stack (z-30): on desktop the strap
          runs up off the top of the screen, and where it passes the lockup the
          logos have to stay legible.
        */}
        <LandingBrandBar className="relative z-30 h-[5.5rem] lg:absolute lg:top-[4.9rem] lg:right-14 lg:h-auto" />

        <div className={`grid ${COLUMNS}`}>
          {/* The copy sits on the photograph's lower edge, as in V1.
              `self-start`: stretched to the row, which the badge makes taller
              than the photograph, justify-end would drop the copy off it. */}
          <div className="flex min-h-[calc(var(--band)-5.5rem)] flex-col justify-end self-start pb-14 lg:min-h-[var(--band)]">
            <LandingHeroCopy />
          </div>

          {/* The same badge as V1, at V1's width. Below lg, clipped at the
              top as V1's is, so the strap stops at the photograph's edge. The wrapper is the badge's
              own width, so the steps hang off the badge's edge rather than
              the column's when the column is the wider of the two. */}
          <div className="pt-10 lg:pt-[var(--form-top)] max-lg:[clip-path:inset(0_-100vw_-100vh_-100vw)]">
            <div className="relative mx-auto max-w-[30rem]">
              <PixelSteps />
              <NametagForm />
            </div>
          </div>
        </div>

        <div className={`grid gap-y-16 pt-20 pb-24 lg:pt-24 ${COLUMNS}`}>
          <section>
            <h2 className="max-w-[28rem] font-serif text-[2rem] leading-[1.15] text-ink sm:text-[2.4rem]">
              More People Leaders Want a Say in AI Strategy
            </h2>
            {/* Transcribed from the comp, which does not quite parse — same
                copy as V1, flagged there for a final line. */}
            <p className="mt-4 max-w-[27rem] text-[0.95rem] leading-relaxed text-ink/75">
              Over AI is a workforce decisions, take the webinar and these
              takeaways as you plan for your teams!
            </p>
            <FileRow className="mt-12 max-w-[27.5rem] lg:mt-20" />
            <FileRow className="mt-5 max-w-[27.5rem]" kind="download" />
          </section>

          <section aria-labelledby="v2-speaker-name">
            <div className="flex items-center gap-6">
              {/* The cutout stands in a teal disc; `object-top` keeps his
                  face in the circle rather than his shoulders. */}
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full bg-teal sm:h-28 sm:w-28">
                <Image
                  src={portrait}
                  alt=""
                  fill
                  sizes="112px"
                  className="object-cover object-top pt-2"
                />
              </div>
              <div>
                <h2
                  id="v2-speaker-name"
                  className="font-serif text-[1.65rem] leading-tight sm:text-[1.9rem]"
                >
                  {NAME}
                </h2>
                <p className="mt-1.5 text-[0.92rem] text-ink/75">{ROLE}</p>
              </div>
            </div>

            <p className="mt-10 text-[0.95rem] leading-[1.75] text-ink/80 lg:mt-14">
              Ahmed Haque is the Co-Founder and CEO of the Overclock
              Accelerator, a training and consulting firm that helps
              organizations and executives navigate the changing AI landscape.
              Over the last decade, he has been a founder, executive, and
              advisor to numerous higher education institutions and ed-tech
              companies. Previously, he was the Chief Academic Officer at
              Trilogy Education, where his team helped train over 100k adult
              learners to find work in the tech sector.
            </p>
          </section>
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}

/**
 * The blocks stepping down off the badge's left edge: a rust cell resting on
 * the photograph's bottom edge, a large teal one hanging below it, and a small
 * rust one off the teal's lower corner. Sizes are the comp's, as a staircase
 * — each block's corner touches the next.
 *
 * Placed from the column's left edge (the badge's) and from the photograph's
 * bottom edge. The wrapper starts `--form-top` down the page, so that edge is
 * `--band - --form-top` down it.
 * Desktop only: below lg there is no gutter for them to step into.
 */
function PixelSteps() {
  const edge = "top-[calc(var(--band)-var(--form-top))]";
  return (
    <div aria-hidden className="hidden lg:block">
      <span
        className={`absolute right-full ${edge} h-[4.1rem] w-[4.1rem] -translate-y-full bg-rust`}
      />
      <span
        className={`absolute right-[calc(100%+4.1rem)] ${edge} h-[7.3rem] w-[7.3rem] bg-teal`}
      />
      <span
        className={`absolute right-[calc(100%+11.4rem)] top-[calc(var(--band)-var(--form-top)+7.3rem)] h-[1.9rem] w-[1.9rem] bg-rust`}
      />
    </div>
  );
}
