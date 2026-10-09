import Image from "next/image";
import { Logo } from "@/components/brand/Logo";
import { HeroCopy } from "@/components/hero/HeroCopy";
import heroPhoto from "@/assets/variation-two-bg-2.webp";

/**
 * The photo band at the top of the landing page, and the copy over it.
 *
 * The band is a layer rather than a section: it runs the full width behind the
 * page's own grid, so the form column can start at the top of the page and
 * overlap it, as the comp has it. Only its height is its own — everything
 * inside it is positioned by the page.
 */

/* PLACEHOLDER — awaiting the supplied hero photograph.
   The comp's hero is a warm, orange-graded room shot. The stand-in is the
   workshop photograph already in the repo, which is the same kind of scene but
   black and white; the filter below grades it warm. When the real photograph
   lands, swap the import and drop the filter — a photo that is already graded
   must not be put through this a second time. */
const PLACEHOLDER_GRADE =
  "[filter:sepia(0.9)_saturate(1.9)_contrast(1.05)_brightness(0.92)]";

export function LandingHeroBackdrop({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-x-0 top-0 overflow-hidden ${className}`}>
      <Image
        src={heroPhoto}
        alt=""
        fill
        priority
        sizes="100vw"
        className={`object-cover object-center ${PLACEHOLDER_GRADE}`}
      />
      {/*
        Two scrims doing different jobs. The flat one holds the whole band down
        far enough for white text anywhere on it; the gradient deepens the lower
        half, where the headline actually sits.

        Both are a warm brown rather than the ink token. Ink is near-neutral,
        and laid over a sepia-graded photograph at this strength it cancels the
        warmth the grade just put there — the band came out grey. The band ends
        on a hard edge, as the comp has it, so neither fades out at the foot.
      */}
      <div className="absolute inset-0 bg-[#3a1a08]/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#2a1206]/15 via-[#2a1206]/40 to-[#1b0c04]/72" />
    </div>
  );
}

/** The co-branding bar: the partner's lockup, then Overclock's. */
export function LandingBrandBar({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-end gap-5 ${className}`}>
      {/* PLACEHOLDER — awaiting the VYOND lockup. Deliberately not drawn: this
          is someone else's mark and guessing at it would be worse than a gap.
          The box holds the right amount of room beside the Overclock logo. */}
      <span className="flex h-8 items-center rounded border border-dashed border-white/40 px-3 font-sans text-[0.7rem] font-semibold tracking-[0.2em] text-white/70 uppercase">
        Vyond
      </span>

      <span className="h-6 w-px bg-white/25" aria-hidden />

      <Logo className="h-7 shrink-0 text-white" />
    </div>
  );
}

/** The eyebrow pill, headline and standfirst that sit on the band. */
export function LandingHeroCopy({ className = "" }: { className?: string }) {
  return (
    <div className={`text-white ${className}`}>
      <p className="inline-flex rounded-full bg-paper px-4 py-2 font-sans text-[0.65rem] font-bold tracking-[0.16em] text-ink uppercase">
        Thank you for joining with us
      </p>

      <HeroCopy tone="light" className="mt-6 max-w-2xl" />

      <p className="mt-5 max-w-md text-[1.05rem] leading-relaxed text-white/85">
        Now let&rsquo;s map what it means for your people, your teams, and your
        strategy.
      </p>
    </div>
  );
}
