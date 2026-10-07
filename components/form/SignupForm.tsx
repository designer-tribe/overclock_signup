"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import { signupSchema, type SignupInput } from "@/lib/schema";
import { submitSignup } from "@/app/actions";
import { Field } from "./Field";

export function SignupForm({ className = "" }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    // Validate on blur rather than per keystroke — errors appearing mid-typing
    // read as the form nagging.
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      organization: "",
      jobTitle: "",
      interest: "",
    },
  });

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

  const onSubmit = async (values: SignupInput) => {
    setStatus("sending");
    setFormError(null);

    const result = await submitSignup(values);

    if (result.ok) {
      setStatus("success");
      return;
    }

    // Re-attach whatever the server rejected to the matching inputs.
    if (result.fieldErrors) {
      for (const [field, message] of Object.entries(result.fieldErrors)) {
        setError(field as keyof SignupInput, { type: "server", message });
      }
    }
    setFormError(result.message);
    setStatus("idle");
  };

  const sending = status === "sending";

  return (
    <div ref={root} className={`bg-sand p-7 sm:p-10 ${className}`}>
      {status === "success" ? (
        // min-height keeps the card from collapsing when the form is replaced,
        // which would otherwise yank the whole page layout upward.
        <div className="flex min-h-[28rem] flex-col justify-center">
          <h2 className="font-serif text-2xl sm:text-[1.75rem]">
            Thanks — your request is on its way.
          </h2>
          <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-ink/70">
            Our team will be in touch within 48 hours to find a time that works
            for you.
          </p>
        </div>
      ) : (
        <>
          <h2 className="font-serif text-2xl leading-snug sm:text-[1.75rem]">
            Let&rsquo;s Continue The Conversation
          </h2>
          <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-ink/75">
            Share a few details and our team will reach out within 48 hours to
            explore how Overclock can support your organization.
          </p>

          {/* noValidate: the browser's own bubbles would pre-empt our messages. */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-7 space-y-2.5">
            <Field label="Name" error={errors.name?.message}>
              {(props) => (
                <input {...props} {...register("name")} type="text" autoComplete="name" disabled={sending} />
              )}
            </Field>

            <Field label="Email" required error={errors.email?.message}>
              {(props) => (
                <input {...props} {...register("email")} type="email" autoComplete="email" disabled={sending} />
              )}
            </Field>

            <div className="grid gap-2.5 sm:grid-cols-2">
              <Field label="Organization" error={errors.organization?.message}>
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

              <Field label="Job title" error={errors.jobTitle?.message}>
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

            <Field label="What sparked your interest today?" error={errors.interest?.message}>
              {(props) => (
                <textarea {...props} {...register("interest")} rows={5} disabled={sending} className={`${props.className} resize-none`} />
              )}
            </Field>

            {formError && (
              <p role="alert" className="pt-1 text-sm text-flag">
                {formError}
              </p>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={sending}
                // The hard offset shadow is the design's "sitting on the page"
                // treatment; pressing collapses it rather than fading it.
                className="group flex w-full items-center justify-center gap-2.5 bg-teal px-6 py-4 text-[0.95rem] font-medium text-white shadow-[0_4px_0_0_var(--color-ink)] transition-[transform,box-shadow] duration-150 hover:translate-y-[2px] hover:shadow-[0_2px_0_0_var(--color-ink)] active:translate-y-[4px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-70"
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
                    <path d="M4 12h15m0 0-5.5-5.5M19 12l-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
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
