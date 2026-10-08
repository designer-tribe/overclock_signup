import { MARK_PATH, MARK_VIEW_BOX } from "./markPoints";

/**
 * The mark drawn flat — what stands in for the particle version.
 *
 * Used twice: while the WebGL chunk is still loading, and in place of the
 * canvas on a device without WebGL. Either way the column has the logo in it
 * rather than being an empty black panel.
 *
 * It is not left showing behind the live canvas: the cursor is meant to break
 * the mark apart, and a static copy underneath would stay put while the
 * particles scatter off it.
 */
export function MarkFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <svg
        viewBox={MARK_VIEW_BOX}
        className="h-[42%] w-auto fill-cream opacity-20"
        role="img"
        aria-label="Overclock"
      >
        <path fillRule="evenodd" clipRule="evenodd" d={MARK_PATH} />
      </svg>
    </div>
  );
}
