"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import type { TrancheData } from "@/hooks/useDeal";
import { useTrancheAction } from "@/hooks/useTrancheAction";
import { StatusBadge } from "./StatusBadge";
import { formatAmount, formatTimestamp, relativeTime, shortAddress } from "@/lib/format";

interface Props {
  tranche: TrancheData;
  investor: `0x${string}`;
  recipient: `0x${string}`;
  arbitrator: `0x${string}`;
  onChanged?: () => void;
}

const sameAddr = (a?: string, b?: string) => !!a && !!b && a.toLowerCase() === b.toLowerCase();

// Top accent bar tint by status.
const ACCENT: Record<number, string> = {
  0: "from-neutral-500/40",
  1: "from-amber-400/70",
  2: "from-red-400/70",
  3: "from-emerald-400/70",
  4: "from-neutral-500/30",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-200">{children}</span>
    </div>
  );
}

export function TrancheCard({ tranche, investor, recipient, arbitrator, onChanged }: Props) {
  const { address } = useAccount();
  const { call, isPending, isConfirming, isConfirmed, error } = useTrancheAction();
  const [reason, setReason] = useState("");
  const [uid, setUid] = useState("");

  const isInvestor = sameAddr(address, investor);
  const isRecipient = sameAddr(address, recipient);
  const isArbitrator = sameAddr(address, arbitrator);

  const now = Math.floor(Date.now() / 1000);
  const windowEnd = Number(tranche.attestedAt) + Number(tranche.disputeWindow);
  const disputeWindowOpen = tranche.status === 1 && now <= windowEnd;
  const disputeWindowClosed = tranche.status === 1 && now > windowEnd;
  const deadlinePassed = tranche.status === 0 && now > Number(tranche.deadline);

  // Fraction of the dispute window elapsed, 0..1.
  const windowProgress =
    tranche.status === 1
      ? Math.min(1, Math.max(0, (now - Number(tranche.attestedAt)) / Number(tranche.disputeWindow)))
      : 0;

  if (isConfirmed && onChanged) onChanged();

  return (
    <div className="glass glass-hover relative overflow-hidden rounded-2xl p-5">
      {/* status accent bar */}
      <div
        className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent ${ACCENT[tranche.status] ?? ACCENT[0]}`}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Tranche {tranche.id}
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-sm text-neutral-500">$</span>
            <span className="text-3xl font-semibold tracking-tight text-neutral-100">
              {formatAmount(tranche.amount)}
            </span>
          </div>
        </div>
        <StatusBadge status={tranche.status} />
      </div>

      <div className="mt-4 divide-y divide-white/5">
        <Field label="Deadline">
          {formatTimestamp(tranche.deadline)}
          {tranche.status === 0 && (
            <span className="text-neutral-500"> · {relativeTime(tranche.deadline)}</span>
          )}
        </Field>

        {tranche.status >= 1 && (
          <>
            <Field label="Attested">{formatTimestamp(tranche.attestedAt)}</Field>
            <Field label="Attestation UID">
              <span className="font-mono text-xs">{shortAddress(tranche.attestationUID)}</span>
            </Field>
          </>
        )}
      </div>

      {/* Dispute window progress */}
      {tranche.status === 1 && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">Dispute window</span>
            <span className={disputeWindowOpen ? "text-amber-300" : "text-neutral-400"}>
              {disputeWindowOpen ? `closes ${relativeTime(BigInt(windowEnd))}` : "closed"}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-300 transition-all"
              style={{ width: `${Math.round(windowProgress * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* ---- Actions ---- */}

      {isRecipient && tranche.status === 0 && !deadlinePassed && (
        <div className="mt-4 flex gap-2">
          <input
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="0x… attestation UID"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs text-neutral-200 outline-none transition-colors focus:border-violet-500/50"
          />
          <button
            disabled={!uid || isPending}
            onClick={() => call("submitAttestation", [BigInt(tranche.id), uid as `0x${string}`])}
            className="rounded-lg bg-violet-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-40"
          >
            Submit
          </button>
        </div>
      )}

      {isInvestor && disputeWindowOpen && (
        <div className="mt-4 flex gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for dispute"
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-200 outline-none transition-colors focus:border-red-500/50"
          />
          <button
            disabled={!reason || isPending}
            onClick={() => call("dispute", [BigInt(tranche.id), reason])}
            className="rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-40"
          >
            Dispute
          </button>
        </div>
      )}

      {disputeWindowClosed && (
        <button
          disabled={isPending}
          onClick={() => call("release", [BigInt(tranche.id)])}
          className="mt-4 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
        >
          Release tranche
        </button>
      )}

      {isInvestor && deadlinePassed && (
        <button
          disabled={isPending}
          onClick={() => call("clawback", [BigInt(tranche.id)])}
          className="mt-4 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/10 disabled:opacity-40"
        >
          Claw back · deadline passed
        </button>
      )}

      {isArbitrator && tranche.status === 2 && (
        <div className="mt-4 flex gap-2">
          <button
            disabled={isPending}
            onClick={() => call("resolveDispute", [BigInt(tranche.id), true])}
            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-40"
          >
            Approve release
          </button>
          <button
            disabled={isPending}
            onClick={() => call("resolveDispute", [BigInt(tranche.id), false])}
            className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:opacity-40"
          >
            Reject · clawback
          </button>
        </div>
      )}

      {(isPending || isConfirming) && (
        <p className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse-ring" />
          {isPending ? "Confirm in wallet…" : "Waiting for confirmation…"}
        </p>
      )}
      {error && <p className="mt-3 text-xs text-red-400">{error.message.split("\n")[0]}</p>}
    </div>
  );
}
