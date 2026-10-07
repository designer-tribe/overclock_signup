"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import {
  EffectComposer,
  Bloom,
  Scanline,
  Vignette,
  ChromaticAberration,
  Noise,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { usePointer } from "@/hooks/usePointer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { Mark } from "./Mark";

/** Matches the dark CRT screen the mark sits on. */
const SCREEN_BACKGROUND = "#0c0f0e";

export default function MarkScene() {
  const pointer = usePointer();
  const reducedMotion = useReducedMotion();

  return (
    <Canvas
      camera={{ position: [0, 0, 3.5], fov: 38 }}
      dpr={[1, 2]}
      // `demand` under reduced motion: with the animation held at its rest pose
      // there is nothing to redraw, so the GPU should not be running a loop.
      frameloop={reducedMotion ? "demand" : "always"}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl, scene }) => {
        scene.background = new THREE.Color(SCREEN_BACKGROUND);
        // ACES keeps the bright cream from clipping where bloom piles onto the
        // specular highlight.
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <Mark pointer={pointer} intensity={reducedMotion ? 0 : 1} />

      {/* Key light low and to the left, as the comp has it. */}
      <directionalLight position={[-3, -1.5, 3]} intensity={2.4} color="#fff4e2" />
      <directionalLight position={[2.5, 3, 1.5]} intensity={0.9} color="#cfe3ff" />
      <ambientLight intensity={0.25} />

      {/*
        Lightformers rather than an HDRI preset: `<Environment preset="...">`
        fetches from a CDN at runtime, which both costs a request and fails
        outright on a restricted network. Children are rendered to a cubemap
        locally, so the reflections ship with the bundle.
      */}
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[-2.5, -1, 2]}
          scale={[4, 3, 1]}
          color="#fff1dc"
        />
        <Lightformer
          form="rect"
          intensity={1.1}
          position={[3, 2, 1]}
          scale={[3, 4, 1]}
          color="#9fc4e8"
        />
        <Lightformer
          form="ring"
          intensity={0.8}
          position={[0, 0, -3]}
          scale={5}
          color="#ffffff"
        />
      </Environment>

      {/*
        CRT treatment. The mark is being displayed on a 1980s monitor, so it
        should carry the monitor's artefacts, not look like a clean 3D render
        pasted onto a photo.
      */}
      <EffectComposer>
        {/* Phosphor glow. High threshold so only the lit edges bloom. */}
        <Bloom
          intensity={0.85}
          luminanceThreshold={0.55}
          luminanceSmoothing={0.3}
          mipmapBlur
        />
        {/* Shadow-mask misconvergence — a few tenths of a pixel is plenty. */}
        <ChromaticAberration
          offset={[0.0004, 0.0007]}
          radialModulation={false}
          modulationOffset={0}
        />
        <Scanline blendFunction={BlendFunction.OVERLAY} density={1.6} opacity={0.18} />
        {/*
          Kept low on purpose. Anything above ~0.1 reads as dirt on the mark
          rather than tube noise, and chromatic aberration then smears the
          individual noise pixels into stray coloured specks.
        */}
        <Noise premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.07} />
        <Vignette eskil={false} offset={0.22} darkness={0.85} />
      </EffectComposer>
    </Canvas>
  );
}
