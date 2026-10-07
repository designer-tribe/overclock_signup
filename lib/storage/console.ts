import type { SignupStore } from "./types";

/**
 * Default adapter until the real destination is wired up.
 *
 * It genuinely persists nothing — that is deliberate, so a half-configured
 * deploy cannot look like it is collecting signups when it is not. On Vercel the
 * output lands in the function logs.
 */
export const consoleStore: SignupStore = {
  name: "console",
  async save(record) {
    console.info("[signup] received (not persisted — storage is stubbed)", {
      ...record,
      // Keep the raw email out of logs; enough is kept to debug duplicates.
      email: record.email.replace(/^(.).*(@.*)$/, "$1***$2"),
    });
  },
};
