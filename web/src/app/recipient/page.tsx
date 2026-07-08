import { DealView } from "@/components/DealView";

export default function RecipientPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Recipient</h1>
      <p className="mt-2 text-neutral-400 max-w-2xl text-sm">
        Connect the recipient wallet to submit a milestone attestation UID once the off-chain
        review agent has evaluated your evidence and posted it to EAS.
      </p>
      <div className="mt-8">
        <DealView />
      </div>
    </div>
  );
}
