import { TRANCHE_STATUS_LABELS } from "@/lib/contract";

const COLORS: Record<number, string> = {
  0: "bg-neutral-800 text-neutral-300", // Pending
  1: "bg-amber-500/15 text-amber-400", // Attested (dispute window open)
  2: "bg-red-500/15 text-red-400", // Disputed
  3: "bg-emerald-500/15 text-emerald-400", // Released
  4: "bg-neutral-700/60 text-neutral-400", // Clawed back
};

export function StatusBadge({ status }: { status: number }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[status] ?? COLORS[0]}`}
    >
      {TRANCHE_STATUS_LABELS[status] ?? "Unknown"}
    </span>
  );
}
