/**
 * Backdrop shader: a slow-drifting fBm field, tinted between three brand colours
 * and nudged by the pointer.
 *
 * Kept as a template literal rather than a `.glsl` file so it needs no loader
 * config and ships inside the client bundle like any other module.
 *
 * Deliberately cheap: value noise rather than simplex/curl, four fBm octaves,
 * no texture reads, no lighting. It runs fullscreen on mobile GPUs, which is
 * where a prettier shader would cost real battery. Once the real design lands,
 * this is the file to rewrite — the plumbing around it does not need to change.
 */

export const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2  uPointer;     // -1..1, already smoothed on the CPU
  uniform float uAspect;
  uniform float uIntensity;   // 0 = flat wash, 1 = full motion (drives intro + reduced-motion)
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorC;

  // --- value noise ---------------------------------------------------------
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    // Quintic smoothstep: continuous second derivative, so the field has no
    // visible grid creases where cells meet.
    vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float sum = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      sum += amplitude * noise(p);
      p = p * 2.02 + 11.37;   // non-integer lacunarity + offset breaks up self-similarity
      amplitude *= 0.5;
    }
    return sum;
  }

  void main() {
    // Correct for viewport aspect so the pattern never looks stretched.
    vec2 uv = vUv;
    vec2 p = vec2((uv.x - 0.5) * uAspect, uv.y - 0.5);

    float t = uTime * 0.06;

    // Pointer pulls the field rather than translating it, which keeps the
    // motion feeling like a material responding instead of a layer sliding.
    vec2 pull = uPointer * 0.18 * uIntensity;

    // Domain warp: run fBm through itself for the folded, liquid look.
    vec2 q = vec2(fbm(p * 1.4 + t), fbm(p * 1.4 + vec2(5.2, 1.3) - t));
    vec2 r = vec2(
      fbm(p * 1.9 + q * 1.1 + pull + vec2(1.7, 9.2) + t * 1.3),
      fbm(p * 1.9 + q * 1.1 + pull + vec2(8.3, 2.8) - t * 1.1)
    );
    float field = fbm(p * 2.2 + r * 1.6);

    // Two mixes give a three-stop gradient without a lookup texture.
    vec3 color = mix(uColorA, uColorB, clamp(field * 1.5, 0.0, 1.0));
    color = mix(color, uColorC, clamp(length(r) * 0.85, 0.0, 1.0));

    // Vignette, so the centre copy always has contrast to sit on.
    float vignette = smoothstep(1.15, 0.25, length(p * vec2(0.85, 1.1)));
    color *= 0.45 + 0.55 * vignette;

    // Settle toward the base colour when motion is dialled down.
    color = mix(uColorA * 0.6, color, mix(0.35, 1.0, uIntensity));

    // Ordered-ish dither. 8-bit output posterises smooth gradients into visible
    // bands; a sub-LSB of noise is much cheaper than a float framebuffer.
    float dither = (hash(uv * 1024.0) - 0.5) / 255.0;
    gl_FragColor = vec4(color + dither, 1.0);
  }
`;
