import { VariationSwitcher } from "@/components/variations/VariationSwitcher";

/**
 * The landing page, in two layouts under review (V1, V2). Which one renders
 * is decided client-side from `?v=` — see lib/variations.ts.
 */
export default function Page() {
  return <VariationSwitcher />;
}
