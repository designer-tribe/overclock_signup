/**
 * The speaker: a teal card carrying the portrait and name, with the biography
 * running underneath it.
 *
 * The card and the prose are one block rather than two sections, because the
 * prose only makes sense as the card's continuation — it opens on the name the
 * card has just given.
 */

const NAME = "Ahmed Haque";
const ROLE = "Co-Founder and CEO, Overclock Accelerator";

export function SpeakerBio({ className = "" }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="speaker-name">
      {/*
        The hard offset shadow is the brand's "sitting on the page" treatment —
        the same one the submit button uses, deeper here because the block is
        an order of magnitude larger and 4px would read as a printing slip.
      */}
      <div className="flex items-center gap-5 bg-teal p-5 shadow-[0_6px_0_0_var(--color-ink)] sm:gap-6 sm:p-6">
        {/* PLACEHOLDER — awaiting the supplied portrait. Initials rather than a
            grey box or a generic avatar: at this size it reads as a considered
            stand-in rather than a missing image, and it holds the exact
            footprint the photograph will take. */}
        <div
          className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center bg-ink/25 font-serif text-xl text-white/80 sm:h-20 sm:w-20"
          aria-hidden
        >
          AH
        </div>

        <div className="min-w-0">
          <h2
            id="speaker-name"
            className="font-serif text-xl leading-tight text-white sm:text-2xl"
          >
            {NAME}
          </h2>
          <p className="mt-1.5 text-[0.9rem] leading-snug text-white/80">
            {ROLE}
          </p>
        </div>
      </div>

      <p className="mt-8 text-[0.95rem] leading-[1.75] text-ink/80">
        Ahmed Haque is the Co-Founder and CEO of the Overclock Accelerator, a
        training and consulting firm that helps organizations and executives
        navigate the changing AI landscape. Over the last decade, he has been a
        founder, executive, and advisor to numerous higher education
        institutions and ed-tech companies. Previously, he was the Chief
        Academic Officer at Trilogy Education, where his team helped train over
        100k adult learners to find work in the tech sector.
      </p>
    </section>
  );
}
