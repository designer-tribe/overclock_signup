"use client";

import { useSyncExternalStore } from "react";
import {
  getSelectionKey,
  getServerSelectionKey,
  parseSelection,
  setSelection,
  subscribe,
  type Selection,
} from "@/lib/variations";
import { VariantOne } from "@/components/variants/VariantOne";
import { VariantTwo } from "@/components/variants/VariantTwo";
import { VariantThree } from "@/components/variants/VariantThree";
import { LandingOne } from "@/components/landing/LandingOne";
import { LandingTwo } from "@/components/landing/LandingTwo";
import { VariationPanel } from "./VariationPanel";

/**
 * Renders whichever design the URL asks for, plus the control to change it.
 *
 * Only the active one is mounted, not all of them hidden behind CSS — they
 * pull quite different assets (a 2.1MB video, full-bleed photographs, a WebGL
 * bundle) and rendering the set would fetch all of it on every visit.
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
      {render(selection)}
      <VariationPanel selection={selection} onChange={setSelection} />
    </>
  );
}

function render(selection: Selection) {
  if (selection.page === "landing") {
    // The registry decides which ids are reachable, so anything else has
    // already been normalised away before it gets here.
    return selection.variation === 2 ? <LandingTwo /> : <LandingOne />;
  }

  switch (selection.variation) {
    case 3:
      return <VariantThree />;
    case 2:
      return <VariantTwo background={selection.background} />;
    default:
      return <VariantOne />;
  }
}
