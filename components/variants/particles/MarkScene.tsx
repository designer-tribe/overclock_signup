"use client";

import type { RefObject } from "react";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ParticleMark } from "./ParticleMark";

/**
 * The WebGL surface for the particle mark.
 *
 * Kept deliberately bare: no lights, no shadows, no controls, and no
 * postprocessing. The particles carry their own colour and the material is
 * unlit, so none of that machinery would change a pixel — except bloom, which
 * was tried and removed. The mark is a thin ring one particle wide in places;
 * bloom spread every dot into a halo and the ring dissolved into an even haze,
 * which is precisely the shape information the logo is made of. On black, a
 * crisp additive dot already reads as light.
 *
 * There is no `fallback` on the Canvas: where WebGL is missing the scene never
 * mounts, `onReady` never fires, and the flat mark the variant draws inside the
 * anchor box simply stays. One drawn from in here would be centred on the whole
 * page instead, since that is what this canvas covers.
 */
export function MarkScene({
  anchorRef,
  onReady,
}: {
  anchorRef: RefObject<HTMLElement | null>;
  onReady: () => void;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <Canvas
      /*
        dpr is capped at 1.5 rather than the device's own: at this particle
        count the cost scales with pixels filled, and the dots are small enough
        that the last half-step of sharpness is not worth the frames.
      */
      dpr={[1, 1.5]}
      // Transparent, so the page's black shows through and there is one source
      // of truth for the background colour.
      gl={{ antialias: false, alpha: true }}
      camera={{ position: [0, 0, 6], fov: 45 }}
      // A still scene need not be redrawn sixty times a second.
      frameloop={reducedMotion ? "demand" : "always"}
      /*
        The canvas lies behind the page and takes no pointer events of its own,
        so r3f is pointed at the document for them instead. Without this the
        cursor would never reach the mark at all. `client` because the canvas is
        fixed to the viewport, which is what clientX/clientY are measured from.
      */
      eventSource={typeof document === "undefined" ? undefined : document.body}
      eventPrefix="client"
    >
      <ParticleMark
        intensity={reducedMotion ? 0 : 1}
        anchorRef={anchorRef}
        onReady={onReady}
      />
    </Canvas>
  );
}
