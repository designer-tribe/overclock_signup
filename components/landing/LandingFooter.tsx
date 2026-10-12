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
 *
 * `maxWidth`: the footer is shared by both layouts, and they don't agree on
 * how wide their own content column is (V1's container is 1500px, V2's is
 * 1440px) — on a wide screen a mismatched footer reads as off-centre under
 * the page above it. Each page passes its own container width in; default is
 * V1's, since that was the first layout this shipped on.
 */
export function LandingFooter({
  maxWidth = "max-w-[1500px]",
}: {
  maxWidth?: string;
}) {
  return (
    <footer className="bg-void text-white">
      {/*
        No horizontal padding here: this box's left and right edges have to
        land exactly on the content grid's own edges above it (the outer
        container edge and, on V1, the mirrored rule at the far right) — a
        padded wrapper pulled the box in from both, so it no longer lined up
        with either. `py-10` is still fine; the mismatch was horizontal.
      */}
      <div className={`mx-auto w-full ${maxWidth} py-10`}>
        {/* The box is the footer's own frame, inset only from the browser's
            own edges (via the container's max-width + its own centring),
            not from the content above it. */}
        <div className="border border-white/15">
          {/*
            Two things, not three: the intro on one side, Support and Stay
            connected grouped together on the other. `justify-between` pushes
            that pair as far from the intro as the row allows — the gap there
            is whatever's left, not a fixed number — while the 42px inside the
            pair is fixed, so the two groups always sit that close regardless
            of how much room the row has.
          */}
          <div className="flex flex-col gap-y-12 p-8 sm:flex-row sm:items-start sm:justify-between sm:p-10 lg:p-12">
            <div>
              {/*
                The original footer's line pushes cohort enrollment — it had
                "Still exploring? View our Accelerators" right under it, which
                is gone. This page isn't an enrollment page at all; its one
                ask is the form above ("Request a conversation"). Rewritten to
                back that up instead of pointing somewhere this page doesn't
                go. PLACEHOLDER COPY — written to fit, not supplied; swap for
                the real line when there is one.
              */}
              <h2 className="font-serif text-[1.6rem] leading-tight">
                Have Questions Before You Decide?
              </h2>
              <p className="mt-3 max-w-xs text-[0.95rem] leading-relaxed text-white/80">
                Reach out to our team any time — we&rsquo;re happy to help.
              </p>
            </div>

            <div className="flex flex-col gap-y-12 sm:flex-row sm:gap-x-[42px]">
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
