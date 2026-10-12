/**
 * The footer's links, in one place.
 *
 * Trimmed from the original footer (Explore, Blog, and "Still exploring?
 * View our Accelerators" were asked to go), but the social row was asked
 * back — see `SOCIAL_LINKS` below for where those three hrefs come from.
 *
 * ⚠ `SUPPORT_LINKS` is still partly a guess. overclockaccelerator.com is
 * blocked at the DNS level in this environment, so it cannot be fetched
 * directly. Web search (which runs server-side, not through this
 * environment's network) confirms the live footer really does read "Blog
 * Contact Us Privacy Policy Terms and Conditions" — so the **labels** are
 * right — but it did not surface the individual pages' own URLs, only the
 * site's structured contact details. The **paths** below are inferred from
 * the labels, same as before. Check them before this goes anywhere public.
 */

const SITE = "https://www.overclockaccelerator.com";

export type FooterLink = { label: string; href: string };

export const SUPPORT_LINKS: FooterLink[] = [
  { label: "Contact Us", href: `${SITE}/contact` },
  { label: "Privacy Policy", href: `${SITE}/privacy-policy` },
  { label: "Terms and Conditions", href: `${SITE}/terms-and-conditions` },
];

/**
 * The social row. Unlike `SUPPORT_LINKS`, these three are confirmed, not
 * guessed: web search surfaced them from the live site's own structured
 * data (its listed social profiles) and from its public contact details,
 * not inferred from a label.
 *
 *  - email  → team@overclockaccelerator.com, the address the site itself
 *             lists for support.
 *  - linkedin → linkedin.com/company/overclock-accelerator, named directly
 *             in the site's social-profile metadata.
 *  - youtube → youtube.com/@overclockaccelerator, the handle the site's
 *             metadata gives for its YouTube channel.
 */
export const SOCIAL_LINKS: Array<
  FooterLink & { icon: "email" | "linkedin" | "youtube" }
> = [
  {
    icon: "email",
    label: "Email Overclock",
    href: "mailto:team@overclockaccelerator.com",
  },
  {
    icon: "linkedin",
    label: "Overclock on LinkedIn",
    href: "https://www.linkedin.com/company/overclock-accelerator",
  },
  {
    icon: "youtube",
    label: "Overclock on YouTube",
    href: "https://www.youtube.com/@overclockaccelerator",
  },
];

/** Where the "Built by Tribe" signature in the footer points. */
export const TRIBE_HREF = "https://tribedesignworks.com/";
