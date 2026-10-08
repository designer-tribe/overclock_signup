"use client";

import { useEffect, useRef } from "react";
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
 * actual job: lifecycle and the frame callback.
 *
 * See `particleSystem.ts` for the simulation itself.
 */
export function ParticleMark({
  /** 0 holds the formed mark still; 1 is full motion. */
  intensity,
}: {
  intensity: number;
}) {
  const scene = useThree((state) => state.scene);
  const gl = useThree((state) => state.gl);
  const dpr = useThree((state) => state.viewport.dpr);
  // The store rather than a selector: the viewport is only needed once, to seed
  // the spawn edges. Subscribing to it would rebuild the whole cloud on resize.
  const store = useStore();
  const systemRef = useRef<ParticleSystem | null>(null);
  const hasPointer = useRef(false);

  // At zero intensity the simulation never runs, so the particles have to start
  // at their homes — otherwise reduced motion would show a scattered cloud that
  // never assembles.
  const animated = intensity > 0;

  useEffect(() => {
    const { viewport } = store.getState();
    const system = createParticleSystem(
      animated,
      dpr,
      viewport.width / 2,
      viewport.height / 2,
    );
    systemRef.current = system;
    scene.add(system.points);

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
    Whether the cursor is over the canvas at all. r3f's `state.pointer` reads
    (0, 0) until the first pointer event and keeps its last value after the
    pointer leaves — and (0, 0) is the centre of the canvas, right on the mark.
    Taken on its own it would hold an invisible cursor in the middle of the logo
    and tear it open before anyone had touched the mouse.
  */
  useEffect(() => {
    const canvas = gl.domElement;
    const enter = () => {
      hasPointer.current = true;
    };
    const leave = () => {
      hasPointer.current = false;
    };
    canvas.addEventListener("pointermove", enter);
    canvas.addEventListener("pointerleave", leave);
    // A touch ends with no pointer anywhere, so the mark has to re-form.
    canvas.addEventListener("pointercancel", leave);
    return () => {
      canvas.removeEventListener("pointermove", enter);
      canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointercancel", leave);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const system = systemRef.current;
    if (!system) return;
    stepParticleSystem(
      system,
      state.camera,
      state.pointer,
      hasPointer.current,
      state.viewport.width,
      state.viewport.height,
      state.clock.elapsedTime,
      delta,
      intensity,
    );
  });

  return null;
}
