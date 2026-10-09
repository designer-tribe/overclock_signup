"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema, type SignupInput } from "@/lib/schema";
import { submitSignup } from "@/app/actions";

/**
 * Everything the signup form does, with nothing about how it looks.
 *
 * There are two presentations of this form — the card the signup page uses and
 * the nametag on the landing page — and they must not drift apart on what they
 * validate, what they send, or how they recover from a server-side rejection.
 * One of those copies would eventually be the one that forgets to re-attach
 * field errors.
 */
export function useSignupForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<SignupInput>({
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

  const onSubmit = form.handleSubmit(async (values) => {
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
        form.setError(field as keyof SignupInput, {
          type: "server",
          message,
        });
      }
    }
    setFormError(result.message);
    setStatus("idle");
  });

  return {
    register: form.register,
    errors: form.formState.errors,
    onSubmit,
    status,
    sending: status === "sending",
    formError,
  };
}
