"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";
import { useToday } from "@/hooks/useToday";
import { signupSchema, slotLabels, SESSION_SLOTS, type SignupInput } from "@/lib/schema";
import { submitSignup } from "@/app/actions";
import { Field, controlClass } from "./Field";

export function SignupForm() {
  const root = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "success">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const today = useToday();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    // Validate as fields are left, not on every keystroke — errors appearing
    // mid-typing read as the form nagging.
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      company: "",
      preferredDate: "",
      preferredSlot: "morning",
      notes: "",
    },
  });

  // Entrance: the form panel arrives just after the headline.
  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(root.current, { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.from(root.current, {
        autoAlpha: 0,
        y: 28,
        duration: 1,
        delay: 0.35,
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

  if (status === "success") {
    return (
      <div
        ref={root}
        className="rounded-2xl border border-white/12 bg-white/[0.05] p-8 backdrop-blur-xl"
      >
        <h2 className="text-xl font-medium text-white">Terima kasih — permintaan terkirim.</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/55">
          Tim Overclock akan mengirimkan konfirmasi jadwal ke email kamu. Kalau slot
          yang dipilih sudah penuh, kami tawarkan alternatif terdekat.
        </p>
      </div>
    );
  }

  const sending = status === "sending";

  return (
    <div
      ref={root}
      className="rounded-2xl border border-white/12 bg-white/[0.05] p-6 backdrop-blur-xl sm:p-8"
    >
      {/* noValidate: the browser's own bubbles would pre-empt our messages. */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <Field label="Nama lengkap" error={errors.name?.message}>
          {(props) => (
            <input
              {...props}
              {...register("name")}
              type="text"
              autoComplete="name"
              placeholder="Nama kamu"
              disabled={sending}
              className={controlClass}
            />
          )}
        </Field>

        <Field label="Email" error={errors.email?.message}>
          {(props) => (
            <input
              {...props}
              {...register("email")}
              type="email"
              autoComplete="email"
              placeholder="nama@perusahaan.com"
              disabled={sending}
              className={controlClass}
            />
          )}
        </Field>

        <Field label="Perusahaan" hint="Opsional" error={errors.company?.message}>
          {(props) => (
            <input
              {...props}
              {...register("company")}
              type="text"
              autoComplete="organization"
              placeholder="Nama perusahaan"
              disabled={sending}
              className={controlClass}
            />
          )}
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tanggal" error={errors.preferredDate?.message}>
            {(props) => (
              <input
                {...props}
                {...register("preferredDate")}
                type="date"
                min={today}
                disabled={sending}
                className={`${controlClass} [color-scheme:dark]`}
              />
            )}
          </Field>

          <Field label="Slot waktu" error={errors.preferredSlot?.message}>
            {(props) => (
              <select
                {...props}
                {...register("preferredSlot")}
                disabled={sending}
                className={controlClass}
              >
                {SESSION_SLOTS.map((slot) => (
                  <option key={slot} value={slot} className="bg-[#0a0a12]">
                    {slotLabels[slot]}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>

        <Field
          label="Yang ingin dibahas"
          hint="Opsional — membantu kami menyiapkan sesi"
          error={errors.notes?.message}
        >
          {(props) => (
            <textarea
              {...props}
              {...register("notes")}
              rows={3}
              placeholder="Misalnya: integrasi data, otomasi workflow, ..."
              disabled={sending}
              className={`${controlClass} resize-none`}
            />
          )}
        </Field>

        {formError && (
          <p role="alert" className="text-sm text-[#ff9b7a]">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="group relative w-full overflow-hidden rounded-lg bg-white px-5 py-3 text-[15px] font-medium text-[#0a0a12] transition-transform duration-200 hover:scale-[1.015] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
        >
          {sending ? "Mengirim…" : "Jadwalkan sesi"}
        </button>

        <p className="text-center text-xs text-white/30">
          Kami hanya menggunakan data ini untuk mengatur jadwal sesi kamu.
        </p>
      </form>
    </div>
  );
}
