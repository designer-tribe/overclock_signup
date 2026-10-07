import type { Metadata, Viewport } from "next";
import { Petrona, Inter } from "next/font/google";
import { SmoothScrollProvider } from "@/providers/SmoothScrollProvider";
import "./globals.css";

/**
 * Titles: the headline, the form card title, and every form control — in the
 * design the inputs are set in the serif too, which is what keeps the form
 * feeling like editorial copy rather than a web form.
 *
 * Italic is loaded because the headline's "Lead the change." needs a true
 * italic; without it the browser would synthesise one by slanting the roman,
 * which at display size is obvious and ugly.
 */
const petrona = Petrona({
  variable: "--font-petrona",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

/** Body: supporting copy, the eyebrow, buttons, fine print and error messages. */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lead the change — Overclock",
  description:
    "You've seen what's possible. Now let's map what it means for your people, your teams, and your strategy.",
  openGraph: {
    title: "Lead the change — Overclock",
    description:
      "You've seen what's possible. Now let's map what it means for your people, your teams, and your strategy.",
    type: "website",
  },
  // Still a work in progress — drop this once the page is ready to be public.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f8f6f1",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${petrona.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
