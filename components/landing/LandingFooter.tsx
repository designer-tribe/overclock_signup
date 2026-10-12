import Image from "next/image";
import tribeSignature from "@/assets/tribe-signature.png";
import {
  SOCIAL_LINKS,
  SUPPORT_LINKS,
  TRIBE_HREF,
  type FooterLink,
} from "./footerNav";

/**
 * The site footer, trimmed to what was asked to stay: the intro copy (no
 * longer a link to anywhere), three Support links — Contact Us, Privacy
 * Policy, Terms and Conditions — and the social icon row. Explore, Blog and
 * "Still exploring? View our Accelerators" are gone for good; `footerNav.ts`
 * no longer has data for them, so they cannot quietly reappear here. The
 * social row was asked back after an earlier pass dropped it too far —
 * `SOCIAL_LINKS` is sourced, not guessed; see the note there.
 *
 * Three columns now rather than four — see the warning in `footerNav.ts`
 * about the Support links' paths.
 */
export function LandingFooter() {
  return (
    <footer className="bg-void text-white">
      <div className="mx-auto w-full max-w-[1500px] px-6 py-10 sm:px-10 lg:px-14">
        {/* The box is the footer's own frame, inset from the page edges, which
            is what keeps it from reading as the page simply turning black. */}
        <div className="border border-white/15">
          <div className="grid gap-x-10 gap-y-12 p-8 sm:grid-cols-2 sm:p-10 lg:p-12 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,0.7fr)]">
            <div>
              <h2 className="font-serif text-[1.6rem] leading-tight">
                Ready to Join a Cohort?
              </h2>
              <p className="mt-3 max-w-xs text-[0.95rem] leading-relaxed text-white/80">
                Know which Accelerator you want? Skip straight to enrollment.
              </p>
            </div>

            <FooterGroup title="Support">
              <ul className="space-y-4">
                {SUPPORT_LINKS.map((link) => (
                  <FooterItem key={link.label} {...link} />
                ))}
              </ul>
            </FooterGroup>

            <FooterGroup title="Stay connected">
              <ul className="flex gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.icon}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      className="flex h-11 w-11 items-center justify-center border border-white/80 transition-colors hover:bg-white hover:text-void focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
                    >
                      <SocialIcon name={social.icon} />
                    </a>
                  </li>
                ))}
              </ul>
            </FooterGroup>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/15 px-8 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-12">
            <p className="font-sans text-[0.8rem] tracking-[0.08em] text-white/85 uppercase">
              &copy; Copyright 2026 Overclock Accelerator
            </p>

            <p className="flex items-center gap-3 font-sans text-[0.8rem] tracking-[0.08em] text-white/85 uppercase">
              Built by
              <a
                href={TRIBE_HREF}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Tribe — opens in a new tab"
                className="transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
              >
                {/* The Tribe signature, white on transparency. The file is
                    trimmed to the mark, so its height sets its size directly. */}
                <Image src={tribeSignature} alt="Tribe" className="h-8 w-auto" />
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-sans text-[0.7rem] font-medium tracking-[0.16em] text-white/55 uppercase">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function FooterItem({ label, href }: FooterLink) {
  return (
    <li>
      <a
        href={href}
        className="text-[1.05rem] whitespace-nowrap transition-colors hover:text-white/65 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
      >
        {label}
      </a>
    </li>
  );
}

function SocialIcon({ name }: { name: "email" | "linkedin" | "youtube" }) {
  if (name === "email") {
    return (
      <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="none" aria-hidden>
        <rect x="3" y="5.5" width="18" height="13" stroke="currentColor" strokeWidth="1.7" />
        <path d="M3.5 6.5 12 13l8.5-6.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      </svg>
    );
  }

  if (name === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="currentColor" aria-hidden>
        <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9.5h4v11H3v-11ZM9.5 9.5h3.83v1.5h.05c.53-.95 1.84-1.95 3.78-1.95 4.04 0 4.79 2.52 4.79 5.8v5.65h-4v-5c0-1.2-.02-2.73-1.7-2.73-1.7 0-1.96 1.3-1.96 2.65v5.08h-4v-11Z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-[1.15rem] w-[1.15rem]" fill="currentColor" aria-hidden>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.2V8.8L15.5 12 10 15.2Z" />
    </svg>
  );
}
