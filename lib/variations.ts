/**
 * The design variations on offer, and the state that picks between them.
 *
 * Both the variation and — for variation 2 — its background photograph live in
 * the URL (`?v=2&img=2`) rather than React state alone, so a review can be
 * shared as a link and survives a reload. `useSyncExternalStore` reads them,
 * which also means the back button moves between choices for free.
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

/** Background choices for variation 2. */
export const BACKGROUNDS = [
  { id: 1, name: "Desk", summary: "One person at a laptop, open-plan office." },
  { id: 2, name: "Workshop", summary: "Three people laughing over a laptop." },
] as const;

export type BackgroundId = (typeof BACKGROUNDS)[number]["id"];

export const DEFAULT_VARIATION: VariationId = 1;
export const DEFAULT_BACKGROUND: BackgroundId = 1;

const VARIATION_PARAM = "v";
const BACKGROUND_PARAM = "img";

export type Selection = {
  variation: VariationId;
  background: BackgroundId;
};

function isVariationId(value: number): value is VariationId {
  return VARIATIONS.some((variation) => variation.id === value);
}

function isBackgroundId(value: number): value is BackgroundId {
  return BACKGROUNDS.some((background) => background.id === value);
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

/**
 * `useSyncExternalStore` compares snapshots by identity, so this has to return
 * the same string for the same URL rather than a fresh object each call — an
 * object would differ every time and spin the component in a render loop.
 * Callers get the parsed pair from `parseSelection`.
 */
export function getSelectionKey(): string {
  const params = new URLSearchParams(window.location.search);
  const variation = Number(params.get(VARIATION_PARAM));
  const background = Number(params.get(BACKGROUND_PARAM));
  return [
    isVariationId(variation) ? variation : DEFAULT_VARIATION,
    isBackgroundId(background) ? background : DEFAULT_BACKGROUND,
  ].join(":");
}

export function getServerSelectionKey(): string {
  return `${DEFAULT_VARIATION}:${DEFAULT_BACKGROUND}`;
}

export function parseSelection(key: string): Selection {
  const [variation, background] = key.split(":").map(Number);
  return {
    variation: variation as VariationId,
    background: background as BackgroundId,
  };
}

export function setSelection(next: Partial<Selection>): void {
  const url = new URL(window.location.href);
  if (next.variation !== undefined) {
    url.searchParams.set(VARIATION_PARAM, String(next.variation));
  }
  if (next.background !== undefined) {
    url.searchParams.set(BACKGROUND_PARAM, String(next.background));
  }
  // replaceState, not push: flicking through options should not bury the page
  // someone arrived from under a stack of its own entries.
  window.history.replaceState(null, "", url);
  emit();
}
