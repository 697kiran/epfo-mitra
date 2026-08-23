import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EPFO Mitra — Claim Rejection Diagnostics & Remediation Assistant",
  description:
    "An independent, rules-engine powered prototype that translates cryptic EPFO claim rejection errors into plain-language diagnoses, generates remediation documents, and produces printable cyber cafe action slips.",
  keywords: [
    "EPFO",
    "EPF Claim Rejection",
    "Form 19",
    "Form 10C",
    "Form 31",
    "Joint Declaration",
    "TDS Form 15G",
    "EPFO Mitra",
  ],
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
