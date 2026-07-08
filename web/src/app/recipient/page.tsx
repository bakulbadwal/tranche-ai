import { DealView } from "@/components/DealView";

export default function RecipientPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-14">
      <div className="animate-fade-up">
        <span className="text-xs font-medium uppercase tracking-wider text-cyan-300">Recipient</span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Your milestones</h1>
        <p className="mt-2 max-w-2xl text-sm text-neutral-400">
          Connect the recipient wallet to submit a milestone attestation UID once the off-chain
          review agent has evaluated your evidence and posted it to EAS.
        </p>
      </div>
      <div className="mt-10">
        <DealView />
      </div>
    </div>
  );
}
