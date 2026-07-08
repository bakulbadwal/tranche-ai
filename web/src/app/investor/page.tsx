import { DealView } from "@/components/DealView";

export default function InvestorPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Investor</h1>
      <p className="mt-2 text-neutral-400 max-w-2xl text-sm">
        Connect the investor wallet to dispute an attestation before its window closes, or claw
        back a tranche whose deadline passed with no milestone attested.
      </p>
      <div className="mt-8">
        <DealView />
      </div>
    </div>
  );
}
