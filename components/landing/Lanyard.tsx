/**
 * The lanyard the nametag hangs from: a printed strap, a D-ring and a clasp.
 *
 * Drawn flat rather than rendered. The reference is a photographic 3D mockup,
 * and chasing that in SVG gets you an uncanny half-render that fights
 * everything else on the page; a clean two-tone hardware drawing sits with the
 * rest of the design and still reads unmistakably as a lanyard clip.
 *
 * The strap is a quarter of the badge's width, which is roughly the proportion
 * in the reference. Narrower and the hardware beneath it has nowhere to be.
 */

export function Lanyard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none flex flex-col items-center ${className}`}
      aria-hidden
    >
      <div className="relative h-32 w-24 overflow-hidden bg-gradient-to-b from-[#0a5347] via-teal to-[#10806d]">
        {/*
          One word, not a repeating run. A lanyard does repeat its branding,
          but the strap starts here rather than running off the top of the
          frame, so a run would be cut mid-word at a visible edge — which reads
          as a clipping bug rather than as webbing.
        */}
        <span className="absolute inset-0 flex items-center justify-center font-sans text-[0.62rem] font-semibold tracking-[0.3em] whitespace-nowrap text-white/75 uppercase [writing-mode:vertical-rl]">
          Overclock
        </span>
        {/* The fold where the webbing is stitched around the D-ring. */}
        <span className="absolute inset-x-0 bottom-0 h-px bg-black/25" />
      </div>

      <Clasp />
    </div>
  );
}

/** D-ring, swivel and hook, in one drawing so their joints always line up. */
function Clasp() {
  return (
    <svg viewBox="0 0 96 104" className="-mt-px h-26 w-24" fill="none" aria-hidden>
      <defs>
        {/*
          Four stops rather than two: metal reads as metal because of the hard
          bright line down one side of a darker body, not because of a smooth
          ramp between two greys.
        */}
        <linearGradient id="lanyard-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#70777b" />
          <stop offset="0.28" stopColor="#f1f3f4" />
          <stop offset="0.52" stopColor="#a9afb3" />
          <stop offset="1" stopColor="#656b6f" />
        </linearGradient>
      </defs>

      {/*
        Proportion is what makes this read as hardware rather than as
        glassware: a first pass had a deep D-ring, a long swivel and a small
        loop, which is the silhouette of a wine glass — bowl, stem, foot. The
        loop has to be the largest part and the swivel barely there.
      */}

      {/* D-ring: flat across the top, where the webbing folds over it. */}
      <path
        d="M33 4h30v10a15 15 0 0 1-30 0V4Z"
        stroke="url(#lanyard-metal)"
        strokeWidth="5.5"
        strokeLinejoin="round"
      />

      {/* The swivel barrel the hook turns on. */}
      <rect x="41" y="28" width="14" height="10" rx="3.5" fill="url(#lanyard-metal)" />

      {/*
        The loop: a 225° arc about (48, 62) with r=20, from the top round the
        left and under to a tip at the lower right. An explicit arc rather than
        a dashed circle — a dash puts its gap wherever the renderer happens to
        start the circle's path, which in Chrome is the top, so the loop came
        out open at the very point it has to join the swivel.
      */}
      <path
        d="M48 42A20 20 0 1 0 62.1 76.1"
        stroke="url(#lanyard-metal)"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* The sprung gate, closing across that opening. */}
      <path
        d="M51 45 62 74"
        stroke="url(#lanyard-metal)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
