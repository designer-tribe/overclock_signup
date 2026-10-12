/**
 * The footer's links, in one place.
 *
 * Trimmed down to three: Contact Us, Privacy Policy, Terms and Conditions —
 * everything else the original footer had (Explore, Blog, the social row,
 * "Still exploring? View our Accelerators") was asked to go.
 *
 * ⚠ The **labels** are transcribed from the supplied footer and are right. The
 * **paths** are inferred from those labels: overclockaccelerator.com is
 * blocked by this environment's network policy (DNS-level, confirmed again —
 * not just WebFetch) and does not surface in web search either, so the real
 * hrefs could not be verified against the live site. Check them before this
 * goes anywhere public.
 */

const SITE = "https://www.overclockaccelerator.com";

export type FooterLink = { label: string; href: string };

export const SUPPORT_LINKS: FooterLink[] = [
  { label: "Contact Us", href: `${SITE}/contact` },
  { label: "Privacy Policy", href: `${SITE}/privacy-policy` },
  { label: "Terms and Conditions", href: `${SITE}/terms-and-conditions` },
];

/** Where the "Built by Tribe" signature in the footer points. */
export const TRIBE_HREF = "https://tribedesignworks.com/";
