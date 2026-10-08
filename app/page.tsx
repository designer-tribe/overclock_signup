import { VariationSwitcher } from "@/components/variations/VariationSwitcher";

/**
 * The page is a single section with two design variations under review.
 * Which one renders is decided client-side from `?v=` — see lib/variations.ts.
 */
export default function Page() {
  return <VariationSwitcher />;
}
