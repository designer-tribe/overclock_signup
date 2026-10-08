"use client";

import { useEffect, useRef, useState } from "react";
import { VARIATIONS, type VariationId } from "@/lib/variations";

type VariationPanelProps = {
  active: VariationId;
  onSelect: (id: VariationId) => void;
};

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
export function VariationPanel({ active, onSelect }: VariationPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const activeVariation = VARIATIONS.find((v) => v.id === active) ?? VARIATIONS[0];

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
        <div className="p-6 sm:p-7">
          <h2 id="variation-dialog-title" className="font-serif text-xl">
            Choose a variation
          </h2>
          <p className="mt-1.5 font-sans text-sm text-ink/60">
            The choice is kept in the address bar, so this link shows the same
            one to whoever you send it to.
          </p>

          <ul className="mt-5 space-y-2.5">
            {VARIATIONS.map((variation) => {
              const current = variation.id === active;
              return (
                <li key={variation.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(variation.id);
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
