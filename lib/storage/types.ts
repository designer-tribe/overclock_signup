import type { SignupRecord } from "@/lib/schema";

/**
 * The seam between the form and wherever signups actually end up.
 *
 * The destination is not settled yet (Google Sheets is the likely first one),
 * so nothing above this interface is allowed to know about it. Swapping backends
 * means adding an adapter and changing `SIGNUP_STORAGE` — no component or action
 * code moves.
 */
export interface SignupStore {
  /** Human-readable name, used in logs and in the health check. */
  readonly name: string;
  /**
   * Persist one signup. Throw to signal failure — the Server Action turns a
   * throw into a user-facing error and does not report success.
   */
  save(record: SignupRecord): Promise<void>;
}
