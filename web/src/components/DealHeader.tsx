import { shortAddress } from "@/lib/format";

interface Props {
  investor: string;
  recipient: string;
  agent: string;
  arbitrator: string;
}

const ROLES = [
  { key: "investor", label: "Investor", hint: "Funds the deal", accent: "text-violet-300", ring: "ring-violet-500/30" },
  { key: "recipient", label: "Recipient", hint: "Hits milestones", accent: "text-cyan-300", ring: "ring-cyan-500/30" },
  { key: "agent", label: "Review agent", hint: "Attests evidence", accent: "text-violet-300", ring: "ring-violet-500/30" },
  { key: "arbitrator", label: "Arbitrator", hint: "Resolves disputes", accent: "text-cyan-300", ring: "ring-cyan-500/30" },
] as const;

function RoleIcon({ role, className }: { role: string; className?: string }) {
  // Simple distinct glyph per role.
  const paths: Record<string, React.ReactNode> = {
    investor: <path d="M12 3v18M7 8h7a3 3 0 0 1 0 6H8" />,
    recipient: <path d="M20 6 9 17l-5-5" />,
    agent: (
      <>
        <rect x="4" y="8" width="16" height="12" rx="2" />
        <path d="M12 8V4M9 14h.01M15 14h.01" />
      </>
    ),
    arbitrator: <path d="M12 3v18M5 7l14 0M7 7l-3 6h6l-3-6M17 7l-3 6h6l-3-6" />,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {paths[role]}
    </svg>
  );
}

export function DealHeader({ investor, recipient, agent, arbitrator }: Props) {
  const values: Record<string, string> = { investor, recipient, agent, arbitrator };
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {ROLES.map((r) => (
        <div key={r.key} className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 ring-1 ${r.ring} ${r.accent}`}>
              <RoleIcon role={r.key} className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-medium text-neutral-200">{r.label}</div>
              <div className="text-[11px] text-neutral-500">{r.hint}</div>
            </div>
          </div>
          <div className="mt-3 font-mono text-xs text-neutral-400">{shortAddress(values[r.key])}</div>
        </div>
      ))}
    </div>
  );
}
