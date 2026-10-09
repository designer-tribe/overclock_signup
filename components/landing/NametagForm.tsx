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
      {/* The loop threads the slot: the far ribbon runs down behind the badge
          (z-0) and shows again inside the hole; the near one comes down over
          the badge (z-20) and goes into the hole. */}
      <Strap side="far" />
      <Strap side="near" />

      <div className={`relative z-10 rounded-[2px] border border-ink/10 bg-badge px-6 pt-11 pb-5 text-ink shadow-[0_24px_48px_-20px_rgba(0,0,0,0.55)] sm:px-8`}>
        <Slot />

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
                <SubmitButton sending={sending} variant="outlined" />
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

/*
 * The lanyard: two ribbons of equal width threading the slot — the near one
 * over the badge, the far one behind it — opening into a V as they rise off
 * the top of the page.
 *
 * Both sides of the strap are the same webbing, so the same width; the far
 * one is only a shade darker, being the back of the loop.
 *
 * FAR_X is shared with `Slot`, which shows the far ribbon again through the
 * hole: change one and the piece in the hole stops lining up.
 */
const RIBBON_W = "w-9"; // 2.25rem
const NEAR_X = "-translate-x-full";
const FAR_X = "translate-x-[4%]";

function Strap({ side }: { side: "near" | "far" }) {
  const near = side === "near";

  return (
    <div
      aria-hidden
      /*
        Tall enough on desktop to always run off the top of the screen. On a
        phone the badge sits under the hero copy, and a strap that tall would
        cross it — so there it is shorter, and the page clips it flat at the
        photograph's bottom edge (see the form wrappers in LandingOne and
        LandingTwo), as if it ran up behind the photo. No fade either way.

        The near ribbon ends at the hole's centre line, darkening into it; the
        far one ends behind the badge, level with the hole's lip.
      */
      className={`pointer-events-none absolute left-1/2 h-40 w-28 -translate-x-1/2 lg:h-[100vh] ${
        near ? "bottom-[calc(100%-1.45rem)] z-20 drop-shadow-[1px_2px_2px_rgba(0,0,0,0.22)]" : "bottom-[calc(100%-1.75rem)] z-0"
      }`}
    >
      <span
        className={`absolute bottom-0 left-1/2 h-full origin-bottom ${RIBBON_W} ${
          near ? `${NEAR_X} -rotate-[3deg]` : `${FAR_X} rotate-[9deg]`
        }`}
        style={{
          backgroundImage: near ? `${INTO_HOLE}, ${NEAR_RIBBON}` : FAR_RIBBON,
        }}
      />
    </div>
  );
}

/**
 * The hole the strap threads. The near ribbon goes into it from above; the
 * far one shows inside it, coming through from behind the badge: lit at the
 * lower edge where it turns towards the viewer, dark at the top.
 */
function Slot() {
  const piece = `absolute inset-y-0 left-1/2 ${RIBBON_W}`;
  return (
    <span
      aria-hidden
      className="absolute top-4 left-1/2 h-3.5 w-20 -translate-x-1/2 overflow-hidden rounded-full bg-[#0b0d0e] shadow-[0_1px_0_rgba(255,255,255,0.55)]"
    >
      <span
        className={`${piece} ${FAR_X}`}
        style={{ backgroundImage: `${IN_HOLE}, ${FAR_RIBBON}` }}
      />
      {/* The hole's own depth, over the ribbon inside it. */}
      <span className="absolute inset-0 rounded-full shadow-[inset_0_2px_3px_rgba(0,0,0,0.9)]" />
    </span>
  );
}

/*
 * A ribbon is solid webbing in two layers, top first: a fine cross-weave,
 * which makes it read as fabric rather than plastic, and a slight curl across
 * the width — one edge catching light, one turned away — over a flat colour.
 */
const WEAVE =
  "repeating-linear-gradient(to top, rgba(0,0,0,0.07) 0 1px, transparent 1px 2.5px)";

const NEAR_RIBBON = [
  WEAVE,
  "linear-gradient(90deg, rgba(255,255,255,0.14), transparent 28%, transparent 70%, rgba(0,0,0,0.28))",
  "linear-gradient(#0f7563, #0f7563)",
].join(", ");

const FAR_RIBBON = [
  WEAVE,
  "linear-gradient(90deg, rgba(0,0,0,0.3), transparent 35%, rgba(255,255,255,0.08))",
  "linear-gradient(#0b5b4e, #0b5b4e)",
].join(", ");

/** The near ribbon's end, going down into the dark of the hole. */
const INTO_HOLE =
  "linear-gradient(to top, #0b0d0e, rgba(11,13,14,0.6) 4px, transparent 12px)";

/**
 * The far ribbon inside the hole, given the same curl as the near one's end so
 * the two read as one strap turning through the slot: shadowed under the
 * hole's top edge, a soft highlight where the webbing rounds over, then
 * falling into the same dark the near ribbon goes into at the bottom.
 */
const IN_HOLE =
  "linear-gradient(to bottom, rgba(2,10,9,0.7), transparent 30%, rgba(255,255,255,0.12) 45%, transparent 58%, rgba(11,13,14,0.6) 78%, #0b0d0e)";

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
