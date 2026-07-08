"use client";

import { useDealMeta, useTranches, useIsVaultConfigured } from "@/hooks/useDeal";
import { DealHeader } from "./DealHeader";
import { TrancheCard } from "./TrancheCard";

function SkeletonCard() {
  return (
    <div className="glass h-44 rounded-2xl p-5">
      <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
      <div className="mt-3 h-8 w-28 animate-pulse rounded bg-white/5" />
      <div className="mt-6 space-y-2">
        <div className="h-3 w-full animate-pulse rounded bg-white/5" />
        <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
      </div>
    </div>
  );
}

export function DealView() {
  const configured = useIsVaultConfigured();
  const { deal, isLoading: dealLoading, error: dealError } = useDealMeta();
  const { tranches, isLoading: tranchesLoading, refetch } = useTranches(deal?.trancheCount ?? 0);

  if (!configured) {
    return (
      <div className="glass rounded-2xl border-dashed p-8 text-center text-neutral-400">
        <p className="font-medium text-neutral-200">No deal deployed yet</p>
        <p className="mt-2 text-sm">
          Set <code className="text-violet-300">NEXT_PUBLIC_VAULT_ADDRESS</code> in{" "}
          <code className="text-violet-300">web/.env.local</code> once a{" "}
          <code className="text-violet-300">TrancheVault</code> is deployed.
        </p>
      </div>
    );
  }

  if (dealLoading || tranchesLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (dealError || !deal) {
    return (
      <div className="glass rounded-2xl border-red-500/20 p-6 text-sm text-red-300">
        Couldn&apos;t read the deal — check the vault address and that your wallet is on the right
        network (Base Sepolia).
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <DealHeader
        investor={deal.investor}
        recipient={deal.recipient}
        agent={deal.agent}
        arbitrator={deal.arbitrator}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {tranches.map((t) => (
          <TrancheCard
            key={t.id}
            tranche={t}
            investor={deal.investor}
            recipient={deal.recipient}
            arbitrator={deal.arbitrator}
            onChanged={refetch}
          />
        ))}
      </div>
    </div>
  );
}
