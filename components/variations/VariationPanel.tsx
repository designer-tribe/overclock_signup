"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  BACKGROUNDS,
  VARIATIONS,
  type Selection,
  type VariationId,
} from "@/lib/variations";
import { VARIATION_TWO_BACKGROUNDS } from "@/components/variants/variationTwoBackgrounds";

type VariationPanelProps = {
  selection: Selection;
  onChange: (next: Partial<Selection>) => void;
};

/** Which variations carry a background choice, and so get the nested picker. */
const BACKGROUND_OWNER: VariationId = 2;

/**
 * Review control for switching between design variations.
 *
 * Deliberately not styled like either variation: it is scaffolding for picking
 * a direction, not part of the page, and it has to stay legible on both a paper
 * background and a darkened photograph.
 *
 * Built on the native `<dialog>`, which brings the focus trap, Escape to close,
 * inertness of the page behind it and the backdrop pseudo-element — all of
 * which are easy to hand-roll badly and tedious to hand-roll well.
 */
export function VariationPanel({ selection, onChange }: VariationPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const activeVariation =
    VARIATIONS.find((v) => v.id === selection.variation) ?? VARIATIONS[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        /*
          Two placements. On narrow screens the form card runs the full width,
          so anything pinned to the left edge lands on top of it — hence a
          floating pill in the corner there. From sm the layout leaves the left
          margin free and a vertical tab costs no horizontal room over it.
        */
        className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-ink/90 px-3 py-2.5 font-sans text-white shadow-lg backdrop-blur-sm transition-[padding,background-color] hover:bg-ink focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:top-1/2 sm:bottom-auto sm:left-0 sm:-translate-y-1/2 sm:rounded-l-none sm:rounded-r-lg sm:py-3 sm:pr-3 sm:pl-2.5 sm:hover:pr-4"
      >
        {/* The word is dropped below sm: there the control floats over the
            form, and a 175px pill in front of the inputs gets in the way of
            actually testing them. The number alone is ~40px. */}
        <span className="hidden text-[0.7rem] font-medium tracking-[0.18em] uppercase sm:inline sm:[writing-mode:vertical-rl] sm:rotate-180">
          Variation
        </span>
        <span className="font-mono text-sm leading-none" aria-hidden>
          <span className="sm:hidden">V</span>
          {activeVariation.id}
        </span>
        <span className="sr-only">
          Current variation: {activeVariation.name}. Choose a different one.
        </span>
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        // Clicking the backdrop lands on the dialog element itself; clicks on
        // the panel inside stop at the inner element, so this closes on the
        // backdrop only.
        onClick={(event) => {
          if (event.target === dialogRef.current) setOpen(false);
        }}
        aria-labelledby="variation-dialog-title"
        className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-xl bg-paper p-0 text-ink shadow-2xl backdrop:bg-ink/60 backdrop:backdrop-blur-sm"
      >
        <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-7">
          <h2 id="variation-dialog-title" className="font-serif text-xl">
            Choose a variation
          </h2>
          <p className="mt-1.5 font-sans text-sm text-ink/60">
            The choice is kept in the address bar, so this link shows the same
            one to whoever you send it to.
          </p>

          <ul className="mt-5 space-y-2.5">
            {VARIATIONS.map((variation) => {
              const current = variation.id === selection.variation;
              return (
                <li key={variation.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange({ variation: variation.id });
                      // Close on pick: the dialog covers the page, so leaving
                      // it up hides the very thing the choice was about.
                      setOpen(false);
                    }}
                    aria-current={current}
                    className={`flex w-full items-start gap-3.5 rounded-lg border px-4 py-3.5 text-left transition-colors ${
                      current
                        ? "border-teal bg-teal/[0.07]"
                        : "border-ink/12 hover:border-ink/30 hover:bg-ink/[0.03]"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs ${
                        current ? "bg-teal text-white" : "bg-ink/8 text-ink/60"
                      }`}
                      aria-hidden
                    >
                      {variation.id}
                    </span>
                    <span>
                      <span className="block font-sans text-[0.95rem] font-medium">
                        {variation.name}
                        {current && (
                          <span className="ml-2 font-normal text-teal">· current</span>
                        )}
                      </span>
                      <span className="mt-0.5 block font-sans text-sm text-ink/60">
                        {variation.summary}
                      </span>
                    </span>
                  </button>

                  {/*
                    The background picker is nested under the variation it
                    belongs to, and choosing one also switches to that variation
                    — a control that silently does nothing until you select
                    something else first is worse than no control.
                  */}
                  {variation.id === BACKGROUND_OWNER && (
                    <div className="mt-2.5 ml-4 border-l border-ink/12 pt-0.5 pl-4">
                      <p
                        id="background-picker-label"
                        className="font-sans text-[0.7rem] font-medium tracking-[0.12em] text-ink/45 uppercase"
                      >
                        Background
                      </p>
                      <ul
                        aria-labelledby="background-picker-label"
                        className="mt-2 grid grid-cols-2 gap-2.5"
                      >
                        {BACKGROUNDS.map((background) => {
                          const picked =
                            selection.background === background.id &&
                            selection.variation === BACKGROUND_OWNER;
                          return (
                            <li key={background.id}>
                              <button
                                type="button"
                                onClick={() => {
                                  onChange({
                                    variation: BACKGROUND_OWNER,
                                    background: background.id,
                                  });
                                  setOpen(false);
                                }}
                                aria-current={picked}
                                className={`w-full overflow-hidden rounded-md border text-left transition-colors ${
                                  picked
                                    ? "border-teal"
                                    : "border-ink/12 hover:border-ink/35"
                                }`}
                              >
                                {/* A thumbnail of the real file, so the choice
                                    is made on the photograph rather than on a
                                    label guessing at it. */}
                                <Image
                                  src={VARIATION_TWO_BACKGROUNDS[background.id]}
                                  alt=""
                                  sizes="160px"
                                  className="aspect-[16/10] w-full bg-ink/5 object-cover"
                                />
                                <span className="block px-2.5 py-2">
                                  <span className="block font-sans text-[0.8rem] font-medium">
                                    Image {background.id}
                                    {picked && (
                                      <span className="ml-1.5 font-normal text-teal">
                                        ·
                                      </span>
                                    )}
                                  </span>
                                  <span className="mt-0.5 block font-sans text-xs leading-snug text-ink/55">
                                    {background.summary}
                                  </span>
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-5 w-full rounded-lg border border-ink/12 py-2.5 font-sans text-sm text-ink/70 transition-colors hover:border-ink/30 hover:text-ink"
          >
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
