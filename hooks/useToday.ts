"use client";

import { useSyncExternalStore } from "react";

/** Today as `yyyy-mm-dd` in the visitor's timezone — `toISOString` alone would shift the day. */
function todayLocal(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** Nothing to subscribe to — the value is read fresh on each client render. */
const noopSubscribe = () => () => {};

/**
 * Today's date, read only on the client.
 *
 * Next's prerender rejects `new Date()` during render, since a build-time "today"
 * would be baked into the static HTML and go stale. Reading it through
 * `useSyncExternalStore` keeps it out of the server snapshot without a
 * setState-in-effect round trip.
 *
 * Returns `undefined` on the server, so callers must treat the value as
 * optional. It only drives the date picker's `min` hint anyway — the Server
 * Action is what actually rejects past dates.
 */
export function useToday(): string | undefined {
  return useSyncExternalStore(noopSubscribe, todayLocal, () => undefined);
}
