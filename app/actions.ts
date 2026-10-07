"use server";

import { signupSchema, type SignupInput } from "@/lib/schema";
import { getSignupStore } from "@/lib/storage";

export type SignupResult =
  | { ok: true }
  /** `fieldErrors` lets the client re-attach server-side messages to inputs. */
  | { ok: false; message: string; fieldErrors?: Partial<Record<keyof SignupInput, string>> };

/**
 * Receives a signup, validates it again, hands it to the configured store.
 *
 * The client validates with the same schema, but that is only there to give
 * fast feedback — a Server Action is a public endpoint and anything can POST to
 * it, so this validation is the one that actually matters.
 */
export async function submitSignup(input: unknown): Promise<SignupResult> {
  const parsed = signupSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Partial<Record<keyof SignupInput, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      // Keep the first message per field; later ones are usually noise.
      if (typeof key === "string" && !(key in fieldErrors)) {
        fieldErrors[key as keyof SignupInput] = issue.message;
      }
    }
    return { ok: false, message: "Periksa kembali data yang diisi.", fieldErrors };
  }

  try {
    await getSignupStore().save({
      ...parsed.data,
      submittedAt: new Date().toISOString(),
    });
    return { ok: true };
  } catch (error) {
    // Log the real cause server-side; the visitor gets something actionable
    // instead of a stack trace or a misconfiguration detail.
    console.error("[signup] failed to persist submission", error);
    return {
      ok: false,
      message: "Gagal menyimpan data. Coba lagi sebentar, atau hubungi kami langsung.",
    };
  }
}
