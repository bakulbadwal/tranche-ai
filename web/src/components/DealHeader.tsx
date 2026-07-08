import { shortAddress } from "@/lib/format";

interface Props {
  investor: string;
  recipient: string;
  agent: string;
  arbitrator: string;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-neutral-800/60 last:border-0">
      <span className="text-neutral-500">{label}</span>
      <span className="font-mono text-neutral-200">{shortAddress(value)}</span>
    </div>
  );
}

export function DealHeader({ investor, recipient, agent, arbitrator }: Props) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5 text-sm">
      <Row label="Investor" value={investor} />
      <Row label="Recipient" value={recipient} />
      <Row label="Review agent" value={agent} />
      <Row label="Arbitrator" value={arbitrator} />
    </div>
  );
}
