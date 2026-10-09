"use client";

import type {
  FieldErrors,
  UseFormRegister,
} from "react-hook-form";
import type { SignupInput } from "@/lib/schema";
import { Field as DefaultField } from "./Field";

type SignupFieldsProps = {
  register: UseFormRegister<SignupInput>;
  errors: FieldErrors<SignupInput>;
  sending: boolean;
  /** The wrapper to render each control in — see the note below. */
  Field?: typeof DefaultField;
  /** The badge is a narrower surface and wants a shorter note field. */
  textareaRows?: number;
};

/**
 * The five controls, their names, their autocomplete tokens and their error
 * wiring — shared by both presentations of the form.
 *
 * `Field` is injectable so a surface can change how a control is framed
 * without restating which controls exist. The nametag passes its own, which
 * draws each row the way a badge prints one; what it must not do is re-declare
 * `autoComplete="organization-title"` and get it subtly wrong.
 */
export function SignupFields({
  register,
  errors,
  sending,
  Field = DefaultField,
  textareaRows = 5,
}: SignupFieldsProps) {
  return (
    <>
      <Field label="Name" hint="Your full name" error={errors.name?.message}>
        {(props) => (
          <input
            {...props}
            {...register("name")}
            type="text"
            autoComplete="name"
            disabled={sending}
          />
        )}
      </Field>

      <Field label="Email" hint="you@company.com" required error={errors.email?.message}>
        {(props) => (
          <input
            {...props}
            {...register("email")}
            type="email"
            autoComplete="email"
            disabled={sending}
          />
        )}
      </Field>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <Field label="Organization" hint="Company name" error={errors.organization?.message}>
          {(props) => (
            <input
              {...props}
              {...register("organization")}
              type="text"
              autoComplete="organization"
              disabled={sending}
            />
          )}
        </Field>

        <Field label="Job title" hint="Your role" error={errors.jobTitle?.message}>
          {(props) => (
            <input
              {...props}
              {...register("jobTitle")}
              type="text"
              autoComplete="organization-title"
              disabled={sending}
            />
          )}
        </Field>
      </div>

      <Field
        label="What sparked your interest today?"
        hint="A sentence or two is plenty"
        error={errors.interest?.message}
      >
        {(props) => (
          <textarea
            {...props}
            {...register("interest")}
            rows={textareaRows}
            disabled={sending}
            className={`${props.className} resize-none`}
          />
        )}
      </Field>
    </>
  );
}

/** The submit button, in the design's hard-offset treatment. */
const BUTTON_STYLES = {
  // The hard offset shadow is the design's "sitting on the page" treatment;
  // pressing collapses it rather than fading it.
  offset:
    "bg-teal px-6 py-4 shadow-[0_4px_0_0_var(--color-ink)] transition-[transform,box-shadow] duration-150 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_var(--color-ink)] active:translate-y-[4px] active:shadow-none",
  // The badge's: square-cornered like that card, lit from above.
  soft: "rounded-[2px] bg-[linear-gradient(180deg,#14826f,var(--color-teal))] px-6 py-3.5 shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_6px_16px_-6px_rgba(14,107,92,0.7)] transition-[filter,transform] duration-150 hover:brightness-110 active:translate-y-px",
} as const;

export function SubmitButton({
  sending,
  variant = "offset",
  className = "",
}: {
  sending: boolean;
  variant?: keyof typeof BUTTON_STYLES;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={sending}
      className={`group flex w-full items-center justify-center gap-2.5 text-[0.95rem] font-medium text-white disabled:cursor-not-allowed disabled:opacity-70 ${BUTTON_STYLES[variant]} ${className}`}
    >
      {sending ? "Sending…" : "Request a conversation"}
      {!sending && (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden
        >
          <path
            d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
