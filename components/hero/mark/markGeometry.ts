import * as THREE from "three";

/**
 * The Overclock mark as a 3D form: a closed rounded-triangle path, swept into a
 * tube.
 *
 * The path is built from real geometry rather than approximated with a polar
 * function like `r = 1 + a·cos(3θ)`. That function is three lines, but its sides
 * bulge outward, and a logo's sides have to read as straight — the corner radius
 * has to be a number we control, not a side effect of an amplitude.
 *
 * So: an equilateral triangle, with each corner replaced by a tangent circular
 * arc, sampled into points and run through a closed Catmull-Rom curve.
 */

type RoundedTriangleOptions = {
  /** Circumradius of the underlying triangle, before the corners are rounded. */
  radius: number;
  /** Corner arc radius. Clamped below to whatever the sides can actually fit. */
  cornerRadius: number;
  /** Sample count per corner arc. */
  arcSegments?: number;
  /**
   * Sample count per straight side. Straights need intermediate points too:
   * Catmull-Rom through only the two endpoints would bow the side outward,
   * which is the exact flaw the arc construction exists to avoid.
   */
  sideSegments?: number;
};

function roundedTrianglePoints({
  radius,
  cornerRadius,
  arcSegments = 24,
  sideSegments = 10,
}: RoundedTriangleOptions): THREE.Vector3[] {
  // Corners at 90°, 210°, 330° — point-up, matching the mark.
  const corners = [0, 1, 2].map((i) => {
    const angle = Math.PI / 2 + (i * 2 * Math.PI) / 3;
    return new THREE.Vector2(Math.cos(angle) * radius, Math.sin(angle) * radius);
  });

  // For an equilateral triangle the interior angle is 60°, so the tangent
  // points sit `r / tan(30°)` from the corner. Two of those must fit inside one
  // side or the arcs would overlap and the path would self-intersect.
  const sideLength = corners[0].distanceTo(corners[1]);
  const maxCornerRadius = (sideLength / 2) * Math.tan(Math.PI / 6);
  const r = Math.min(cornerRadius, maxCornerRadius * 0.999);

  const points: THREE.Vector3[] = [];

  for (let i = 0; i < 3; i++) {
    const current = corners[i];
    const previous = corners[(i + 2) % 3];
    const next = corners[(i + 1) % 3];

    const toPrevious = previous.clone().sub(current).normalize();
    const toNext = next.clone().sub(current).normalize();

    const halfAngle = Math.acos(THREE.MathUtils.clamp(toPrevious.dot(toNext), -1, 1)) / 2;
    const tangentDistance = r / Math.tan(halfAngle);
    const centreDistance = r / Math.sin(halfAngle);

    const bisector = toPrevious.clone().add(toNext).normalize();
    const centre = current.clone().add(bisector.clone().multiplyScalar(centreDistance));

    const entry = current.clone().add(toPrevious.clone().multiplyScalar(tangentDistance));
    const exit = current.clone().add(toNext.clone().multiplyScalar(tangentDistance));

    const startAngle = Math.atan2(entry.y - centre.y, entry.x - centre.x);
    const endAngle = Math.atan2(exit.y - centre.y, exit.x - centre.x);

    // Always sweep the short way, or the arc would wrap the long way round the
    // circle and turn the corner inside out.
    let sweep = endAngle - startAngle;
    while (sweep > Math.PI) sweep -= 2 * Math.PI;
    while (sweep < -Math.PI) sweep += 2 * Math.PI;

    for (let s = 0; s <= arcSegments; s++) {
      const angle = startAngle + (sweep * s) / arcSegments;
      points.push(
        new THREE.Vector3(
          centre.x + Math.cos(angle) * r,
          centre.y + Math.sin(angle) * r,
          0,
        ),
      );
    }

    // Straight run from this corner's exit to the next corner's entry.
    const nextCurrent = corners[(i + 1) % 3];
    const nextToPrevious = current.clone().sub(nextCurrent).normalize();
    const nextEntry = nextCurrent
      .clone()
      .add(nextToPrevious.multiplyScalar(tangentDistance));

    for (let s = 1; s < sideSegments; s++) {
      const t = s / sideSegments;
      points.push(
        new THREE.Vector3(
          THREE.MathUtils.lerp(exit.x, nextEntry.x, t),
          THREE.MathUtils.lerp(exit.y, nextEntry.y, t),
          0,
        ),
      );
    }
  }

  return points;
}

/**
 * Tube swept along the rounded-triangle path.
 *
 * `centripetal` parameterisation, because `chordal` and the default `catmullrom`
 * both overshoot where the arc meets the straight — a visible kink at exactly
 * the place the eye checks a logo.
 */
export function createMarkGeometry({
  radius = 1,
  cornerRadius = 0.34,
  tubeRadius = 0.2,
  tubularSegments = 420,
  radialSegments = 32,
}: Partial<RoundedTriangleOptions & {
  tubeRadius: number;
  tubularSegments: number;
  radialSegments: number;
}> = {}): THREE.TubeGeometry {
  const points = roundedTrianglePoints({ radius, cornerRadius });
  const curve = new THREE.CatmullRomCurve3(points, true, "centripetal");

  return new THREE.TubeGeometry(
    curve,
    tubularSegments,
    tubeRadius,
    radialSegments,
    true,
  );
}
