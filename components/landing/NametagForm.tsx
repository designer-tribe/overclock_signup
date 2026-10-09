"use client";

import { useId, useRef } from "react";
import { Logo } from "@/components/brand/Logo";
import { SignupFields, SubmitButton } from "@/components/form/SignupFields";
import { useSignupForm } from "@/components/form/useSignupForm";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import { Lanyard } from "./Lanyard";

/**
 * The signup form as a conference nametag on a lanyard.
 *
 * Same form as the signup page's card — same validation, same action, same
 * controls, via `useSignupForm` and `SignupFields`. What changes is the frame:
 * the badge's printed rows become the fields you fill in, which is the point
 * of the idea. A badge you complete yourself.
 *
 * Only the landing page uses it. The signup page's three variations keep the
 * card, because the nametag needs a column of its own to hang in and they put
 * the form beside a figure that already owns the vertical space.
 */
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
      // Drops in and settles, because that is what something on a strap does.
      gsap.from(root.current, {
        autoAlpha: 0,
        y: -28,
        duration: 1,
        delay: 0.2,
        ease: "back.out(1.4)",
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
    <div ref={root} className={`mx-auto max-w-[30rem] ${className}`}>
      <Lanyard className="relative z-10" />

      {/*
        -mt pulls the card up under the clasp so the hook sits in the punch
        hole rather than above it. The card is the only thing here that takes
        pointer events; the lanyard is decoration and says so.
      */}
      <div className="relative -mt-9 rounded-[1.5rem] bg-paper px-6 pt-12 pb-7 text-ink shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)] sm:px-8 sm:pb-8">
        <PunchHole />

        {status === "success" ? (
          // A minimum height so the badge does not snap to a fraction of its
          // size the moment it is submitted, taking the page with it.
          <div className="flex min-h-[26rem] flex-col justify-center">
            <h2 className="font-serif text-2xl leading-snug">
              Thanks — your request is on its way.
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-ink/70">
              Our team will be in touch within 48 hours to find a time that
              works for you.
            </p>
          </div>
        ) : (
          <>
            {/* The badge's printed head: the issuer, then its reference rows. */}
            <Logo className="h-[1.4rem] text-ink" />
            <Rule className="mt-4" />

            <div className="flex items-baseline justify-between py-3 font-sans text-[0.95rem]">
              <span>2026</span>
              <span className="tracking-[0.08em]">OVRCLK</span>
            </div>
            <Rule />

            <h2 className="mt-6 font-serif text-[1.45rem] leading-snug">
              Let&rsquo;s Continue The Conversation
            </h2>
            <p className="mt-2.5 text-[0.9rem] leading-relaxed text-ink/70">
              Share a few details and our team will reach out within 48 hours.
            </p>

            {/* noValidate: the browser's own bubbles would pre-empt our messages. */}
            <form onSubmit={onSubmit} noValidate className="mt-5">
              <SignupFields
                register={register}
                errors={errors}
                sending={sending}
                textareaRows={3}
                Field={BadgeField}
              />

              {formError && (
                <p role="alert" className="pt-3 text-sm text-flag">
                  {formError}
                </p>
              )}

              <div className="pt-6">
                <SubmitButton sending={sending} />
              </div>
            </form>

            {/* The badge's foot. Decorative, and marked as such: a barcode
                that encodes nothing should not be announced as if it did. */}
            <p className="mt-8 font-sans text-[0.8rem] text-ink/70">#8567</p>
            <Barcode className="mt-2" />
          </>
        )}
      </div>
    </div>
  );
}

function Rule({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-ink/25 ${className}`} />;
}

/** The slot the clasp hooks through. */
function PunchHole() {
  return (
    <span
      aria-hidden
      className="absolute top-2 left-1/2 h-[0.8rem] w-10 -translate-x-1/2 rounded-full bg-ink/85 shadow-[inset_0_1px_2px_rgba(255,255,255,0.25)]"
    />
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
    <div className="border-b border-ink/25 py-2.5">
      <label
        htmlFor={id}
        className="block font-sans text-[0.68rem] font-medium tracking-[0.12em] text-ink/55 uppercase"
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

/** Decorative. The widths are fixed so it does not shimmer between renders. */
const BARS = [
  3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 1, 2, 4, 1, 2, 3, 1, 1, 2,
  1, 4, 2, 1, 3, 1, 2, 1, 1, 3, 4, 1, 2, 1,
];

function Barcode({ className = "" }: { className?: string }) {
  return (
    <div className={`flex h-12 items-stretch ${className}`} aria-hidden>
      {BARS.map((width, index) => (
        <span
          key={index}
          style={{ flexGrow: width }}
          className={index % 2 ? "bg-transparent" : "bg-ink"}
        />
      ))}
    </div>
  );
}
