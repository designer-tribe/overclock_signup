import { z } from "zod";

/**
 * One schema, used by the client form and re-run inside the Server Action.
 * Client-side validation is a convenience; the server copy is the real gate.
 *
 * Fields follow the approved design. Note there is no date or time picker: the
 * card promises the team will reach out within 48 hours, so scheduling happens
 * over email rather than on the page.
 *
 * Only `email` is required, which is what the design marks with an asterisk.
 */
export const signupSchema = z.object({
  name: z.string().trim().max(80, "Please use 80 characters or fewer").optional().or(z.literal("")),
  email: z.email("Please enter a valid email address").max(160, "That email is too long"),
  organization: z
    .string()
    .trim()
    .max(120, "Please use 120 characters or fewer")
    .optional()
    .or(z.literal("")),
  jobTitle: z
    .string()
    .trim()
    .max(120, "Please use 120 characters or fewer")
    .optional()
    .or(z.literal("")),
  interest: z
    .string()
    .trim()
    .max(1000, "Please use 1000 characters or fewer")
    .optional()
    .or(z.literal("")),
});

export type SignupInput = z.infer<typeof signupSchema>;

/** What the storage layer receives: validated input plus server-side metadata. */
export type SignupRecord = SignupInput & {
  submittedAt: string;
};
