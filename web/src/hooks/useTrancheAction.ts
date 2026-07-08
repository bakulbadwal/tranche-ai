"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { trancheVaultAbi } from "@/lib/trancheVaultAbi";
import { VAULT_ADDRESS } from "@/lib/contract";

/** Thin wrapper around wagmi's write + receipt-wait, scoped to the TrancheVault contract. */
export function useTrancheAction() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  function call(functionName: "dispute" | "release" | "clawback" | "resolveDispute" | "submitAttestation", args: readonly unknown[]) {
    writeContract({
      address: VAULT_ADDRESS,
      abi: trancheVaultAbi,
      functionName,
      args: args as never,
    });
  }

  return { call, hash, isPending, isConfirming, isConfirmed, error };
}
