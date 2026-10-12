import Image from "next/image";
import tribeSignature from "@/assets/tribe-signature.png";
import { SUPPORT_LINKS, TRIBE_HREF, type FooterLink } from "./footerNav";

/**
 * The site footer, trimmed to what was asked to stay: the intro copy (no
 * longer a link to anywhere) and three links — Contact Us, Privacy Policy,
 * Terms and Conditions. Explore, Blog, the social icon row and "Still
 * exploring? View our Accelerators" are gone; `footerNav.ts` no longer has
 * data for any of them, so they cannot quietly reappear here.
 *
 * Two columns now rather than four — see the warning in `footerNav.ts` about
 * the Support links' paths.
 */
export function LandingFooter() {
  return (
    <footer className="bg-void text-white">
      <div className="mx-auto w-full max-w-[1500px] px-6 py-10 sm:px-10 lg:px-14">
        {/* The box is the footer's own frame, inset from the page edges, which
            is what keeps it from reading as the page simply turning black. */}
        <div className="border border-white/15">
          <div className="grid gap-x-10 gap-y-12 p-8 sm:grid-cols-2 sm:p-10 lg:p-12">
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
