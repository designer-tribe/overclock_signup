"use client";

import { useEffect, useRef, type RefObject } from "react";

export type Pointer = {
  /** Normalised to -1..1, origin at viewport centre, y up (matches WebGL clip space). */
  x: number;
  y: number;
  /** 0..1, origin top-left — handier for CSS-space effects. */
  u: number;
  v: number;
  /** 0 until the pointer first moves, so idle visitors don't get a jump from (0,0). */
  active: number;
};

/**
 * Pointer position in a ref, deliberately not in state.
 *
 * Putting this in `useState` would re-render the React tree on every mousemove,
 * which on a page with a <Canvas> in it means re-reconciling the scene graph
 * dozens of times a second. Consumers read `.current` inside `useFrame` or a
 * GSAP ticker instead, where per-frame reads are free.
 *
 * Touch devices get `pointermove` too, but nothing here depends on hover, so the
 * effects simply stay at their idle state until a finger moves.
 */
export function usePointer(): RefObject<Pointer> {
  const pointer = useRef<Pointer>({ x: 0, y: 0, u: 0.5, v: 0.5, active: 0 });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      const u = event.clientX / window.innerWidth;
      const v = event.clientY / window.innerHeight;
      pointer.current.u = u;
      pointer.current.v = v;
      pointer.current.x = u * 2 - 1;
      pointer.current.y = -(v * 2 - 1);
      pointer.current.active = 1;
    };

    // Let the shader settle back to centre when the cursor leaves the window.
    const onLeave = () => {
      pointer.current.active = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return pointer;
}
