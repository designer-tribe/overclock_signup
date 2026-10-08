"use client";

import dynamic from "next/dynamic";
import { MarkFallback } from "./MarkFallback";

/**
 * Client boundary around the WebGL scene.
 *
 * `ssr: false` is only allowed from a client component in Next 16, which is the
 * whole reason this file exists apart from the variant that renders it. It also
 * keeps three and postprocessing out of the shared bundle: variations 1 and 2
 * never load them.
 *
 * The scene genuinely cannot render on the server — it samples the mark with a
 * canvas 2D hit test, and there is no `document` to measure against.
 */
const MarkScene = dynamic(
  () => import("./MarkScene").then((m) => m.MarkScene),
  { ssr: false, loading: () => <MarkFallback /> },
);

export function ParticleMarkCanvas({ className = "" }: { className?: string }) {
  // relative, because both the canvas and the fallback position against it.
  return (
    <div className={`relative ${className}`}>
      <MarkScene />
    </div>
  );
}
