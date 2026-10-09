"use client";

import { useId, useRef } from "react";
import { Logo } from "@/components/brand/Logo";
import { SignupFields, SubmitButton } from "@/components/form/SignupFields";
import { useSignupForm } from "@/components/form/useSignupForm";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The signup form as a conference nametag.
 *
 * Same form as the signup page's card — same validation, same action, same
 * controls, via `useSignupForm` and `SignupFields`. What changes is the frame:
 * the badge's printed rows become the fields you fill in, which is the point
 * of the idea. A badge you complete yourself.
 *
 * It has to fit on one screen beside the hero, and that is what rules the
 * spacing here. Everything that was decoration rather than information — the
 * lanyard it hung from, the punch hole, the serial number and the barcode —
 * is gone, because each of them was costing vertical space the fields needed.
 *
 * Only the landing page uses it. The signup page's three variations keep the
 * card: they put the form beside a figure that already owns the column.
 */

const EVENT_DATE = "Wednesday, October 14";
const EVENT_NAME = "Leading the Charge";
const EVENT_STRAPLINE =
  "The Responsibility of People Leaders in Setting AI Strategy";

export function NametagForm({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const { register, errors, onSubmit, status, sending, formError } =
    useSignupForm();

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(root.current, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.from(root.current, {
        autoAlpha: 0,
        y: 24,
        duration: 0.9,
        delay: 0.2,
        ease: "expo.out",
      });
    },
    { scope: root },
  );

  /*
    Capped and centred: a nametag is a portrait object, and stretched to the
    full width of this column it stops reading as one. The slack either side
    is the point, not waste.
  */
  return (
    <div
      ref={root}
      className={`mx-auto max-w-[30rem] rounded-[1.5rem] bg-badge px-6 py-7 text-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.5)] sm:px-8 ${className}`}
    >
      {status === "success" ? (
        // A minimum height so the badge does not snap to a fraction of its
        // size the moment it is submitted, taking the page with it.
        <div className="flex min-h-[20rem] flex-col justify-center">
          <h2 className="font-serif text-2xl leading-snug">
            Thanks — your request is on its way.
          </h2>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/70">
            Our team will be in touch within 48 hours to find a time that works
            for you.
          </p>
        </div>
      ) : (
        <>
          {/* The badge's printed head: who issued it, and for when. */}
          <div className="flex items-center justify-between gap-4">
            <Logo className="h-[1.3rem] text-ink" />
            <span className="font-sans text-[0.82rem] text-ink/70">
              {EVENT_DATE}
            </span>
          </div>

          <div className="mt-3.5 h-px bg-ink/25" />

          {/*
            Sans, not the page's serif. A printed credential is set in sans —
            the reference nametag is, and so is the event's own lockup — and
            the badge is a distinct object on this page rather than another of
            its sections.
          */}
          <h2 className="mt-5 font-sans text-[1.7rem] leading-[1.1] font-bold tracking-[-0.015em]">
            {EVENT_NAME}
          </h2>
          <p className="mt-2 text-[0.88rem] leading-snug text-ink/70">
            {EVENT_STRAPLINE}
          </p>

          {/* noValidate: the browser's own bubbles would pre-empt our messages. */}
          <form onSubmit={onSubmit} noValidate className="mt-5">
            <SignupFields
              register={register}
              errors={errors}
              sending={sending}
              textareaRows={2}
              Field={BadgeField}
            />

            {formError && (
              <p role="alert" className="pt-3 text-sm text-flag">
                {formError}
              </p>
            )}

            <div className="pt-5">
              <SubmitButton sending={sending} />
            </div>
          </form>
        </>
      )}
    </div>
  );
}

/**
 * A field as a badge prints one: the label set small above the rule, the
 * control sitting on it. Same contract as the card's `Field` — it takes the
 * render function and hands back the ids and the `aria` wiring — so
 * `SignupFields` does not care which of the two it is given.
 */
function BadgeField({
  label,
  required,
  error,
  children,
}: React.ComponentProps<typeof import("@/components/form/Field").Field>) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="border-b border-ink/25 py-2">
      <label
        htmlFor={id}
        className="block font-sans text-[0.66rem] font-medium tracking-[0.12em] text-ink/55 uppercase"
      >
        {label}
        {required && <span className="text-flag"> *</span>}
      </label>

      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
        // A real label is rendered above, so the control needs no overlay and
        // no placeholder trick — only something for the browser not to show.
        placeholder: " ",
        className: "badge-control",
      })}

      {error && (
        <p id={errorId} role="alert" className="mt-1 text-xs text-flag">
          {error}
        </p>
      )}
    </div>
  );
}
