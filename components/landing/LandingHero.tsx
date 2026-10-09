import Image from "next/image";
import { Logo } from "@/components/brand/Logo";
import { HeroCopy } from "@/components/hero/HeroCopy";
import heroPhoto from "@/assets/landing-hero.webp";
import vyondLogo from "@/assets/vyond.png";

/**
 * The photo band at the top of the landing page, and the copy over it.
 *
 * The band is a layer rather than a section: it runs the full width behind the
 * page's own grid, so the form column can start at the top of the page and
 * overlap it, as the comp has it. Only its height is its own — everything
 * inside it is positioned by the page.
 */

export function LandingHeroBackdrop({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-x-0 top-0 overflow-hidden ${className}`}>
      {/*
        The photograph arrives already graded warm, so nothing is done to it
        here. An earlier stand-in was a black-and-white frame put through a
        sepia filter; running this one through the same filter would be grading
        a graded image, and it came out muddy.

        The supplied file also carried a soft alpha vignette on three sides,
        exported for a floating placement. It is cropped to the solid
        photograph in `assets/` — a hard-edged full-bleed band has nothing for
        a fade to fade into but the page, which reads as a dirty edge.
      */}
      <Image
        src={heroPhoto}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      {/*
        Two scrims doing different jobs. The flat one holds the whole band down
        far enough for white text anywhere on it; the gradient deepens the lower
        half, where the headline actually sits.

        Both are warm brown rather than the ink token. Ink is near-neutral, and
        over a warm photograph at this strength it cancels the grade — the band
        came out grey. They are light, because the photograph is already dark;
        the contrast figures they produce are in the README.
      */}
      <div className="absolute inset-0 bg-[#3a1a08]/12" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2a1206]/25 to-[#1b0c04]/65" />
    </div>
  );
}

/** The co-branding bar: the partner's lockup, then Overclock's. */
export function LandingBrandBar({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-end gap-5 ${className}`}>
      {/* Height set against the Overclock lockup beside it rather than from
          the file, which is why the asset is trimmed to the mark itself. */}
      <Image src={vyondLogo} alt="Vyond" className="h-5 w-auto" />

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
