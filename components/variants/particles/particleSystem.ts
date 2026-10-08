import * as THREE from "three";
import { sampleMarkPoints } from "./markPoints";

/**
 * The particle simulation, as plain functions over typed arrays.
 *
 * Two pools share one buffer and one draw call:
 *
 * - The **mark** pool springs to a home position inside the logo. The homes
 *   rotate and the particles chase them, so the shape turns without the group
 *   itself being rotated. That matters because the cursor pushes particles in
 *   world space: a rotated group would mean transforming the pointer into local
 *   space every frame, and the break would drift away from where the cursor
 *   actually looks like it is.
 * - The **drift** pool is the traffic around it. Each particle starts out wide,
 *   is pulled toward the mark with a sideways nudge so it curves in rather than
 *   dropping straight, and respawns at the edge once it arrives — so the stream
 *   keeps running instead of everything landing on the mark and going still.
 *
 * Deliberately not React: the arrays are mutated in place sixty times a second,
 * which is exactly what the React Compiler's immutability rules exist to stop
 * you doing to a hook's return value. Building the object here and handing it to
 * a ref keeps the mutation where it belongs and the component tiny.
 *
 * Nothing is allocated per step. At this particle count the arithmetic is
 * nothing; it is the per-frame garbage that would cost frames.
 */

/*
  The mark is a *thin ring* with a rounded-triangle counter, not a solid shape —
  so the particle count buys far less legibility per particle than a filled
  logo would, and the dots have to stay small or the ring closes up into a
  smear. Both numbers are set from how the shape reads, not from a budget: the
  loop below is a few thousand iterations of arithmetic, which costs nothing
  next to the fill rate.
*/
const MARK_COUNT = 5200;
const DRIFT_COUNT = 600;
const TOTAL = MARK_COUNT + DRIFT_COUNT;

/** The mark is sampled into a unit box, so this is its size in world units. */
const MARK_SCALE = 3;
/** Thickness in Z. Thin on purpose: a deep cloud stops reading as the logo. */
const DEPTH = 0.1;
/** How far mark particles start from home, so the logo assembles on load. */
const SCATTER = 3.4;

/** Where drifting particles live and respawn, in world units from the centre. */
const SPAWN_MIN = 2.8;
const SPAWN_MAX = 4.2;
/**
 * Inside this, a drifter has arrived and is sent back out. Set to just inside
 * the ring rather than to the centre: the middle of this mark is the counter,
 * so absorbing at the origin would send a stream straight through the logo and
 * fill the one part of it that has to stay empty.
 */
const ABSORB_RADIUS = MARK_SCALE * 0.47;

/*
  The mark turns as a slow swing rather than a full revolution. It is a flat
  ring 0.1 units thick: carried all the way round Y it spends a good part of
  every cycle edge-on, where the logo collapses to a bright line and stops being
  the logo. A bounded sweep keeps the dimensionality — the near side passes in
  front, the far side behind — without ever losing the shape.
*/
const ROTATION_SPEED = 0.16; // rad/s through the swing
const ROTATION_SWING = 0.55; // radians either side of front-on, about 31°
const SPRING = 9;
const DAMPING = 4.2;
/** Pull toward the mark, and the tangential component that curves the path. */
const DRIFT_PULL = 0.85;
const DRIFT_SWIRL = 0.5;

/** Cursor influence: how far it reaches, and how hard it shoves. */
const CURSOR_RADIUS = 1.15;
const CURSOR_FORCE = 40;

/*
  Mirrors --color-cream and --color-teal-light in globals.css. WebGL cannot read
  a CSS custom property, so this is the one duplicated pair in the palette.
*/
const CREAM = new THREE.Color("#f3ece0");
const TEAL = new THREE.Color("#6fbcad");
/** How many particles take the accent colour. */
const TEAL_SHARE = 0.14;

export type ParticleSystem = {
  points: THREE.Points;
  material: THREE.ShaderMaterial;
  homes: Float32Array;
  positions: Float32Array;
  velocities: Float32Array;
  /** Reused every step rather than allocated — see the note above. */
  scratch: {
    plane: THREE.Plane;
    ray: THREE.Raycaster;
    pointer: THREE.Vector3;
  };
};

/**
 * @param animated false places every mark particle at its home, so a reduced-
 *                 motion render — which never steps the simulation — still shows
 *                 the formed logo rather than a cloud that never comes together.
 * @param dpr      point size comes out in device pixels, so without this the
 *                 cloud is half as dense on a retina screen as on a normal one.
 */
export function createParticleSystem(
  animated: boolean,
  dpr: number,
): ParticleSystem {
  const homes = new Float32Array(TOTAL * 3);
  const positions = new Float32Array(TOTAL * 3);
  const velocities = new Float32Array(TOTAL * 3);
  const colors = new Float32Array(TOTAL * 3);
  const sizes = new Float32Array(TOTAL);

  const markHomes = sampleMarkPoints(MARK_COUNT, DEPTH);
  const colour = new THREE.Color();
  const scatter = animated ? SCATTER : 0;

  for (let i = 0; i < TOTAL; i++) {
    const ix = i * 3;
    const isMark = i < MARK_COUNT;

    if (isMark) {
      homes[ix] = markHomes[ix] * MARK_SCALE;
      homes[ix + 1] = markHomes[ix + 1] * MARK_SCALE;
      homes[ix + 2] = markHomes[ix + 2] * MARK_SCALE;
      positions[ix] = homes[ix] + (Math.random() - 0.5) * scatter;
      positions[ix + 1] = homes[ix + 1] + (Math.random() - 0.5) * scatter;
      positions[ix + 2] = homes[ix + 2] + (Math.random() - 0.5) * scatter;
    } else {
      // Drifters have no home; they are steered toward the mark instead.
      spawnDrifter(positions, ix);
    }

    colour.copy(Math.random() < TEAL_SHARE ? TEAL : CREAM);
    // The mark sits clearly brighter than the traffic around it. Without the
    // split the two pools average out into one even haze and the logo stops
    // being the thing you are looking at. Within each pool the brightness still
    // varies, so neither reads as a flat printed shape.
    colour.multiplyScalar(
      isMark ? 0.75 + Math.random() * 0.25 : 0.4 + Math.random() * 0.35,
    );
    colors[ix] = colour.r;
    colors[ix + 1] = colour.g;
    colors[ix + 2] = colour.b;

    // Mark dots stay small so the ring keeps its edge; drifters can be looser.
    sizes[i] = isMark ? 2.4 + Math.random() * 2.6 : 2 + Math.random() * 4;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uDpr: { value: dpr } },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
  });

  const points = new THREE.Points(geometry, material);
  // The cloud is always on screen and its bounds change every frame, so the
  // sphere three would compute from the initial positions is both wrong and
  // pointless — and when it is wrong, it culls the whole thing mid-rotation.
  points.frustumCulled = false;

  return {
    points,
    material,
    homes,
    positions,
    velocities,
    scratch: {
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      ray: new THREE.Raycaster(),
      pointer: new THREE.Vector3(),
    },
  };
}

export function disposeParticleSystem(system: ParticleSystem): void {
  system.points.geometry.dispose();
  system.material.dispose();
}

/**
 * Advances the simulation one frame.
 *
 * @param elapsed   seconds since the scene started, for the rotation angle
 * @param delta     seconds since the last frame
 * @param intensity 0 holds everything still, 1 is full motion
 * @param ndc       the pointer in normalised device coordinates
 * @param hasPointer whether the pointer is actually over the canvas. Not
 *                  inferable from `ndc`: it reads (0, 0) until the first
 *                  pointer event, and (0, 0) is the centre of the canvas — so
 *                  trusting it would hold the cursor in the middle of the mark
 *                  and blow the logo apart before anyone touched the mouse.
 */
export function stepParticleSystem(
  system: ParticleSystem,
  camera: THREE.Camera,
  ndc: THREE.Vector2,
  hasPointer: boolean,
  elapsed: number,
  delta: number,
  intensity: number,
): void {
  const { homes, positions, velocities, scratch } = system;

  // Clamp the step: a backgrounded tab resumes with a delta of seconds, and one
  // integration over that would fling every particle out of frame.
  const dt = Math.min(delta, 1 / 30);

  const angle = Math.sin(elapsed * ROTATION_SPEED) * ROTATION_SWING * intensity;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);

  // The cursor, projected onto the plane the mark sits in.
  let cursorActive = false;
  if (hasPointer && intensity > 0) {
    scratch.ray.setFromCamera(ndc, camera);
    cursorActive =
      scratch.ray.ray.intersectPlane(scratch.plane, scratch.pointer) !== null;
  }
  const px = scratch.pointer.x;
  const py = scratch.pointer.y;

  const pull = DRIFT_PULL * intensity;
  const swirl = DRIFT_SWIRL * intensity;

  for (let i = 0; i < TOTAL; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;

    let ax: number;
    let ay: number;
    let az: number;

    if (i < MARK_COUNT) {
      // Rotate the home about Y, then pull the particle toward it.
      const hx = homes[ix];
      const hz = homes[iz];
      ax = (hx * cos + hz * sin - positions[ix]) * SPRING;
      ay = (homes[iy] - positions[iy]) * SPRING;
      az = (hz * cos - hx * sin - positions[iz]) * SPRING;
    } else {
      const dx = -positions[ix];
      const dy = -positions[iy];
      const dz = -positions[iz];
      const dist = Math.hypot(dx, dy, dz) || 1;

      if (dist < ABSORB_RADIUS) {
        // Arrived. Back out to the edge, so the stream never thins out.
        spawnDrifter(positions, ix);
        velocities[ix] = 0;
        velocities[iy] = 0;
        velocities[iz] = 0;
        continue;
      }

      // Toward the mark, plus a tangential component — without it they fall
      // dead straight at the centre, which reads as rain rather than orbit.
      ax = (dx / dist) * pull - (dy / dist) * swirl;
      ay = (dy / dist) * pull + (dx / dist) * swirl;
      az = (dz / dist) * pull * 0.4;
    }

    if (cursorActive) {
      // Measured in screen-parallel X/Y only: the push should follow where the
      // cursor looks like it is, not how deep the particle sits.
      const dx = positions[ix] - px;
      const dy = positions[iy] - py;
      const distSq = dx * dx + dy * dy;
      if (distSq < CURSOR_RADIUS * CURSOR_RADIUS) {
        const dist = Math.sqrt(distSq) || 0.0001;
        // Squared falloff: firm at the centre, nothing at the edge, so the mark
        // tears open instead of wobbling as a whole.
        const falloff = 1 - dist / CURSOR_RADIUS;
        const push = (CURSOR_FORCE * falloff * falloff) / dist;
        ax += dx * push;
        ay += dy * push;
      }
    }

    velocities[ix] += (ax - velocities[ix] * DAMPING) * dt;
    velocities[iy] += (ay - velocities[iy] * DAMPING) * dt;
    velocities[iz] += (az - velocities[iz] * DAMPING) * dt;

    positions[ix] += velocities[ix] * dt;
    positions[iy] += velocities[iy] * dt;
    positions[iz] += velocities[iz] * dt;
  }

  system.points.geometry.attributes.position.needsUpdate = true;
}

/** Puts one drifter back on the outer ring, flattened to match the mark. */
function spawnDrifter(positions: Float32Array, ix: number): void {
  const theta = Math.random() * Math.PI * 2;
  const radius = SPAWN_MIN + Math.random() * (SPAWN_MAX - SPAWN_MIN);
  positions[ix] = Math.cos(theta) * radius;
  positions[ix + 1] = Math.sin(theta) * radius * 0.7;
  positions[ix + 2] = (Math.random() - 0.5) * 1.6;
}

/*
  Colour is carried as `aColor` rather than three's built-in `color` attribute:
  for a raw ShaderMaterial, `vertexColors` adds the USE_COLOR define but none of
  the declarations that come with it in the built-in shaders, so the attribute
  has to be declared here anyway.
*/
const VERTEX_SHADER = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uDpr;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Perspective-correct size: far particles shrink, which is the whole of
    // what makes depth readable in a flat point cloud.
    gl_PointSize = aSize * uDpr * (4.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;

  void main() {
    // A round dot drawn procedurally — a sprite texture for this would be a
    // request and a decode for what is two lines of maths.
    //
    // The falloff is deliberately tight: a wide gradient turns every dot into a
    // halo, and a few thousand haloes blending additively is a fog, not a mark.
    // This keeps a solid core with just enough edge to antialias.
    float d = length(gl_PointCoord - 0.5);
    float alpha = 1.0 - smoothstep(0.34, 0.5, d);
    if (alpha <= 0.0) discard;
    gl_FragColor = vec4(vColor, alpha);
  }
`;
