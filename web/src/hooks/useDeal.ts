"use client";

import { useReadContract, useReadContracts } from "wagmi";
import { trancheVaultAbi } from "@/lib/trancheVaultAbi";
import { VAULT_ADDRESS } from "@/lib/contract";

export interface TrancheData {
  id: number;
  amount: bigint;
  deadline: bigint;
  disputeWindow: bigint;
  schemaUID: `0x${string}`;
  attestationUID: `0x${string}`;
  attestedAt: bigint;
  status: number;
}

const enabled = VAULT_ADDRESS.length === 42;

/** Reads deal-level metadata (investor, recipient, agent, arbitrator, token, tranche count). */
export function useDealMeta() {
  const base = { address: VAULT_ADDRESS, abi: trancheVaultAbi } as const;
  const { data, isLoading, error } = useReadContracts({
    allowFailure: false,
    contracts: [
      { ...base, functionName: "investor" },
      { ...base, functionName: "recipient" },
      { ...base, functionName: "agent" },
      { ...base, functionName: "arbitrator" },
      { ...base, functionName: "token" },
      { ...base, functionName: "trancheCount" },
    ],
    query: { enabled },
  });

  if (!data) return { isLoading, error, deal: null as const };

  const [investor, recipient, agent, arbitrator, token, trancheCount] = data as [
    `0x${string}`,
    `0x${string}`,
    `0x${string}`,
    `0x${string}`,
    `0x${string}`,
    bigint,
  ];

  return {
    isLoading,
    error,
    deal: { investor, recipient, agent, arbitrator, token, trancheCount: Number(trancheCount) },
  };
}

/** Reads every tranche's full struct for the configured deal. */
export function useTranches(count: number) {
  const { data, isLoading, error, refetch } = useReadContracts({
    allowFailure: false,
    contracts: Array.from({ length: count }, (_, id) => ({
      address: VAULT_ADDRESS,
      abi: trancheVaultAbi,
      functionName: "tranches" as const,
      args: [BigInt(id)] as const,
    })),
    query: { enabled: enabled && count > 0 },
  });

  const tranches: TrancheData[] = (data ?? []).map((t, id) => {
    const [amount, deadline, disputeWindow, schemaUID, attestationUID, attestedAt, status] =
      t as [bigint, bigint, bigint, `0x${string}`, `0x${string}`, bigint, number];
    return { id, amount, deadline, disputeWindow, schemaUID, attestationUID, attestedAt, status };
  });

  return { tranches, isLoading, error, refetch };
}

export function useIsVaultConfigured() {
  return enabled;
}
