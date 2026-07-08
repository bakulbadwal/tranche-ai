/**
 * Deployment config. NEXT_PUBLIC_VAULT_ADDRESS is unset until a deal is deployed —
 * every page that reads/writes the contract should handle that "not deployed yet" state.
 */
export const VAULT_ADDRESS = (process.env.NEXT_PUBLIC_VAULT_ADDRESS ?? "") as `0x${string}`;
export const TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? "") as `0x${string}`;

export const TOKEN_DECIMALS = 6; // matches MockERC20 / real USDC

export const TRANCHE_STATUS_LABELS = [
  "Pending",
  "Attested",
  "Disputed",
  "Released",
  "Clawed back",
] as const;
