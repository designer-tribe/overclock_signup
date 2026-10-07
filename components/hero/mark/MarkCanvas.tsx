"use client";

import dynamic from "next/dynamic";

/**
 * Client-side boundary for the 3D mark.
 *
 * `ssr: false` is only legal inside a Client Component, so the dynamic import
 * lives here rather than in the page — that keeps the page a Server Component
 * while still excluding the canvas from the server render, which it has to be:
 * `<Canvas>` reaches for `document` on mount.
 */
const MarkScene = dynamic(() => import("./MarkScene"), {
  // No placeholder. The screen already paints its own dark background, and a
  // second one would only flash as the canvas takes over.
  ssr: false,
  loading: () => null,
});

export function MarkCanvas() {
  return <MarkScene />;
}
