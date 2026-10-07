import { MarkCanvas } from "./mark/MarkCanvas";

/**
 * The left-hand visual: the CRT-head portrait, with the Overclock mark rendered
 * live in 3D inside the screen.
 *
 * The photograph has not been supplied yet, so the surrounding frame is a
 * placeholder at the comp's aspect ratio. That keeps the page's proportions
 * honest — the layout will not shift when the real asset drops in.
 *
 * To swap in the photo:
 *   1. Put the cut-out (transparent PNG or WebP) at `public/hero-portrait.webp`.
 *   2. Replace the dashed placeholder frame with:
 *
 *        import Image from "next/image";
 *        import portrait from "@/public/hero-portrait.webp";
 *        ...
 *        <Image src={portrait} alt="" priority className="..." />
 *
 *      A static import lets Next read the intrinsic size, so there is no layout
 *      shift and no width/height to keep in sync by hand.
 *   3. Nudge SCREEN_RECT below until the canvas lines up with the screen in the
 *      photo, and raise the canvas above the image in the stacking order.
 *
 * The screen rectangle is kept as named constants rather than inline classes
 * because step 3 is a fiddly, repeated adjustment, and it should be obvious
 * where to make it.
 */
const SCREEN_RECT = {
  top: "14%",
  width: "58%",
  /** The glass is roughly 4:3, as a CRT of that era would be. */
  aspect: "4 / 3",
} as const;

export function HeroVisual({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative mx-auto aspect-[2/3] w-full max-w-[27rem] border border-dashed border-ink/25 lg:mx-0">
        {/* The CRT screen: dark glass with the mark rendered into it. */}
        <div
          className="absolute left-1/2 -translate-x-1/2 overflow-hidden bg-[#0c0f0e]"
          style={{
            top: SCREEN_RECT.top,
            width: SCREEN_RECT.width,
            aspectRatio: SCREEN_RECT.aspect,
            // CRT glass is not a flat rectangle — the corners are pulled in.
            borderRadius: "14% / 18%",
          }}
        >
          <MarkCanvas />

          {/* Specular sheen across the glass, above the canvas. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.03)_28%,transparent_55%)]"
          />
        </div>

        <p className="absolute inset-x-0 bottom-6 px-6 text-center font-sans text-xs leading-relaxed text-ink/40">
          Portrait asset pending
          <br />
          <span className="text-ink/30">public/hero-portrait.webp</span>
        </p>
      </div>
    </div>
  );
}
