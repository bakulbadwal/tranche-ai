import { TRANCHE_STATUS_LABELS } from "@/lib/contract";

// [background/border tint, text color, dot color]
const STYLES: Record<number, { wrap: string; dot: string }> = {
  0: { wrap: "border-neutral-600/40 bg-neutral-500/10 text-neutral-300", dot: "text-neutral-400" }, // Pending
  1: { wrap: "border-amber-500/30 bg-amber-500/10 text-amber-300", dot: "text-amber-400" }, // Attested
  2: { wrap: "border-red-500/30 bg-red-500/10 text-red-300", dot: "text-red-400" }, // Disputed
  3: { wrap: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300", dot: "text-emerald-400" }, // Released
  4: { wrap: "border-neutral-600/40 bg-neutral-700/20 text-neutral-400", dot: "text-neutral-500" }, // Clawed back
};

export function StatusBadge({ status }: { status: number }) {
  const s = STYLES[status] ?? STYLES[0];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${s.wrap}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full bg-current glow-dot ${s.dot}`} />
      {TRANCHE_STATUS_LABELS[status] ?? "Unknown"}
    </span>
  );
}
