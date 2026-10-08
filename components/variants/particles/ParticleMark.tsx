"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
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
  const systemRef = useRef<ParticleSystem | null>(null);
  const hasPointer = useRef(false);

  // At zero intensity the simulation never runs, so the particles have to start
  // at their homes — otherwise reduced motion would show a scattered cloud that
  // never assembles.
  const animated = intensity > 0;

  useEffect(() => {
    const system = createParticleSystem(animated, dpr);
    systemRef.current = system;
    scene.add(system.points);

    return () => {
      scene.remove(system.points);
      disposeParticleSystem(system);
      systemRef.current = null;
    };
    // dpr is read once here and kept current by the effect below, so that
    // moving a window between displays does not rebuild the whole cloud.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene, animated]);

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
      state.clock.elapsedTime,
      delta,
      intensity,
    );
  });

  return null;
}
