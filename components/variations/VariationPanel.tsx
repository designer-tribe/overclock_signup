"use client";

import { useRef } from "react";
import {
  BACKGROUNDS,
  BACKGROUND_OWNER,
  PAGES,
  findPage,
  type Selection,
} from "@/lib/variations";

type VariationPanelProps = {
  selection: Selection;
  onChange: (next: Partial<Selection>) => void;
};

const POPOVER_ID = "variation-panel";

/**
 * Review control for switching between the designs on offer.
 *
 * Built on the HTML popover API rather than a dialog: this is a panel you poke
 * at while looking at the page behind it, not something that should dim the
 * page and trap focus. `popover="auto"` brings the top layer (so it cannot be
 * trapped under anything by z-index), light dismiss on an outside click, and
 * Escape — and the `popoverTarget` pairing means the open/close state needs no
 * React state at all.
 *
 * Deliberately not styled like any of the designs: it is scaffolding for
 * picking a direction, not part of the page.
 */
export function VariationPanel({ selection, onChange }: VariationPanelProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close after a choice: the panel sits over the page, and the point of the
  // choice is to look at what it did.
  const choose = (next: Partial<Selection>) => {
    onChange(next);
    popoverRef.current?.hidePopover();
  };

  const pill = (selected: boolean) =>
    `rounded-full border px-5 py-2.5 font-sans text-[0.95rem] transition-colors ${
      selected
        ? "border-ink bg-ink text-white"
        : "border-ink/20 bg-white text-ink hover:border-ink/45"
    }`;

  const page = findPage(selection.page);
  // The background group belongs to one page. Shown on that page whatever the
  // variation — picking one switches to the variation that has backgrounds —
  // but hidden elsewhere, where it would be a control that silently drags you
  // to a different page.
  const showBackgrounds = selection.page === BACKGROUND_OWNER.page;

  return (
    <>
      <button
        type="button"
        popoverTarget={POPOVER_ID}
        /*
          Two placements. On narrow screens the form card runs the full width,
          so anything pinned to the left edge lands on top of it — hence a
          floating pill in the corner there. From sm the layout leaves the left
          margin free and a vertical tab costs no horizontal room over it.
        */
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-paper px-3.5 py-2.5 font-sans text-ink/60 shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition-colors hover:text-ink focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:outline-none sm:top-1/2 sm:bottom-auto sm:left-0 sm:-translate-y-1/2 sm:rounded-l-none sm:rounded-r-2xl sm:px-2.5 sm:py-5"
      >
        <span className="text-[0.7rem] font-medium tracking-[0.18em] uppercase sm:[writing-mode:vertical-rl] sm:rotate-180">
          Variation
        </span>
        <span className="sr-only">
          Open the variation picker. Currently showing {page.name} variation{" "}
          {selection.variation}.
        </span>
      </button>

      <div
        ref={popoverRef}
        id={POPOVER_ID}
        popover="auto"
        aria-label="Variation picker"
        /*
          A popover lives in the top layer, outside normal flow, so it is
          positioned against the viewport rather than the trigger. It mirrors
          the trigger's two placements, which is what keeps the two reading as
          one control.
        */
        className="fixed inset-auto bottom-4 left-4 m-0 w-[min(20rem,calc(100vw-2rem))] rounded-2xl bg-white p-6 text-ink shadow-[0_8px_40px_rgba(0,0,0,0.18)] sm:top-1/2 sm:bottom-auto sm:left-16 sm:-translate-y-1/2"
      >
        <div className="flex items-center justify-between">
          <p className="font-sans text-[0.7rem] font-medium tracking-[0.18em] text-ink/45 uppercase">
            Variation
          </p>
          <button
            type="button"
            popoverTarget={POPOVER_ID}
            popoverTargetAction="hide"
            aria-label="Close the variation picker"
            className="-mr-1.5 -mt-1.5 rounded-full p-1.5 text-ink/45 transition-colors hover:bg-ink/5 hover:text-ink focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:outline-none"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" aria-hidden>
              <path
                d="M3.5 3.5l9 9m0-9l-9 9"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <fieldset className="mt-4 border-0 p-0">
          <legend className="font-sans text-[1.05rem] font-semibold">Page</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {PAGES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => choose({ page: entry.id })}
                aria-pressed={entry.id === selection.page}
                className={pill(entry.id === selection.page)}
              >
                {entry.name}
              </button>
            ))}
          </div>
        </fieldset>

        {/* The variations of whichever page is showing — the ids are per page,
            so this list changes with the choice above it. */}
        <fieldset className="mt-5 border-0 p-0">
          <legend className="font-sans text-[1.05rem] font-semibold">Layout</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {page.variations.map((variation) => (
              <button
                key={variation.id}
                type="button"
                onClick={() => choose({ variation: variation.id })}
                aria-pressed={variation.id === selection.variation}
                className={pill(variation.id === selection.variation)}
              >
                {variation.name}
              </button>
            ))}
          </div>
        </fieldset>

        {showBackgrounds && (
          <fieldset className="mt-5 border-0 p-0">
            <legend className="font-sans text-[1.05rem] font-semibold">
              Background
            </legend>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {BACKGROUNDS.map((background) => {
                const picked =
                  selection.variation === BACKGROUND_OWNER.variation &&
                  selection.background === background.id;
                return (
                  <button
                    key={background.id}
                    type="button"
                    onClick={() =>
                      choose({
                        variation: BACKGROUND_OWNER.variation,
                        background: background.id,
                      })
                    }
                    aria-pressed={picked}
                    className={pill(picked)}
                  >
                    Image {background.id}
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}
      </div>
    </>
  );
}
