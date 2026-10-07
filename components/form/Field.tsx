"use client";

import { useId } from "react";

type FieldProps = {
  /** Visible label text, shown as an overlay inside the control while it is empty. */
  label: string;
  required?: boolean;
  error?: string;
  /**
   * Render function, so the generated ids can be handed to the control. A plain
   * `children` node would mean every caller repeating `useId` and the
   * `aria-describedby` bookkeeping by hand — which is the part that silently
   * gets forgotten.
   */
  children: (props: {
    id: string;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
    /** `:placeholder-shown` is what drives the label and underline states. */
    placeholder: string;
    className: string;
  }) => React.ReactNode;
};

/**
 * One form field, following the design's label-inside-the-control pattern.
 *
 * The visible label is an overlay rather than a `placeholder` attribute, because
 * the required marker needs to be styled and a placeholder is plain text. A real
 * `<label>` is still rendered for screen readers — the overlay is `aria-hidden`
 * so the label is not announced twice.
 *
 * Worth knowing: the label disappears once the field has content, which is the
 * usual cost of this pattern. It is what the design specifies.
 */
export function Field({ label, required, error, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <div className="relative">
        <label htmlFor={id} className="sr-only">
          {label}
          {required ? " (required)" : ""}
        </label>

        {children({
          id,
          "aria-invalid": Boolean(error),
          "aria-describedby": error ? errorId : undefined,
          // A single space, not "", so the control still counts as
          // `:placeholder-shown` while empty.
          placeholder: " ",
          className: "field-control",
        })}

        <span className="field-label" aria-hidden>
          {label}
          {required && <span className="text-flag">*</span>}
        </span>
      </div>

      {/* role="alert" so an error raised on submit is announced, not just shown. */}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-flag">
          {error}
        </p>
      )}
    </div>
  );
}
