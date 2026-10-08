/**
 * The design variations on offer, and the state that picks between them.
 *
 * The choice lives in the URL (`?v=2`) rather than React state alone, so a
 * review can be shared as a link and survives a reload. `useSyncExternalStore`
 * reads it, which also means the back button moves between variations for free.
 */

export const VARIATIONS = [
  {
    id: 1,
    name: "Studio",
    summary: "Paper background with the CRT figure, scrubbed by the mouse.",
  },
  {
    id: 2,
    name: "Workplace",
    summary: "Full-bleed photograph, darkened, with the form over it.",
  },
] as const;

export type VariationId = (typeof VARIATIONS)[number]["id"];

export const DEFAULT_VARIATION: VariationId = 1;

const PARAM = "v";

function isVariationId(value: number): value is VariationId {
  return VARIATIONS.some((variation) => variation.id === value);
}

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  // popstate so the back button walks the history of choices, not just ours.
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

export function getVariation(): VariationId {
  const raw = Number(new URLSearchParams(window.location.search).get(PARAM));
  return isVariationId(raw) ? raw : DEFAULT_VARIATION;
}

/** The server cannot know the URL's query here; the page renders the default. */
export function getServerVariation(): VariationId {
  return DEFAULT_VARIATION;
}

export function setVariation(id: VariationId): void {
  const url = new URL(window.location.href);
  url.searchParams.set(PARAM, String(id));
  // replaceState, not push: flicking through variations should not bury the
  // page someone arrived from under a stack of its own entries.
  window.history.replaceState(null, "", url);
  emit();
}
