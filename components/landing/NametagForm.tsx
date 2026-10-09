"use client";

import { useId, useRef } from "react";
import { Logo } from "@/components/brand/Logo";
import { SignupFields, SubmitButton } from "@/components/form/SignupFields";
import { useSignupForm } from "@/components/form/useSignupForm";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";

/**
 * The signup form as an event badge, hung on a lanyard strap.
 *
 * Same form as the signup page's card — same validation, same action, same
 * controls, via `useSignupForm` and `SignupFields`. What changes is the frame.
 *
 * The strap is two ribbons converging on the slot, the way a lanyard loop
 * reads from the front, and it runs up off the top of the page. No clasp:
 * the strap feeds straight through the slot, which is all the reference has
 * and all the eye needs to read "badge".
 *
 * It has to fit on one screen beside the hero, which is what sets the
 * spacing. Measure before adding anything to it.
 */

const EVENT_DATE = "Wednesday, October 14";

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
    Capped and centred: a badge is a portrait object, and stretched to the
    full width of this column it stops reading as one.
  */
  return (
    <div ref={root} className={`relative mx-auto max-w-[30rem] ${className}`}>
      <Strap />

      <div className="relative rounded-[2px] border border-ink/10 bg-badge px-6 pt-11 pb-5 text-ink shadow-[0_24px_48px_-20px_rgba(0,0,0,0.55)] sm:px-8">
        {/* The slot, in three layers so the strap goes *into* it rather than
            lying on top: the shadow the ribbons cast on the badge and the hole
            itself sit under the strap (z-5, strap is z-10); the hole's lower
            lip sits over it (z-20) and hides the ribbons' ends. */}
        <span
          aria-hidden
          className="absolute top-0 left-1/2 z-[5] h-[1.1rem] w-[4.25rem] -translate-x-[46%] bg-[linear-gradient(to_bottom,transparent,rgba(22,24,26,0.28))] blur-[3px]"
        />
        <span
          aria-hidden
          className="absolute top-4 left-1/2 z-[5] h-3.5 w-[4.5rem] -translate-x-1/2 rounded-full bg-[#0b0d0e] shadow-[inset_0_2px_3px_rgba(0,0,0,0.9),0_1px_0_rgba(255,255,255,0.55)]"
        />
        <span
          aria-hidden
          className="absolute top-[1.5rem] left-1/2 z-20 h-1.5 w-[4.5rem] -translate-x-1/2 rounded-b-full bg-[linear-gradient(to_bottom,#0b0d0e,#1d2124)] shadow-[0_1px_0_rgba(255,255,255,0.55)]"
        />

        {status === "success" ? (
          // A minimum height so the badge does not snap to a fraction of its
          // size the moment it is submitted, taking the page with it.
          <div className="flex min-h-[20rem] flex-col justify-center">
            <h2 className="font-sans text-2xl font-semibold leading-snug">
              Thanks — your request is on its way.
            </h2>
            <p className="mt-3 text-[0.92rem] leading-relaxed text-ink/70">
              Our team will be in touch within 48 hours to find a time that
              works for you.
            </p>
          </div>
        ) : (
          <>
            {/* The badge's printed head: who issued it, and for when. */}
            <div className="flex items-center justify-between gap-4">
              <Logo className="h-[1.25rem] text-ink" />
              <span className="font-sans text-[0.8rem] text-ink/65">
                {EVENT_DATE}
              </span>
            </div>
            <div className="mt-3 h-px bg-ink/15" />

            <h2 className="mt-4 font-sans text-[1.55rem] leading-tight font-semibold tracking-[-0.015em]">
              Let&rsquo;s Continue The Conversation
            </h2>
            <p className="mt-1.5 text-[0.86rem] leading-relaxed text-ink/70">
              Share a few details and our team will reach out within 48 hours
              to explore how Overclock can support your organization.
            </p>

            {/* noValidate: the browser's own bubbles would pre-empt our messages. */}
            <form onSubmit={onSubmit} noValidate className="mt-4 space-y-3">
              <SignupFields
                register={register}
                errors={errors}
                sending={sending}
                textareaRows={2}
                Field={BadgeField}
              />

              {formError && (
                <p role="alert" className="text-sm text-flag">
                  {formError}
                </p>
              )}

              <div className="pt-1">
                <SubmitButton sending={sending} variant="soft" />
              </div>
            </form>

            <p className="mt-4 text-center text-[0.76rem] text-ink/55">
              By submitting, you agree to receive updates from Overclock
              Accelerator. No spam.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * The lanyard: two flat ribbons meeting at the slot and opening into a V as
 * they rise, lit where they meet the badge and dissolving upwards.
 *
 * The two are deliberately unequal — the near side of the loop wide and
 * bright, the far side narrower, dimmer and leaning further out — which is
 * what makes it read as one loop seen at an angle rather than two sticks.
 *
 * The fade is what lets it run "off the page" at any height. On a phone the
 * badge sits far down the page and a hard-topped strap would start in mid-air
 * over the content above; faded, it simply comes from somewhere above.
 */
function Strap() {
  const ribbon = "absolute bottom-0 left-1/2 h-full origin-bottom";

  return (
    <div
      aria-hidden
      // Bottom sits inside the hole, just above its lower lip (card top +
      // 1.75rem), so the lip covers the ends. The mask is the upward fade.
      className="pointer-events-none absolute bottom-[calc(100%-1.75rem)] left-1/2 z-10 h-32 w-28 -translate-x-1/2 [mask-image:linear-gradient(to_top,black_40%,transparent)]"
    >
      <span
        className={`${ribbon} w-6 translate-x-[14%] rotate-[9deg]`}
        style={{ backgroundImage: FAR_RIBBON }}
      />
      <span
        className={`${ribbon} w-9 -translate-x-[96%] -rotate-[3deg]`}
        style={{ backgroundImage: NEAR_RIBBON }}
      />
    </div>
  );
}

/*
 * Each ribbon is four layers, top first:
 *  - the dark of the hole climbing up the ribbon as it goes in,
 *  - a fine cross-weave, which is what makes it read as webbing not plastic,
 *  - a slight curl across the width: one edge catching light, one turned away,
 *  - the colour itself, lit from the badge and darkening as it rises.
 * The far ribbon is darker throughout and its shadow climbs higher: it is
 * the back of the loop, behind the near one and turned from the light.
 */
const WEAVE =
  "repeating-linear-gradient(to top, rgba(0,0,0,0.07) 0 1px, transparent 1px 2.5px)";

const NEAR_RIBBON = [
  "linear-gradient(to top, rgba(2,12,10,0.95), rgba(2,12,10,0.55) 9px, transparent 22px)",
  WEAVE,
  "linear-gradient(90deg, rgba(255,255,255,0.14), transparent 28%, transparent 70%, rgba(0,0,0,0.28))",
  "linear-gradient(to top, #1fc3a3, #149a81 18%, #0e6b5c 48%, #0a4a40 85%)",
].join(", ");

const FAR_RIBBON = [
  "linear-gradient(to top, rgba(2,12,10,0.95), rgba(2,12,10,0.5) 26px, transparent 60px)",
  WEAVE,
  "linear-gradient(90deg, rgba(0,0,0,0.3), transparent 35%, rgba(255,255,255,0.08))",
  "linear-gradient(to top, #12957c, #0e7564 30%, #0a5146 70%, #083c34)",
].join(", ");

/**
 * A field as the badge sets one: the label above, a line beneath.
 * Same contract as the card's `Field`, so `SignupFields` does not care which
 * of the two it is handed. The hint becomes the placeholder here, because
 * with the label outside the box there is room for an example inside it.
 */
function BadgeField({
  label,
  required,
  error,
  hint,
  children,
}: React.ComponentProps<typeof import("@/components/form/Field").Field>) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="block font-serif text-[0.8rem] text-ink/80"
      >
        {label}
        {required && <span className="text-flag"> *</span>}
      </label>

      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
        placeholder: hint ?? "",
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
