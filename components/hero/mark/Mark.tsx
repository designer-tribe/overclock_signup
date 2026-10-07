"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Pointer } from "@/hooks/usePointer";
import { createMarkGeometry } from "./markGeometry";

type MarkProps = {
  pointer: React.RefObject<Pointer>;
  /** 0 holds the mark still at its rest pose, 1 is full motion. */
  intensity: number;
};

export function Mark({ pointer, intensity }: MarkProps) {
  const group = useRef<THREE.Group>(null);

  // Built once and disposed with the component. Rebuilding this per render
  // would re-upload a 420×32 vertex buffer to the GPU on every frame.
  const geometry = useMemo(() => createMarkGeometry(), []);

  useFrame((state, delta) => {
    if (!group.current) return;

    // Clamp delta so a backgrounded tab doesn't resume with one huge jump.
    const step = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;

    // Rest pose is a slight three-quarter tilt — straight on, the form reads
    // flat and the rounded cross-section has nothing to catch the light with.
    const target = pointer.current;
    const influence = target.active * intensity;

    const targetRotationY = Math.sin(t * 0.25) * 0.35 * intensity + target.x * 0.4 * influence;
    const targetRotationX = -0.12 + Math.sin(t * 0.19) * 0.12 * intensity - target.y * 0.3 * influence;

    // Frame-rate independent exponential smoothing: identical easing on a 60Hz
    // and a 120Hz display, where a fixed lerp factor would differ.
    const ease = 1 - Math.exp(-3.5 * step);
    group.current.rotation.y += (targetRotationY - group.current.rotation.y) * ease;
    group.current.rotation.x += (targetRotationX - group.current.rotation.x) * ease;

    // Slow roll in plane, so the corners never settle into a static silhouette.
    group.current.rotation.z = Math.sin(t * 0.13) * 0.08 * intensity;
  });

  return (
    <group ref={group}>
      <mesh geometry={geometry} castShadow receiveShadow>
        {/*
          Cream rather than pure white: against the near-black screen, #fff
          clips to a flat silhouette under bloom and loses the cross-section
          shading that makes the form read as round.
        */}
        <meshPhysicalMaterial
          color="#efe7d8"
          roughness={0.28}
          metalness={0.05}
          clearcoat={0.7}
          clearcoatRoughness={0.25}
          // A little sheen keeps the grazing edges bright, which is what sells
          // the phosphor glow once bloom picks them up.
          sheen={0.4}
          sheenColor="#fff6e6"
          envMapIntensity={1.15}
        />
      </mesh>
    </group>
  );
}
