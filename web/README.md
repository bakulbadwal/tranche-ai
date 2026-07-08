# AI Tranche — frontend

Next.js + [wagmi](https://wagmi.sh)/[viem](https://viem.sh) + [RainbowKit](https://rainbowkit.com)
dashboard for a deployed `TrancheVault` deal. Three views:

- `/` — public, read-only deal explorer (anyone can inspect a deal's tranches and attestations)
- `/investor` — dispute an attestation within its window, or claw back a missed-deadline tranche
- `/recipient` — submit a milestone attestation UID once the review agent has posted one to EAS

Wallet-gated actions (dispute, submit, resolve) only appear once the connected address matches
the deal's investor/recipient/arbitrator — the pages themselves don't enforce roles, the contract
does (the UI just reflects what would succeed).

## Local development

Point the app at a deployed `TrancheVault` via `.env.local` (copy `.env.example`):

```
NEXT_PUBLIC_VAULT_ADDRESS=0x...
NEXT_PUBLIC_TOKEN_ADDRESS=0x...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=   # get a free one at cloud.reown.com for production
```

To spin up a full local deal to develop against:

```bash
# from the repo root
anvil                                                            # terminal 1
forge script script/DemoSeed.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --via-ir   # terminal 2
bash script/seed-demo.sh <EAS_ADDR> <VAULT_ADDR> <SCHEMA_UID> <RECIPIENT_ADDR>             # attests tranche 0
```

Then, from `web/`:

```bash
npm install
npm run dev
```

The app is wired to recognize Anvil's local chain (id `31337`) alongside Base Sepolia.
