/**
 * The left-hand visual: the CRT-head portrait from the design.
 *
 * The photograph has not been supplied yet, so this renders a placeholder at
 * the comp's aspect ratio. That keeps the page's proportions honest — the
 * surrounding layout will not shift when the real asset drops in.
 *
 * To swap in the photo:
 *   1. Put the cut-out (transparent PNG or WebP) at `public/hero-portrait.webp`.
 *   2. Replace the placeholder block below with:
 *
 *        import Image from "next/image";
 *        import portrait from "@/public/hero-portrait.webp";
 *        ...
 *        <Image src={portrait} alt="" priority className="h-full w-full object-contain object-bottom" />
 *
 *      A static import lets Next read the intrinsic size, so there is no layout
 *      shift and no width/height to keep in sync by hand.
 *
 * The screen cut-out is marked separately because that is where the 3D mark is
 * meant to sit — see the note on that element.
 */
export function HeroVisual({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative mx-auto aspect-[2/3] w-full max-w-[27rem] border border-dashed border-ink/25 lg:mx-0">
        {/*
          Stand-in for the CRT screen. Positioned to match where the screen sits
          in the comp, so the composition reads correctly before the photo
          arrives — and so the 3D canvas has a known box to mount into once we
          have settled what goes in it.
        */}
        <div className="absolute top-[14%] left-1/2 aspect-[4/3] w-[58%] -translate-x-1/2 border border-dashed border-ink/30 bg-ink/[0.04]" />

        <p className="absolute inset-x-0 bottom-6 px-6 text-center font-sans text-xs leading-relaxed text-ink/40">
          Portrait asset pending
          <br />
          <span className="text-ink/30">public/hero-portrait.webp</span>
        </p>
      </div>
    </div>
  );
}
