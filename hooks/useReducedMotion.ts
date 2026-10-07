"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

/** The server cannot know the preference; assume motion is allowed. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * Tracks the OS-level reduced-motion preference, and keeps tracking it — people
 * do toggle it mid-session, usually because something on the page made them
 * want to.
 *
 * `useSyncExternalStore` rather than effect-plus-state: it reads the real value
 * on the first client render instead of rendering `false` and correcting it,
 * which is what would otherwise let one frame of animation through.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Non-reactive read, for imperative code that runs once (a GSAP timeline being
 * built, a one-off decision inside an event handler).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(QUERY).matches;
}
