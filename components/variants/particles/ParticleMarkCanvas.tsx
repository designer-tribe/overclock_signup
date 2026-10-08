"use client";

import type { RefObject } from "react";
import dynamic from "next/dynamic";

/**
 * Client boundary around the WebGL scene.
 *
 * `ssr: false` is only allowed from a client component in Next 16, which is the
 * whole reason this file exists apart from the variant that renders it. It also
 * keeps three out of the shared bundle: variations 1 and 2 never load it.
 *
 * The scene genuinely cannot render on the server — it samples the mark with a
 * canvas 2D hit test, and there is no `document` to measure against.
 *
 * No `loading` fallback here: the variant draws the flat mark inside the anchor
 * box itself, where it is in the right place and at the right size. One drawn
 * from in here would be centred on the whole page instead, over the form.
 */
const MarkScene = dynamic(() => import("./MarkScene").then((m) => m.MarkScene), {
  ssr: false,
});

export function ParticleMarkCanvas({
  anchorRef,
  onReady,
  className = "",
}: {
  anchorRef: RefObject<HTMLElement | null>;
  onReady: () => void;
  className?: string;
}) {
  return (
    <div className={className} aria-hidden>
      <MarkScene anchorRef={anchorRef} onReady={onReady} />
    </div>
  );
}
