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
const MARK_COUNT = 7200;
const DRIFT_COUNT = 900;
const TOTAL = MARK_COUNT + DRIFT_COUNT;

/*
  The mark's size and position are not constants: they are handed in every frame
  from a measured element in the page, because the canvas covers the whole
  viewport while the mark belongs in one column of it. See `ParticleMark`.
*/

/** Thickness in Z. Thin on purpose: a deep cloud stops reading as the logo. */
const DEPTH = 0.1;
/** How far mark particles start from home, so the logo assembles on load. */
const SCATTER = 3.4;

/**
 * Drifters enter from just outside the edges of the whole page, not from a ring
 * of fixed radius around the mark and not from the bounds of some box the mark
 * sits in. Either of those is a shape, and a shape inside the frame is one you
 * can see: particles blinking into existence along an invisible line in mid-air.
 * Coming in past the page's own edges reads as traffic arriving from somewhere.
 */
const SPAWN_MARGIN = 0.4;
/** Past this much outside the frame a stray is recycled rather than chased. */
const CULL_MARGIN = 1.6;
/**
 * Where a drifter counts as arrived, as a fraction of the mark's size. Set to
 * just inside the ring rather than to the centre: the middle of this mark is
 * the counter, so absorbing at the origin would send a stream straight through
 * the logo and fill the one part of it that has to stay empty.
 */
const ABSORB_FRACTION = 0.47;

/*
  The mark turns as a slow swing rather than a full revolution. It is a flat
  ring 0.1 units thick: carried all the way round Y it spends a good part of
  every cycle edge-on, where the logo collapses to a bright line and stops being
  the logo. A bounded sweep keeps the dimensionality — the near side passes in
  front, the far side behind — without ever losing the shape.
*/
const ROTATION_SPEED = 0.16; // rad/s through the swing
const ROTATION_SWING = 0.55; // radians either side of front-on, about 31°

/*
  Underdamped on purpose (ζ ≈ 0.5). A critically damped spring walks each
  particle back to its home along a straight line and parks it, which is what
  made the first version snap shut the moment the cursor left. This one
  overshoots and settles, so a broken mark drifts back together.
*/
const SPRING = 6;
const DAMPING = 2.4;
/** Pull toward the mark, and the tangential component that curves the path. */
const DRIFT_PULL = 0.85;
const DRIFT_SWIRL = 0.5;

/** Cursor influence: how far it reaches, and how hard it shoves. */
const CURSOR_RADIUS = 1.3;
const CURSOR_FORCE = 34;

/*
  Nothing in this scene is ever completely still.

  `WANDER_IDLE` is a constant per-particle sway, small enough that the formed
  mark only shimmers. `WANDER_BURST` is added on top in proportion to how
  recently a particle was hit by the cursor, and `SPRING_RELEASE` slackens that
  particle's spring by the same measure — so a scattered particle floats for a
  while under its own momentum before the pull home wins. `DISTURB_DECAY` is how
  fast that memory fades: at 0.55/s a particle is still visibly loose a couple
  of seconds after the cursor has gone.
*/
const WANDER_FREQ = 0.9;
const WANDER_IDLE = 0.22;
const WANDER_BURST = 3.2;
const SPRING_RELEASE = 0.82;
const DISTURB_DECAY = 0.55;

/** How fast the cursor's own position catches up, per second. */
const POINTER_EASE = 11;

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
  /** Per-particle phase offset, so the idle sway is not one synchronised pulse. */
  phases: Float32Array;
  /** How recently the cursor hit each particle, 1 down to 0. */
  disturb: Float32Array;
  /** Half-extents of the visible frame at z=0, refreshed each step. */
  halfWidth: number;
  halfHeight: number;
  /**
   * Where the mark sits and how big it is, in world units. Set from a measured
   * element in the page before each step — the canvas is the whole viewport,
   * but the mark belongs in one column of it.
   */
  centreX: number;
  centreY: number;
  scale: number;
  /** Whether the eased cursor has a position yet, or must snap to its first. */
  pointerPrimed: boolean;
  /** Reused every step rather than allocated — see the note above. */
  scratch: {
    plane: THREE.Plane;
    ray: THREE.Raycaster;
    pointer: THREE.Vector3;
    /** The cursor, eased — raw pointer jumps would crack the mark open. */
    easedPointer: THREE.Vector3;
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
  halfWidth: number,
  halfHeight: number,
  centreX: number,
  centreY: number,
  scale: number,
): ParticleSystem {
  const homes = new Float32Array(TOTAL * 3);
  const positions = new Float32Array(TOTAL * 3);
  const velocities = new Float32Array(TOTAL * 3);
  const colors = new Float32Array(TOTAL * 3);
  const sizes = new Float32Array(TOTAL);
  const phases = new Float32Array(TOTAL);
  const disturb = new Float32Array(TOTAL);

  const markHomes = sampleMarkPoints(MARK_COUNT, DEPTH);
  const colour = new THREE.Color();
  const scatter = animated ? SCATTER : 0;

  for (let i = 0; i < TOTAL; i++) {
    const ix = i * 3;
    const isMark = i < MARK_COUNT;

    if (isMark) {
      // Homes stay in the unit box the sampler produced; the step scales them
      // to whatever frame is current, so a resize moves the mark rather than
      // needing the whole cloud rebuilt.
      homes[ix] = markHomes[ix];
      homes[ix + 1] = markHomes[ix + 1];
      homes[ix + 2] = markHomes[ix + 2];
      positions[ix] =
        centreX + homes[ix] * scale + (Math.random() - 0.5) * scatter;
      positions[ix + 1] =
        centreY + homes[ix + 1] * scale + (Math.random() - 0.5) * scatter;
      positions[ix + 2] = homes[ix + 2] * scale + (Math.random() - 0.5) * scatter;
    } else {
      // Drifters have no home; they are steered toward the mark instead.
      spawnDrifter(positions, ix, halfWidth, halfHeight);
      // Spread the first arrivals through their journey rather than releasing
      // the whole pool from the edges at once, which reads as a single wave.
      positions[ix] *= 0.2 + Math.random() * 0.8;
      positions[ix + 1] *= 0.2 + Math.random() * 0.8;
    }

    phases[i] = Math.random() * Math.PI * 2;

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
    phases,
    disturb,
    halfWidth,
    halfHeight,
    centreX,
    centreY,
    scale,
    pointerPrimed: false,
    scratch: {
      plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
      ray: new THREE.Raycaster(),
      pointer: new THREE.Vector3(),
      easedPointer: new THREE.Vector3(),
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
  viewportWidth: number,
  viewportHeight: number,
  elapsed: number,
  delta: number,
  intensity: number,
): void {
  const { homes, positions, velocities, phases, disturb, scratch } = system;

  // Clamp the step: a backgrounded tab resumes with a delta of seconds, and one
  // integration over that would fling every particle out of frame.
  const dt = Math.min(delta, 1 / 30);

  // Kept current rather than captured once, so a resize moves where particles
  // enter instead of leaving them streaming in from an edge that has moved.
  const halfWidth = viewportWidth / 2;
  const halfHeight = viewportHeight / 2;
  system.halfWidth = halfWidth;
  system.halfHeight = halfHeight;

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

  if (cursorActive) {
    if (system.pointerPrimed) {
      // Exponential ease, framed in dt so the feel does not change with the
      // frame rate. A raw pointer position would jump across the mark between
      // frames and shear it rather than push it.
      scratch.easedPointer.lerp(scratch.pointer, 1 - Math.exp(-POINTER_EASE * dt));
    } else {
      scratch.easedPointer.copy(scratch.pointer);
      system.pointerPrimed = true;
    }
  } else {
    system.pointerPrimed = false;
  }
  const px = scratch.easedPointer.x;
  const py = scratch.easedPointer.y;

  const pull = DRIFT_PULL * intensity;
  const swirl = DRIFT_SWIRL * intensity;
  const disturbKept = Math.exp(-DISTURB_DECAY * dt);
  const cullX = halfWidth + CULL_MARGIN;
  const cullY = halfHeight + CULL_MARGIN;
  const { centreX, centreY, scale } = system;
  const absorbRadius = scale * ABSORB_FRACTION;

  for (let i = 0; i < TOTAL; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;

    let ax: number;
    let ay: number;
    let az: number;

    // Fades whether or not the cursor is anywhere near, so a particle knocked
    // loose keeps some of its freedom for a second or two afterwards.
    const loose = (disturb[i] *= disturbKept);

    if (i < MARK_COUNT) {
      // Rotate the home about Y, then pull the particle toward it. The pull
      // slackens in proportion to how recently the cursor hit it, which is what
      // lets a broken mark drift rather than snap shut.
      const spring = SPRING * (1 - SPRING_RELEASE * loose);
      const hx = homes[ix] * scale;
      const hz = homes[iz] * scale;
      ax = (centreX + hx * cos + hz * sin - positions[ix]) * spring;
      ay = (centreY + homes[iy] * scale - positions[iy]) * spring;
      az = (hz * cos - hx * sin - positions[iz]) * spring;
    } else {
      const dx = centreX - positions[ix];
      const dy = centreY - positions[iy];
      const dz = -positions[iz];
      const dist = Math.hypot(dx, dy, dz) || 1;

      // Either it has arrived, or the swirl has carried it out of sight; both
      // mean the same thing — put it back on an edge and let it come in again.
      if (
        dist < absorbRadius ||
        positions[ix] < -cullX ||
        positions[ix] > cullX ||
        positions[iy] < -cullY ||
        positions[iy] > cullY
      ) {
        spawnDrifter(positions, ix, halfWidth, halfHeight);
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
        if (falloff > disturb[i]) disturb[i] = falloff;
      }
    }

    // A small constant sway, swelling for anything the cursor has touched, so
    // nothing in the frame is ever quite still and scattered particles go on
    // floating instead of sitting where they were pushed.
    const wander = (WANDER_IDLE + WANDER_BURST * loose) * intensity;
    const w = elapsed * WANDER_FREQ + phases[i];
    ax += Math.sin(w) * wander;
    ay += Math.cos(w * 1.3) * wander;
    az += Math.sin(w * 0.7) * wander * 0.5;

    velocities[ix] += (ax - velocities[ix] * DAMPING) * dt;
    velocities[iy] += (ay - velocities[iy] * DAMPING) * dt;
    velocities[iz] += (az - velocities[iz] * DAMPING) * dt;

    positions[ix] += velocities[ix] * dt;
    positions[iy] += velocities[iy] * dt;
    positions[iz] += velocities[iz] * dt;
  }

  system.points.geometry.attributes.position.needsUpdate = true;
}

/**
 * Puts one drifter just outside a randomly chosen edge of the visible frame.
 *
 * The edge is picked in proportion to its length, so a wide frame takes in more
 * along the top and bottom than down the sides. Picking one of four at even
 * odds would crowd the short edges, and on a tall column like this one that is
 * visible as two dense vertical streams.
 */
function spawnDrifter(
  positions: Float32Array,
  ix: number,
  halfWidth: number,
  halfHeight: number,
): void {
  const spanX = halfWidth + SPAWN_MARGIN;
  const spanY = halfHeight + SPAWN_MARGIN;
  const vertical = Math.random() * (spanX + spanY) < spanY;

  if (vertical) {
    positions[ix] = Math.random() < 0.5 ? -spanX : spanX;
    positions[ix + 1] = (Math.random() * 2 - 1) * spanY;
  } else {
    positions[ix] = (Math.random() * 2 - 1) * spanX;
    positions[ix + 1] = Math.random() < 0.5 ? -spanY : spanY;
  }
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
