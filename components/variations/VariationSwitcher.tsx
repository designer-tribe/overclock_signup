"use client";

import { useSyncExternalStore } from "react";
import {
  getServerVariation,
  getVariation,
  setVariation,
  subscribe,
} from "@/lib/variations";
import { VariantOne } from "@/components/variants/VariantOne";
import { VariantTwo } from "@/components/variants/VariantTwo";
import { VariationPanel } from "./VariationPanel";

/**
 * Renders whichever variation the URL asks for, plus the control to change it.
 *
 * Only the active variation is mounted, not both hidden behind CSS — the two
 * pull quite different assets (a 2.1MB video against a full-bleed photograph)
 * and rendering the pair would fetch both on every visit.
 */
export function VariationSwitcher() {
  const active = useSyncExternalStore(subscribe, getVariation, getServerVariation);

  return (
    <>
      {active === 2 ? <VariantTwo /> : <VariantOne />}
      <VariationPanel active={active} onSelect={setVariation} />
    </>
  );
}
