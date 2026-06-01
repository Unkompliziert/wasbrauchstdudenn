import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Source_Serif_4 } from "next/font/google";
import "./globals.css";

// One family, serif, one weight (Regular 400). Self-hosted by Next at build time
// (no runtime font CDN — first paint is the relief). System fallback stack from
// the EP0 spec covers the moment before the webfont swaps in.
const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  fallback: ["Iowan Old Style", "Palatino", "Georgia", "ui-serif", "serif"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Was brauchst du denn?",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="de" className={serif.className}>
      <body>{children}</body>
    </html>
  );
}
