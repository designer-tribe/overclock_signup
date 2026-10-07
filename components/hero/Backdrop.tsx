"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { Pointer } from "@/hooks/usePointer";
import { fragmentShader, vertexShader } from "./shaders/backdrop.glsl";

/** Brand placeholders — replace once the real design arrives. */
const COLORS = {
  a: "#0a0a12",
  b: "#1d2b64",
  c: "#f27a54",
} as const;

type BackdropProps = {
  pointer: React.RefObject<Pointer>;
  /** Target motion level: 0 holds a near-flat wash, 1 is full motion. */
  intensity: number;
};

/**
 * Fullscreen shader quad.
 *
 * The vertex shader writes `position` straight to `gl_Position`, so a 2x2 plane
 * already covers clip space and the camera is irrelevant — no projection maths,
 * and resizing can never leave a gap at the edges.
 */
export function Backdrop({ pointer, intensity }: BackdropProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, viewport } = useThree();

  // Built once. Recreating the uniform object each render would hand the
  // material a new reference every frame and defeat three's caching.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uAspect: { value: 1 },
      uIntensity: { value: 0 },
      uColorA: { value: new THREE.Color(COLORS.a) },
      uColorB: { value: new THREE.Color(COLORS.b) },
      uColorC: { value: new THREE.Color(COLORS.c) },
    }),
    [],
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;

    // Clamp delta so a backgrounded tab doesn't resume with one huge jump.
    const step = Math.min(delta, 1 / 30);
    const u = material.uniforms;

    u.uTime.value += step;
    u.uAspect.value = size.width / Math.max(size.height, 1);

    // Frame-rate independent exponential smoothing: the same visual easing on a
    // 60Hz and a 120Hz display, where a fixed lerp factor would differ.
    const target = pointer.current;
    const pointerEase = 1 - Math.exp(-4 * step);
    u.uPointer.value.x += (target.x * target.active - u.uPointer.value.x) * pointerEase;
    u.uPointer.value.y += (target.y * target.active - u.uPointer.value.y) * pointerEase;

    const intensityEase = 1 - Math.exp(-2 * step);
    u.uIntensity.value += (intensity - u.uIntensity.value) * intensityEase;
  });

  return (
    // `frustumCulled` off: the geometry sits in clip space, so three's bounding
    // sphere test against the camera would sometimes cull a visible quad.
    <mesh frustumCulled={false} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
