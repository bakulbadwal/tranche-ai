import { DealView } from "@/components/DealView";

export default function InvestorPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="animate-fade-up">
        <span className="text-xs font-medium uppercase tracking-wider text-violet-300">Investor</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your position</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Connect the investor wallet to dispute an attestation before its window closes, or claw
          back a tranche whose deadline passed with no milestone attested.
        </p>
      </div>
      <div className="mt-10">
        <DealView />
      </div>
    </div>
  );
}
