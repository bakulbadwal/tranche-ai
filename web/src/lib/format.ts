import { formatUnits } from "viem";
import { TOKEN_DECIMALS } from "./contract";

export function formatAmount(amount: bigint): string {
  return Number(formatUnits(amount, TOKEN_DECIMALS)).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });
}

export function formatTimestamp(ts: bigint): string {
  if (ts === 0n) return "—";
  return new Date(Number(ts) * 1000).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Human "in 2d 4h" / "3h ago" style, relative to now. */
export function relativeTime(ts: bigint): string {
  if (ts === 0n) return "—";
  const deltaSec = Number(ts) - Math.floor(Date.now() / 1000);
  const future = deltaSec >= 0;
  const abs = Math.abs(deltaSec);
  const days = Math.floor(abs / 86400);
  const hours = Math.floor((abs % 86400) / 3600);
  const minutes = Math.floor((abs % 3600) / 60);

  let label: string;
  if (days > 0) label = `${days}d ${hours}h`;
  else if (hours > 0) label = `${hours}h ${minutes}m`;
  else label = `${minutes}m`;

  return future ? `in ${label}` : `${label} ago`;
}

export function shortAddress(addr?: string): string {
  if (!addr) return "—";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}
