import Image from "next/image";
import portrait from "@/assets/ahmed-haque.png";
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
 * The badge column is the comp's 628px card and the copy takes what is left —
 * from xl. At lg that would leave the headline a sliver, so the two split
 * evenly there instead.
 */
const COLUMNS =
  "lg:grid-cols-2 lg:gap-x-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,39.25rem)]";

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

          <div className="relative pt-10 lg:pt-[var(--form-top)]">
            <PixelSteps />
            <NametagForm
              className="max-w-[39.25rem]!"
              cardShadow="shadow-[14px_14px_0_0_var(--color-rust)]"
            />
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
 * bottom edge — the column starts at the top of the page, as the band does,
 * so that edge is simply `--band` down it.
 * Desktop only: below lg there is no gutter for them to step into.
 */
function PixelSteps() {
  const edge = "top-[var(--band)]";
  return (
    <div aria-hidden className="hidden lg:block">
      <span
        className={`absolute right-full ${edge} h-[4.1rem] w-[4.1rem] -translate-y-full bg-rust`}
      />
      <span
        className={`absolute right-[calc(100%+4.1rem)] ${edge} h-[7.3rem] w-[7.3rem] bg-teal`}
      />
      <span
        className={`absolute right-[calc(100%+11.4rem)] top-[calc(var(--band)+7.3rem)] h-[1.9rem] w-[1.9rem] bg-rust`}
      />
    </div>
  );
}
