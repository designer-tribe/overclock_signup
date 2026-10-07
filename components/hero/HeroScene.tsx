"use client";

import { Canvas } from "@react-three/fiber";
import { usePointer } from "@/hooks/usePointer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Backdrop } from "./Backdrop";

/**
 * The WebGL layer behind the hero.
 *
 * Imported with `ssr: false` from the page — `Canvas` touches `document` on
 * mount, and there is nothing meaningful to server-render for it anyway.
 */
export default function HeroScene() {
  const pointer = usePointer();
  const reducedMotion = useReducedMotion();

  return (
    <Canvas
      // Nothing here is lit or shaded, so the extra attachments a default
      // Canvas sets up would be paid for and never read.
      gl={{
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
        // The shader dithers its own output; skipping the sRGB conversion keeps
        // the colour ramp exactly as authored.
        stencil: false,
        depth: false,
      }}
      // Cap at 2 — above that a fullscreen fragment shader burns fill rate for
      // detail nobody can see.
      dpr={[1, 2]}
      // Only redraw when something changed. `frameloop="always"` would keep a
      // phone GPU at 60fps forever on what is mostly a static page.
      frameloop={reducedMotion ? "demand" : "always"}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <Backdrop pointer={pointer} intensity={reducedMotion ? 0 : 1} />
    </Canvas>
  );
}
