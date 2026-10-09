import Image from "next/image";
import portrait from "@/assets/ahmed-haque.png";

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
      {/*
        No height of its own: the portrait is the tallest thing in it, so it
        sets the card's height and fills it edge to edge. Given a minimum
        instead, the cutout floats in a band of teal with his head short of the
        top, which is not how the comp has him.
      */}
      <div className="flex items-stretch bg-teal shadow-[0_6px_0_0_var(--color-ink)]">
        {/*
          The portrait is a cutout on transparency, so the teal is what shows
          behind him and the block needs no padding of its own — he stands on
          the card's own edges. `object-bottom` keeps his shoulders on the
          bottom edge whatever height the text gives the card; anchored to the
          centre he floats, and anchored to the top he is cropped at the chin.
        */}
        <div className="w-32 shrink-0 self-end sm:w-40">
          <Image
            src={portrait}
            alt=""
            sizes="(min-width: 640px) 160px, 128px"
            className="h-auto w-full"
          />
        </div>

        <div className="flex min-w-0 flex-col justify-center p-5 pl-4 sm:p-6 sm:pl-5">
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
