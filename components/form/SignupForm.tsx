"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import { Field } from "./Field";
import { SignupFields, SubmitButton } from "./SignupFields";
import { useSignupForm } from "./useSignupForm";

/**
 * The signup form as a card — the signup page's three variations.
 *
 * The landing page renders the same form as a nametag instead; both share
 * `useSignupForm` for the logic and `SignupFields` for the controls, so the
 * only thing that differs between them is the surface.
 */
export function SignupForm({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const { register, errors, onSubmit, status, sending, formError } =
    useSignupForm();

  // Placeholder entrance, kept deliberately plain until the motion pass.
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
        delay: 0.25,
        ease: "expo.out",
      });
    },
    { scope: root },
  );

  // The card is a light surface wherever it is placed, so it states its own
  // colours rather than inheriting them. Variation 2 sets `text-white` on the
  // section around it, which otherwise left the headings white on sand.
  return (
    <div ref={root} className={`bg-sand p-7 text-ink sm:p-10 ${className}`}>
      {status === "success" ? (
        // min-height keeps the card from collapsing when the form is replaced,
        // which would otherwise yank the whole page layout upward.
        <div className="flex min-h-[28rem] flex-col justify-center">
          <h2 className="font-serif text-2xl text-ink sm:text-[1.75rem]">
            Thanks — your request is on its way.
          </h2>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink/70">
            Our team will be in touch within 48 hours to find a time that works
            for you.
          </p>
        </div>
      ) : (
        <>
          <h2 className="font-serif text-2xl leading-snug text-ink sm:text-[1.75rem]">
            Let&rsquo;s Continue The Conversation
          </h2>
          <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-ink/75">
            Share a few details and our team will reach out within 48 hours to
            explore how Overclock can support your organization.
          </p>

          {/* noValidate: the browser's own bubbles would pre-empt our messages. */}
          <form onSubmit={onSubmit} noValidate className="mt-7 space-y-2.5">
            <SignupFields
              register={register}
              errors={errors}
              sending={sending}
              Field={Field}
            />

            {formError && (
              <p role="alert" className="pt-1 text-sm text-flag">
                {formError}
              </p>
            )}

            <div className="pt-4">
              <SubmitButton sending={sending} />
            </div>

            <p className="pt-3 text-xs leading-relaxed text-ink/60">
              By submitting, you agree to receive updates from Overclock
              Accelerator. No spam.
            </p>
          </form>
        </>
      )}
    </div>
  );
}
