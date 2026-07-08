export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="tranche-logo-grad" x1="0" y1="0" x2="32" y2="32">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="55%" stopColor="#7c6cff" />
          <stop offset="100%" stopColor="#38e8d8" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" stroke="url(#tranche-logo-grad)" strokeWidth="1.5" opacity="0.5" />
      {/* Three stacked tranches, ascending — the core visual metaphor. */}
      <rect x="8" y="19" width="16" height="4" rx="2" fill="url(#tranche-logo-grad)" />
      <rect x="8" y="13" width="16" height="4" rx="2" fill="url(#tranche-logo-grad)" opacity="0.7" />
      <rect x="8" y="7" width="16" height="4" rx="2" fill="url(#tranche-logo-grad)" opacity="0.4" />
    </svg>
  );
}
