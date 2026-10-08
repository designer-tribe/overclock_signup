"use client";

import { useSyncExternalStore } from "react";
import {
  getSelectionKey,
  getServerSelectionKey,
  parseSelection,
  setSelection,
  subscribe,
} from "@/lib/variations";
import { VariantOne } from "@/components/variants/VariantOne";
import { VariantTwo } from "@/components/variants/VariantTwo";
import { VariantThree } from "@/components/variants/VariantThree";
import { VariationPanel } from "./VariationPanel";

/**
 * Renders whichever variation the URL asks for, plus the control to change it.
 *
 * Only the active variation is mounted, not all of them hidden behind CSS —
 * they pull quite different assets (a 2.1MB video, a full-bleed photograph, a
 * WebGL bundle) and rendering the set would fetch all of it on every visit.
 */
export function VariationSwitcher() {
  const key = useSyncExternalStore(
    subscribe,
    getSelectionKey,
    getServerSelectionKey,
  );
  const selection = parseSelection(key);

  return (
    <>
      {selection.variation === 3 ? (
        <VariantThree />
      ) : selection.variation === 2 ? (
        <VariantTwo background={selection.background} />
      ) : (
        <VariantOne />
      )}
      <VariationPanel selection={selection} onChange={setSelection} />
    </>
  );
}
