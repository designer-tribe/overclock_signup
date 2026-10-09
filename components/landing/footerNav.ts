/**
 * The footer's links, in one place.
 *
 * ⚠ The **labels** are transcribed from the supplied footer and are right. The
 * **paths** are inferred from those labels: overclockaccelerator.com is blocked
 * by this environment's network policy, so the real hrefs could not be read off
 * the live site. Check them before this goes anywhere public — they are all
 * here, so it is one file to correct.
 */

const SITE = "https://www.overclockaccelerator.com";

export type FooterLink = { label: string; href: string };

/** Two sub-columns, as the supplied footer has them. */
export const EXPLORE_LINKS: FooterLink[][] = [
  [
    { label: "Our Story", href: `${SITE}/our-story` },
    { label: "What We Do", href: `${SITE}/what-we-do` },
    { label: "Testimonials", href: `${SITE}/testimonials` },
  ],
  [
    { label: "Accelerators", href: `${SITE}/accelerators` },
    { label: "Corporate Training", href: `${SITE}/corporate-training` },
    { label: "Consulting", href: `${SITE}/consulting` },
  ],
];

export const SUPPORT_LINKS: FooterLink[] = [
  { label: "Blog", href: `${SITE}/blog` },
  { label: "Contact Us", href: `${SITE}/contact` },
  { label: "Privacy Policy", href: `${SITE}/privacy-policy` },
  { label: "Terms and Conditions", href: `${SITE}/terms-and-conditions` },
];

/** The social row. Handles are unknown for the same reason as the paths. */
export const SOCIAL_LINKS: Array<FooterLink & { icon: "email" | "linkedin" | "youtube" }> =
  [
    { icon: "email", label: "Email Overclock", href: `${SITE}/contact` },
    { icon: "linkedin", label: "Overclock on LinkedIn", href: SITE },
    { icon: "youtube", label: "Overclock on YouTube", href: SITE },
  ];

export const ENROL_HREF = `${SITE}/accelerators`;
