import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tranche AI",
  description:
    "Condition-gated capital release for venture-style deals — milestones verified by an AI review agent, attested on-chain via EAS, and challengeable before funds move.",
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
      <body className="min-h-full flex flex-col bg-neutral-950 text-neutral-100">
        <Providers>
          <header className="border-b border-neutral-800">
            <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
              <Link href="/" className="font-semibold tracking-tight text-lg">
                Tranche AI
              </Link>
              <nav className="flex items-center gap-6 text-sm text-neutral-400">
                <Link href="/investor" className="hover:text-neutral-100">
                  Investor
                </Link>
                <Link href="/recipient" className="hover:text-neutral-100">
                  Recipient
                </Link>
                <ConnectWalletButton />
              </nav>
            </div>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
            Tranche AI — condition-gated capital release. Not audited. Not financial advice.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
