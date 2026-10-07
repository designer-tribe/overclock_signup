import { consoleStore } from "./console";
import { sheetsStore } from "./sheets";
import type { SignupStore } from "./types";

const stores: Record<string, SignupStore> = {
  console: consoleStore,
  sheets: sheetsStore,
};

/**
 * Pick the adapter from `SIGNUP_STORAGE`, defaulting to the console stub.
 *
 * An unknown value throws rather than silently falling back: a typo in a deploy
 * env var should fail loudly, not quietly stop collecting signups.
 */
export function getSignupStore(): SignupStore {
  const key = process.env.SIGNUP_STORAGE ?? "console";
  const store = stores[key];
  if (!store) {
    throw new Error(
      `[signup] Unknown SIGNUP_STORAGE "${key}". Expected one of: ${Object.keys(stores).join(", ")}.`,
    );
  }
  return store;
}

export type { SignupStore };
