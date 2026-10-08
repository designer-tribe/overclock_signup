import type { StaticImageData } from "next/image";
import type { BackgroundId } from "@/lib/variations";
import deskPhoto from "@/assets/variation-two-bg-1.webp";
import workshopPhoto from "@/assets/variation-two-bg-2.webp";

/**
 * The photographs behind variation 2, keyed by the id in the URL.
 *
 * Kept in their own module so the picker can show thumbnails of exactly the
 * files the variant renders — one source of truth rather than a list in the
 * control and another in the page.
 */
export const VARIATION_TWO_BACKGROUNDS: Record<BackgroundId, StaticImageData> = {
  1: deskPhoto,
  2: workshopPhoto,
};
