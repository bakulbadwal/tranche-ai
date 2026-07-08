import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { Logo } from "@/components/Logo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tranche AI — condition-gated capital release",
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
      <body className="min-h-full flex flex-col">
        {/* Floating accent orbs, purely decorative. */}
        <div
          aria-hidden
          className="pointer-events-none fixed -z-10 -left-40 top-20 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl animate-float-slow"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed -z-10 -right-40 top-1/3 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl animate-float-slow"
          style={{ animationDelay: "-7s" }}
        />

        <Providers>
          <header className="sticky top-0 z-50 border-b border-white/5 bg-[#05060a]/70 backdrop-blur-xl">
            <div className="mx-auto max-w-5xl px-6 py-3.5 flex items-center justify-between">
              <Link href="/" className="group flex items-center gap-2.5">
                <Logo className="h-7 w-7 transition-transform group-hover:scale-110" />
                <span className="font-semibold tracking-tight text-[15px]">
                  Tranche<span className="text-violet-400"> AI</span>
                </span>
              </Link>
              <nav className="flex items-center gap-1 text-sm">
                <Link
                  href="/investor"
                  className="rounded-lg px-3 py-1.5 text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100"
                >
                  Investor
                </Link>
                <Link
                  href="/recipient"
                  className="rounded-lg px-3 py-1.5 text-neutral-400 transition-colors hover:bg-white/5 hover:text-neutral-100"
                >
                  Recipient
                </Link>
                <div className="ml-2">
                  <ConnectWalletButton />
                </div>
              </nav>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-white/5 mt-16">
            <div className="mx-auto max-w-5xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
              <div className="flex items-center gap-2">
                <Logo className="h-4 w-4" />
                <span>Tranche AI — condition-gated capital release.</span>
              </div>
              <div className="flex items-center gap-5">
                <a
                  href="https://github.com/bakulbadwal/tranche-ai"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neutral-300 transition-colors"
                >
                  GitHub
                </a>
                <a
                  href="https://sepolia.basescan.org/address/0x5c0a3EaC01B98478B9838bC3c93dCcFc81C92f7A"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-neutral-300 transition-colors"
                >
                  Contract
                </a>
                <span className="text-neutral-600">Testnet demo · not audited</span>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
