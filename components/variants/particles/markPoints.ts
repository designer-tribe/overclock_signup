/**
 * Turns the Overclock mark into a cloud of points.
 *
 * The shape comes from the brand SVG's own path rather than a traced bitmap or
 * a hand-placed point list, so the particles sit in exactly the mark the rest
 * of the page uses. Keeping it as a path also means no extra asset to ship and
 * nothing to regenerate if the logo changes — only this string.
 *
 * Sampling is rejection-based against `Path2D` with the even-odd rule, which is
 * what carves the triangle out of the disc. Filling by any other means (a
 * bitmap mask, a polygon approximation) would have to re-derive that hole.
 */

/**
 * The mark alone, lifted from public/Overclock.svg — not the wordmark.
 *
 * Exported so the static fallback can draw the same shape the particles form,
 * rather than keeping a second copy of the path.
 */
export const MARK_PATH =
  "M24.2207 4.32422C26.4326 4.32422 28.2257 6.1173 28.2257 8.32915V18.4649C28.2257 18.4772 28.2259 18.4894 28.2259 18.5016C28.2259 18.5138 28.2257 18.5259 28.2257 18.5381V18.5817L28.2252 18.5812C28.1824 26.3746 21.8519 32.679 14.0485 32.679C6.21854 32.679 -0.128906 26.3316 -0.128906 18.5016C-0.128906 10.6717 6.21854 4.32445 14.0485 4.32445C14.0755 4.32445 14.1025 4.3243 14.1295 4.32445H14.1283L24.2207 4.32422ZM18.5325 6.86365C16.0332 4.26062 12.0104 4.19522 9.47154 6.75958C7.713 8.5358 5.79326 10.7771 4.3913 13.2326C3.0717 15.5439 2.1648 18.1259 1.55028 20.4067C0.573383 24.0326 2.90314 27.5384 6.60052 28.1946C8.83712 28.5916 11.4498 28.9129 14.048 28.9129C16.5535 28.9129 19.0725 28.6141 21.2547 28.2368C25.0635 27.5783 27.407 23.9114 26.3192 20.2023C25.6606 17.9568 24.736 15.4497 23.4701 13.2326C22.1312 10.8876 20.257 8.6598 18.5325 6.86365Z";

/** Generous box around the path; anything outside simply fails the hit test. */
const BOUNDS = { minX: -1, maxX: 30, minY: 3, maxY: 34 };

/** A viewBox that frames the mark, for drawing it as plain SVG. */
export const MARK_VIEW_BOX = "-0.13 4.32 28.36 28.36";

/**
 * @param count  how many points to place inside the mark
 * @param depth  thickness in Z, as a fraction of the mark's width. A flat sheet
 *               thins to a line edge-on; a little depth keeps it legible all
 *               the way round.
 */
export function sampleMarkPoints(count: number, depth = 0.1): Float32Array {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return new Float32Array(count * 3);

  const path = new Path2D(MARK_PATH);
  const raw: Array<[number, number]> = [];

  // Bounded so a path that somehow never hits cannot spin forever.
  const maxAttempts = count * 60;
  for (let i = 0; i < maxAttempts && raw.length < count; i++) {
    const x = BOUNDS.minX + Math.random() * (BOUNDS.maxX - BOUNDS.minX);
    const y = BOUNDS.minY + Math.random() * (BOUNDS.maxY - BOUNDS.minY);
    if (ctx.isPointInPath(path, x, y, "evenodd")) raw.push([x, y]);
  }

  // Normalise from the accepted points rather than from BOUNDS: the box is
  // deliberately loose, so using it would leave the mark off-centre and small.
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const [x, y] of raw) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  const width = maxX - minX || 1;
  const height = maxY - minY || 1;
  const scale = 1 / Math.max(width, height);
  const centreX = (minX + maxX) / 2;
  const centreY = (minY + maxY) / 2;

  const positions = new Float32Array(raw.length * 3);
  for (let i = 0; i < raw.length; i++) {
    const [x, y] = raw[i];
    positions[i * 3] = (x - centreX) * scale;
    // SVG's y runs down, three's runs up.
    positions[i * 3 + 1] = -(y - centreY) * scale;
    positions[i * 3 + 2] = (Math.random() - 0.5) * depth;
  }
  return positions;
}
