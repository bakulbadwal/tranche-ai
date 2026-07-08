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

export function TrancheCard({ tranche, investor, recipient, arbitrator, onChanged }: Props) {
  const { address } = useAccount();
  const { call, isPending, isConfirming, isConfirmed, error } = useTrancheAction();
  const [reason, setReason] = useState("");
  const [uid, setUid] = useState("");

  const isInvestor = sameAddr(address, investor);
  const isRecipient = sameAddr(address, recipient);
  const isArbitrator = sameAddr(address, arbitrator);

  const now = Math.floor(Date.now() / 1000);
  const disputeWindowOpen =
    tranche.status === 1 && now <= Number(tranche.attestedAt) + Number(tranche.disputeWindow);
  const disputeWindowClosed =
    tranche.status === 1 && now > Number(tranche.attestedAt) + Number(tranche.disputeWindow);
  const deadlinePassed = tranche.status === 0 && now > Number(tranche.deadline);

  if (isConfirmed && onChanged) onChanged();

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-neutral-500">Tranche {tranche.id}</div>
          <div className="text-2xl font-semibold mt-1">${formatAmount(tranche.amount)}</div>
        </div>
        <StatusBadge status={tranche.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-y-1.5 text-sm text-neutral-400">
        <dt>Deadline</dt>
        <dd className="text-neutral-200 text-right">
          {formatTimestamp(tranche.deadline)}
          {tranche.status === 0 && <span className="text-neutral-500"> ({relativeTime(tranche.deadline)})</span>}
        </dd>

        {tranche.status >= 1 && (
          <>
            <dt>Attested</dt>
            <dd className="text-neutral-200 text-right">{formatTimestamp(tranche.attestedAt)}</dd>
            <dt>Attestation UID</dt>
            <dd className="text-neutral-200 text-right font-mono text-xs truncate">
              {shortAddress(tranche.attestationUID)}
            </dd>
          </>
        )}

        {tranche.status === 1 && (
          <>
            <dt>Dispute window</dt>
            <dd className="text-neutral-200 text-right">
              {disputeWindowOpen
                ? `closes ${relativeTime(BigInt(Number(tranche.attestedAt) + Number(tranche.disputeWindow)))}`
                : "closed"}
            </dd>
          </>
        )}
      </dl>

      {/* Recipient: submit a milestone attestation UID (produced off-chain by the review agent) */}
      {isRecipient && tranche.status === 0 && !deadlinePassed && (
        <div className="mt-4 flex gap-2">
          <input
            value={uid}
            onChange={(e) => setUid(e.target.value)}
            placeholder="0x... attestation UID from review agent"
            className="flex-1 rounded-md bg-neutral-800 border border-neutral-700 px-3 py-1.5 text-sm font-mono"
          />
          <button
            disabled={!uid || isPending}
            onClick={() => call("submitAttestation", [BigInt(tranche.id), uid as `0x${string}`])}
            className="rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 px-3 py-1.5 text-sm font-medium"
          >
            Submit
          </button>
        </div>
      )}

      {/* Investor: dispute during the window */}
      {isInvestor && disputeWindowOpen && (
        <div className="mt-4 flex gap-2">
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for dispute"
            className="flex-1 rounded-md bg-neutral-800 border border-neutral-700 px-3 py-1.5 text-sm"
          />
          <button
            disabled={!reason || isPending}
            onClick={() => call("dispute", [BigInt(tranche.id), reason])}
            className="rounded-md bg-red-600 hover:bg-red-500 disabled:opacity-40 px-3 py-1.5 text-sm font-medium"
          >
            Dispute
          </button>
        </div>
      )}

      {/* Anyone: release once the window has closed unchallenged */}
      {disputeWindowClosed && (
        <button
          disabled={isPending}
          onClick={() => call("release", [BigInt(tranche.id)])}
          className="mt-4 w-full rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 px-3 py-1.5 text-sm font-medium"
        >
          Release tranche
        </button>
      )}

      {/* Investor: clawback an unattested tranche past deadline */}
      {isInvestor && deadlinePassed && (
        <button
          disabled={isPending}
          onClick={() => call("clawback", [BigInt(tranche.id)])}
          className="mt-4 w-full rounded-md bg-neutral-700 hover:bg-neutral-600 disabled:opacity-40 px-3 py-1.5 text-sm font-medium"
        >
          Claw back (deadline passed)
        </button>
      )}

      {/* Arbitrator: resolve an active dispute */}
      {isArbitrator && tranche.status === 2 && (
        <div className="mt-4 flex gap-2">
          <button
            disabled={isPending}
            onClick={() => call("resolveDispute", [BigInt(tranche.id), true])}
            className="flex-1 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 px-3 py-1.5 text-sm font-medium"
          >
            Approve release
          </button>
          <button
            disabled={isPending}
            onClick={() => call("resolveDispute", [BigInt(tranche.id), false])}
            className="flex-1 rounded-md bg-red-600 hover:bg-red-500 disabled:opacity-40 px-3 py-1.5 text-sm font-medium"
          >
            Reject (clawback)
          </button>
        </div>
      )}

      {(isPending || isConfirming) && (
        <p className="mt-3 text-xs text-neutral-500">
          {isPending ? "Confirm in wallet..." : "Waiting for confirmation..."}
        </p>
      )}
      {error && <p className="mt-3 text-xs text-red-400">{error.message.split("\n")[0]}</p>}
    </div>
  );
}
