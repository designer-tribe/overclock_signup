/**
 * The designs on offer, and the state that picks between them.
 *
 * Two levels, because what is being reviewed changed shape. It began as one
 * page in three treatments; it is now two different **pages** — a one-section
 * signup and a scrolling landing page — each with its own variations. So the
 * selection is a page plus a variation within that page, and variation ids are
 * scoped to their page: `v=1` means Studio under Signup and V1 under Landing.
 *
 * All of it lives in the URL (`?page=landing&v=1`) rather than React state
 * alone, so a review can be shared as a link and survives a reload.
 * `useSyncExternalStore` reads it, which also means the back button moves
 * between choices for free.
 */

export const PAGES = [
  {
    id: "signup",
    name: "Signup",
    summary: "One section: the pitch and the form, side by side.",
    variations: [
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
      {
        id: 3,
        name: "Particles",
        summary:
          "Deep black, with the mark built out of particles the cursor breaks.",
      },
    ],
  },
  {
    id: "landing",
    name: "Landing",
    summary: "Several sections, scrolling, with the form held alongside.",
    variations: [
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
    ],
  },
] as const;

export type PageId = (typeof PAGES)[number]["id"];
export type VariationId = number;

/** Background choices for the Workplace variation of the signup page. */
export const BACKGROUNDS = [
  { id: 1, name: "Desk", summary: "One person at a laptop, open-plan office." },
  { id: 2, name: "Workshop", summary: "Three people laughing over a laptop." },
] as const;

export type BackgroundId = (typeof BACKGROUNDS)[number]["id"];

/** The one page-and-variation pair that takes a background choice. */
export const BACKGROUND_OWNER = { page: "signup" as PageId, variation: 2 };

export const DEFAULT_PAGE: PageId = "signup";
export const DEFAULT_BACKGROUND: BackgroundId = 1;

const PAGE_PARAM = "page";
const VARIATION_PARAM = "v";
const BACKGROUND_PARAM = "img";

export type Selection = {
  page: PageId;
  variation: VariationId;
  background: BackgroundId;
};

export function findPage(id: PageId) {
  return PAGES.find((page) => page.id === id) ?? PAGES[0];
}

function isPageId(value: string): value is PageId {
  return PAGES.some((page) => page.id === value);
}

/** The first variation of a page — what an unknown or missing `v` falls back to. */
function defaultVariation(page: PageId): VariationId {
  return findPage(page).variations[0].id;
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
 * Callers get the parsed triple from `parseSelection`.
 */
export function getSelectionKey(): string {
  const params = new URLSearchParams(window.location.search);

  const rawPage = params.get(PAGE_PARAM) ?? "";
  const page = isPageId(rawPage) ? rawPage : DEFAULT_PAGE;

  // Validated against *this page's* variations, since the ids are per page.
  const rawVariation = Number(params.get(VARIATION_PARAM));
  const variation = findPage(page).variations.some((v) => v.id === rawVariation)
    ? rawVariation
    : defaultVariation(page);

  const rawBackground = Number(params.get(BACKGROUND_PARAM));
  const background = isBackgroundId(rawBackground)
    ? rawBackground
    : DEFAULT_BACKGROUND;

  return [page, variation, background].join(":");
}

export function getServerSelectionKey(): string {
  return `${DEFAULT_PAGE}:${defaultVariation(DEFAULT_PAGE)}:${DEFAULT_BACKGROUND}`;
}

export function parseSelection(key: string): Selection {
  const [page, variation, background] = key.split(":");
  return {
    page: page as PageId,
    variation: Number(variation),
    background: Number(background) as BackgroundId,
  };
}

export function setSelection(next: Partial<Selection>): void {
  const url = new URL(window.location.href);

  if (next.page !== undefined) {
    url.searchParams.set(PAGE_PARAM, next.page);
    // Moving to another page carries no variation with it: `v=3` is Particles
    // under Signup and nothing at all under Landing. Unless the caller named
    // one, reset to the page's first so the URL never describes a variation
    // that page does not have.
    if (next.variation === undefined) {
      url.searchParams.set(VARIATION_PARAM, String(defaultVariation(next.page)));
    }
  }
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
