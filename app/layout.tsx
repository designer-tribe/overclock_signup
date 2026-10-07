import type { Metadata, Viewport } from "next";
import { Lora, DM_Sans } from "next/font/google";
import { SmoothScrollProvider } from "@/providers/SmoothScrollProvider";
import "./globals.css";

/**
 * Serif carries the headline, the form card title, and every field — in the
 * design the inputs are set in serif too, which is what keeps the form feeling
 * like editorial copy rather than a web form.
 */
const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

/** Sans is for supporting copy, the eyebrow, buttons and fine print. */
const dmSans = DM_Sans({
  variable: "--font-dm-sans",
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
      className={`${lora.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
