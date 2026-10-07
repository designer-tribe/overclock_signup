import { z } from "zod";

/**
 * One schema, used by the client form and re-run inside the Server Action.
 * Client-side validation is a convenience; the server copy is the real gate.
 *
 * These fields are a reasonable starting set — swap them for the real ones once
 * the form content is final. Changing a field here updates the form UI, the
 * action, and the storage adapters together.
 */
export const SESSION_SLOTS = [
  "morning",
  "afternoon",
  "evening",
] as const;

export const slotLabels: Record<(typeof SESSION_SLOTS)[number], string> = {
  morning: "Pagi (09:00 – 12:00)",
  afternoon: "Siang (13:00 – 16:00)",
  evening: "Sore (16:00 – 19:00)",
};

export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(80, "Nama terlalu panjang"),
  email: z.email("Format email tidak valid").max(160, "Email terlalu panjang"),
  company: z
    .string()
    .trim()
    .max(120, "Nama perusahaan terlalu panjang")
    .optional()
    .or(z.literal("")),
  preferredDate: z
    .string()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Tanggal tidak valid")
    .refine((value) => {
      // Compare against the start of today so "today" stays selectable.
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(value) >= today;
    }, "Pilih tanggal hari ini atau setelahnya"),
  preferredSlot: z.enum(SESSION_SLOTS, {
    message: "Pilih salah satu slot waktu",
  }),
  notes: z.string().trim().max(600, "Catatan maksimal 600 karakter").optional().or(z.literal("")),
});

export type SignupInput = z.infer<typeof signupSchema>;

/** What the storage layer receives: validated input plus server-side metadata. */
export type SignupRecord = SignupInput & {
  submittedAt: string;
};
