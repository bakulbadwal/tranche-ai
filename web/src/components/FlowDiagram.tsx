const STEPS = [
  {
    n: "01",
    title: "Fund",
    who: "Investor",
    body: "Capital is deposited into the vault, split into milestone tranches.",
    accent: "text-violet-300",
  },
  {
    n: "02",
    title: "Review",
    who: "AI agent",
    body: "Claude evaluates the submitted evidence against explicit acceptance criteria.",
    accent: "text-cyan-300",
  },
  {
    n: "03",
    title: "Attest",
    who: "On-chain · EAS",
    body: "A signed attestation is posted, starting a dispute window — not an instant payout.",
    accent: "text-violet-300",
  },
  {
    n: "04",
    title: "Settle",
    who: "Investor / arbitrator",
    body: "Unchallenged → release. Disputed → an arbitrator resolves. Missed → clawback.",
    accent: "text-cyan-300",
  },
];

export function FlowDiagram() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STEPS.map((s, i) => (
        <div
          key={s.n}
          className="glass glass-hover rounded-2xl p-5 animate-fade-up"
          style={{ animationDelay: `${i * 90}ms` }}
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-neutral-500">{s.n}</span>
            <span className={`text-[11px] font-medium uppercase tracking-wide ${s.accent}`}>
              {s.who}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-neutral-100">{s.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-neutral-400">{s.body}</p>
        </div>
      ))}
    </div>
  );
}
