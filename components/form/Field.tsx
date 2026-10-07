"use client";

import { useId } from "react";

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => React.ReactNode;
};

/**
 * Label + control + error, wired for screen readers.
 *
 * The control is passed as a render function so the generated ids can be handed
 * to it. A plain `children` node would mean every caller repeating `useId` and
 * the `aria-describedby` bookkeeping by hand — which is exactly the part that
 * silently gets forgotten.
 */
export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [error ? errorId : null, hint ? hintId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="group/field">
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-[11px] tracking-[0.18em] text-white/45 uppercase transition-colors duration-200 group-focus-within/field:text-white/80"
      >
        {label}
      </label>

      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy || undefined,
      })}

      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-white/35">
          {hint}
        </p>
      )}

      {/* aria-live so an error announced after submit is read out, not just shown. */}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-[#ff9b7a]">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Shared input styling. Exported rather than duplicated per control so the
 * focus treatment stays identical across text inputs, the date picker, and the
 * textarea — a mismatch there is immediately visible.
 */
export const controlClass =
  "w-full rounded-lg border border-white/12 bg-white/[0.04] px-3.5 py-2.5 text-[15px] text-white " +
  "placeholder:text-white/25 outline-none backdrop-blur-sm " +
  "transition-[border-color,background-color,box-shadow] duration-200 " +
  "hover:border-white/20 " +
  "focus:border-white/35 focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(255,255,255,0.06)] " +
  "aria-[invalid=true]:border-[#ff9b7a]/60 " +
  "disabled:cursor-not-allowed disabled:opacity-50";
