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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "mdnav — keyboard-driven file explorer for the terminal",
  description: "A keyboard-driven file explorer for the terminal. Browse any directory, preview files, manage your repo and share Mermaid diagrams — all without touching the mouse.",
  openGraph: {
    title: "mdnav — keyboard-driven file explorer for the terminal",
    description: "A keyboard-driven file explorer for the terminal. Browse any directory, preview files, manage your repo and share Mermaid diagrams — all without touching the mouse.",
    type: "website",
    siteName: "mdnav",
  },
  twitter: {
    card: "summary_large_image",
    title: "mdnav — keyboard-driven file explorer for the terminal",
    description: "A keyboard-driven file explorer for the terminal. Browse any directory, preview files, manage your repo and share Mermaid diagrams — all without touching the mouse.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={titleFont.variable}>
      <body>{children}</body>
    </html>
  );
}
