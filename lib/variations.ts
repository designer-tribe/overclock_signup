/**
 * The landing page's layouts on offer, and the state that picks between them.
 *
 * There was once a second page here (a one-section signup, in three
 * treatments); it was dropped, and the landing page is the site. What is left
 * to review is which layout of it, V1 or V2.
 *
 * The choice lives in the URL (`?v=2`) rather than React state alone, so a
 * review can be shared as a link and survives a reload. `useSyncExternalStore`
 * reads it, which also means the back button moves between choices for free.
 * Links from before the signup page went (`?page=landing&v=2`) still work:
 * `page` is simply ignored.
 */

export const VARIATIONS = [
  {
    id: 1,
    name: "V1",
    summary: "Photo hero, speaker and takeaways, sticky form column.",
  },
  {
    id: 2,
    name: "V2",
    summary: "Badge pinned in the hero, takeaways and speaker side by side.",
  },
] as const;

export type VariationId = (typeof VARIATIONS)[number]["id"];

export const DEFAULT_VARIATION: VariationId = 1;

const VARIATION_PARAM = "v";

function isVariationId(value: number): value is VariationId {
  return VARIATIONS.some((variation) => variation.id === value);
}

export function findVariation(id: VariationId) {
  return VARIATIONS.find((variation) => variation.id === id) ?? VARIATIONS[0];
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
 * A number, not an object: `useSyncExternalStore` compares snapshots by
 * identity, and a fresh object each call would spin it in a render loop.
 */
export function getVariation(): VariationId {
  const raw = Number(new URLSearchParams(window.location.search).get(VARIATION_PARAM));
  return isVariationId(raw) ? raw : DEFAULT_VARIATION;
}

export function getServerVariation(): VariationId {
  return DEFAULT_VARIATION;
}

export function setVariation(next: VariationId): void {
  const url = new URL(window.location.href);
  url.searchParams.set(VARIATION_PARAM, String(next));
  // There is only one page now; a leftover `page` would only mislead.
  url.searchParams.delete("page");
  url.searchParams.delete("img");

  // replaceState, not push: flicking through options should not bury the page
  // someone arrived from under a stack of its own entries.
  window.history.replaceState(null, "", url);
  emit();
}
