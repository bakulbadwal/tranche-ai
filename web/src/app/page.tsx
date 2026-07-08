import { DealView } from "@/components/DealView";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">AI Tranche</h1>
        <p className="mt-3 text-neutral-400">
          Condition-gated capital release for venture-style deals. Milestones are reviewed by an
          AI agent and attested on-chain via{" "}
          <a href="https://attest.org" target="_blank" rel="noreferrer" className="underline hover:text-neutral-200">
            EAS
          </a>{" "}
          — but every attestation sits behind a dispute window before funds move. Anyone can
          inspect a deal below; only the investor, recipient, and arbitrator can act on it.
        </p>
      </div>

      <div className="mt-10">
        <DealView />
      </div>
    </div>
  );
}
