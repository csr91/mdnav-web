import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Share_Tech } from "next/font/google";

const titleFont = Share_Tech({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-title",
  display: "swap",
});

export const metadata: Metadata = {
  title: "mdnav-web",
  description: "Temporary Mermaid renderer for mdnav links"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={titleFont.variable}>
      <body>{children}</body>
    </html>
  );
}
