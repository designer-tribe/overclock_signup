"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useFrame, useStore, useThree } from "@react-three/fiber";
import {
  createParticleSystem,
  disposeParticleSystem,
  stepParticleSystem,
  type ParticleSystem,
} from "./particleSystem";

/**
 * Mounts the particle system into the scene and steps it each frame.
 *
 * The `THREE.Points` object is built imperatively and added to the scene rather
 * than described as JSX. The simulation writes to its position buffer every
 * frame, and anything a hook returns is frozen as far as the React Compiler is
 * concerned — a ref is the sanctioned place for state that is mutated outside
 * render, which is exactly what this is. It also keeps the component to its
 * actual job: lifecycle, measurement, and the frame callback.
 *
 * See `particleSystem.ts` for the simulation itself.
 */
export function ParticleMark({
  /** 0 holds the formed mark still; 1 is full motion. */
  intensity,
  /**
   * The element the mark is drawn over. The canvas covers the whole page so
   * particles can arrive from its edges, but the logo belongs in one column of
   * it — this is how it finds out which part.
   */
  anchorRef,
  /** Called once the cloud is in the scene, to retire the flat stand-in. */
  onReady,
}: {
  intensity: number;
  anchorRef: RefObject<HTMLElement | null>;
  onReady: () => void;
}) {
  const scene = useThree((state) => state.scene);
  const dpr = useThree((state) => state.viewport.dpr);
  const invalidate = useThree((state) => state.invalidate);
  // The store rather than a selector: the viewport is only needed once, to seed
  // the cloud. Subscribing to it would rebuild the whole thing on resize.
  const store = useStore();
  const systemRef = useRef<ParticleSystem | null>(null);
  const hasPointer = useRef(false);

  /*
    The anchor's box in CSS pixels, kept in a ref.

    Measured on resize and scroll rather than read in the frame callback:
    `getBoundingClientRect` forces the browser to flush layout, and doing that
    sixty times a second is the kind of thing that quietly halves a frame rate.
    The canvas is `position: fixed`, so viewport coordinates are what the
    conversion below needs — no scroll offset to add.
  */
  const anchorBox = useRef({ cx: 0.5, cy: 0.5, w: 0.5, h: 0.5 });

  useEffect(() => {
    const element = anchorRef.current;
    if (!element) return;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const vw = window.innerWidth || 1;
      const vh = window.innerHeight || 1;
      anchorBox.current = {
        cx: (rect.left + rect.width / 2) / vw,
        cy: (rect.top + rect.height / 2) / vh,
        w: rect.width / vw,
        h: rect.height / vh,
      };
      // Reduced motion runs the loop on demand, so a resize has to ask for the
      // one frame that redraws the mark in its new place.
      invalidate();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
    };
  }, [anchorRef, invalidate]);

  // At zero intensity the simulation never runs, so the particles have to start
  // at their homes — otherwise reduced motion would show a scattered cloud that
  // never assembles.
  const animated = intensity > 0;

  useEffect(() => {
    const { viewport } = store.getState();
    const placement = placeMark(anchorBox.current, viewport.width, viewport.height);
    const system = createParticleSystem(
      animated,
      dpr,
      viewport.width / 2,
      viewport.height / 2,
      placement.centreX,
      placement.centreY,
      placement.scale,
    );
    systemRef.current = system;
    scene.add(system.points);
    onReady();

    return () => {
      scene.remove(system.points);
      disposeParticleSystem(system);
      systemRef.current = null;
    };
    // dpr and the viewport are read once here and kept current by the effect
    // below and by each step, so that moving a window between displays or
    // resizing it does not rebuild the whole cloud.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, store, animated]);

  useEffect(() => {
    const system = systemRef.current;
    if (system) system.material.uniforms.uDpr.value = dpr;
  }, [dpr]);

  /*
    Whether the cursor is over the page at all.

    Tracked on the window, not on the canvas: the canvas is behind the content
    and takes no pointer events, so it never hears about the cursor itself. And
    r3f's own `state.pointer` reads (0, 0) until the first event — dead centre
    of the canvas — which taken on its own would hold an invisible cursor on the
    page and tear at the mark before anyone had touched the mouse.
  */
  useEffect(() => {
    const enter = () => {
      hasPointer.current = true;
    };
    const leave = () => {
      hasPointer.current = false;
    };
    // relatedTarget is null exactly when the pointer has left the window.
    const out = (event: PointerEvent) => {
      if (!event.relatedTarget) leave();
    };

    window.addEventListener("pointermove", enter, { passive: true });
    document.addEventListener("pointerout", out);
    window.addEventListener("pointercancel", leave);
    window.addEventListener("blur", leave);
    return () => {
      window.removeEventListener("pointermove", enter);
      document.removeEventListener("pointerout", out);
      window.removeEventListener("pointercancel", leave);
      window.removeEventListener("blur", leave);
    };
  }, []);

  useFrame((state, delta) => {
    const system = systemRef.current;
    if (!system) return;

    const { width, height } = state.viewport;
    const placement = placeMark(anchorBox.current, width, height);
    system.centreX = placement.centreX;
    system.centreY = placement.centreY;
    system.scale = placement.scale;

    stepParticleSystem(
      system,
      state.camera,
      state.pointer,
      hasPointer.current,
      width,
      height,
      state.clock.elapsedTime,
      delta,
      intensity,
    );
  });

  return null;
}

/** How much of the anchor's shorter side the mark fills. */
const MARK_FILL = 0.86;

/**
 * Converts the anchor's box — held as fractions of the viewport — into the
 * world units the simulation works in.
 *
 * Fractions rather than pixels so this survives a resize without re-measuring:
 * the element keeps its share of the page, and only the world size of the page
 * has changed.
 */
function placeMark(
  box: { cx: number; cy: number; w: number; h: number },
  viewportWidth: number,
  viewportHeight: number,
) {
  return {
    // The viewport's centre is the origin, and y runs up in three, down in CSS.
    centreX: (box.cx - 0.5) * viewportWidth,
    centreY: (0.5 - box.cy) * viewportHeight,
    scale:
      Math.min(box.w * viewportWidth, box.h * viewportHeight) * MARK_FILL,
  };
}
