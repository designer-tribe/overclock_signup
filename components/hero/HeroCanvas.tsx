"use client";

import dynamic from "next/dynamic";

/**
 * Client-side boundary for the WebGL layer.
 *
 * `ssr: false` is only legal inside a Client Component, so the dynamic import
 * lives here rather than in `app/page.tsx` — that keeps the page itself a
 * Server Component while still excluding the canvas from the server render.
 */
const HeroScene = dynamic(() => import("./HeroScene"), {
  // No placeholder: the gradient already painted behind this in page.tsx is the
  // fallback, and a second one would only cause a flash as the canvas takes over.
  ssr: false,
  loading: () => null,
});

export function HeroCanvas() {
  return <HeroScene />;
}
