import Image from "next/image";
import portrait from "@/public/hero-portrait.webp";

/**
 * The left-hand visual: the CRT-head portrait from the design.
 *
 * Statically imported so Next reads the intrinsic size (1218×1414) and
 * generates the blur placeholder — no width/height to keep in sync by hand, and
 * no layout shift as it loads.
 *
 * `priority` because this is the largest element above the fold: left to lazy
 * load it would be the page's LCP and would arrive late.
 */
export function HeroVisual({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Image
        src={portrait}
        // Decorative: the headline beside it already carries the meaning, and
        // describing the picture here would only repeat it to a screen reader.
        alt=""
        priority
        placeholder="blur"
        // Caps the request to roughly what the layout can actually use, rather
        // than letting the browser assume full viewport width.
        sizes="(min-width: 1024px) 28rem, (min-width: 640px) 60vw, 90vw"
        className="mx-auto h-auto w-full max-w-[28rem] lg:mx-0"
      />
    </div>
  );
}
