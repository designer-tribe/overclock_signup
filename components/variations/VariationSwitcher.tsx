"use client";

import { useSyncExternalStore } from "react";
import {
  getServerVariation,
  getVariation,
  setVariation,
  subscribe,
} from "@/lib/variations";
import { LandingOne } from "@/components/landing/LandingOne";
import { LandingTwo } from "@/components/landing/LandingTwo";
import { VariationPanel } from "./VariationPanel";

/**
 * Renders whichever landing layout the URL asks for, plus the control to
 * change it. Only the active one is mounted, not both hidden behind CSS.
 */
export function VariationSwitcher() {
  const variation = useSyncExternalStore(
    subscribe,
    getVariation,
    getServerVariation,
  );

  return (
    <>
      {variation === 2 ? <LandingTwo /> : <LandingOne />}
      <VariationPanel variation={variation} onChange={setVariation} />
    </>
  );
}
