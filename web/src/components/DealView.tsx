"use client";

import { useDealMeta, useTranches, useIsVaultConfigured } from "@/hooks/useDeal";
import { DealHeader } from "./DealHeader";
import { TrancheCard } from "./TrancheCard";

export function DealView() {
  const configured = useIsVaultConfigured();
  const { deal, isLoading: dealLoading, error: dealError } = useDealMeta();
  const { tranches, isLoading: tranchesLoading, refetch } = useTranches(deal?.trancheCount ?? 0);

  if (!configured) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-700 p-8 text-center text-neutral-400">
        <p className="font-medium text-neutral-200">No deal deployed yet</p>
        <p className="mt-2 text-sm">
          Set <code className="text-neutral-300">NEXT_PUBLIC_VAULT_ADDRESS</code> in{" "}
          <code className="text-neutral-300">web/.env.local</code> once a{" "}
          <code className="text-neutral-300">TrancheVault</code> is deployed.
        </p>
      </div>
    );
  }

  if (dealLoading || tranchesLoading) {
    return <p className="text-neutral-500 text-sm">Loading deal...</p>;
  }

  if (dealError || !deal) {
    return (
      <p className="text-red-400 text-sm">
        Couldn&apos;t read the deal — check the vault address and that your wallet is on the right network.
      </p>
    );
  }

  return (
    <div className="space-y-6">
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
