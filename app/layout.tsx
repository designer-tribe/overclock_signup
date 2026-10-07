import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SmoothScrollProvider } from "@/providers/SmoothScrollProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jadwalkan Sesi — Overclock",
  description:
    "Khusus peserta webinar Overclock: jadwalkan sesi 1-on-1 dengan tim kami.",
  // Placeholder copy; replace along with the final design and OG image.
  openGraph: {
    title: "Jadwalkan Sesi — Overclock",
    description:
      "Khusus peserta webinar Overclock: jadwalkan sesi 1-on-1 dengan tim kami.",
    type: "website",
  },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  // Matches the page background, so mobile browser chrome blends in instead of
  // framing the hero with a white bar.
  themeColor: "#0a0a12",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
