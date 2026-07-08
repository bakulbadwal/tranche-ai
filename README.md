# Tranche AI

**Live demo:** [tranche-ai.vercel.app](https://tranche-ai.vercel.app) · **Contract (Base Sepolia):** [`0x5c0a...92f7A`](https://sepolia.basescan.org/address/0x5c0a3EaC01B98478B9838bC3c93dCcFc81C92f7A)

Condition-gated capital release for venture-style deals. An investor funds a recipient in
tranches; each tranche unlocks only after a milestone attestation — reviewed by an AI agent,
posted on-chain via [EAS](https://attest.org), and left open to a dispute window — has stood
unchallenged.

This is **not** a token-vesting/streaming project. [Sablier](https://sablier.com) and
[Superfluid](https://superfluid.finance) already solved "unlock tokens linearly over time" —
that's commoditized. Tranche AI solves a different problem: releasing capital on a **condition**,
where the condition is real-world evidence that something happened, and where the entity judging
that evidence is an AI agent whose verdict is *checkable*, not final.

## Why this exists

Every VC deal with milestone-based terms — SAFEs with conditions, earn-outs, staged grants,
tranche-based checks — has the same weak point: a human has to manually verify the milestone was
actually hit, and that verification is slow, expensive, and exactly where fraud tends to live.
Fabricated revenue numbers, doctored audits, cap tables that don't match reality — these aren't
hypothetical, they're routine diligence findings. This project moves that verification step
on-chain: an AI agent reviews the submitted evidence against explicit, falsifiable criteria and
posts a signed attestation, but the attestation isn't the final word — it sits behind a dispute
window before any capital actually moves.

### The bigger whitespace this sits inside

As of mid-2026, the two most-cited venture theses at the AI × crypto intersection are:

- **a16z crypto's "KYA" (Know Your Agent)** — the claim that the agent economy's bottleneck has
  shifted from intelligence to identity: agents need a way to prove who they represent, what
  they're allowed to do, and how they get paid, and no interoperable standard has won yet.
- **The "verification layer is missing"** thesis (Forbes, Feb 2026) — if an agent claims it made
  a decision using specific evidence, there's currently no way for a counterparty to verify that
  claim instead of just trusting the operator. No infrastructure yet lets you cheaply prove a
  claimed computation or judgment was made honestly.

Tranche AI is a narrow, concrete instance of exactly that second gap: **a verification layer that
gates money movement on a challengeable proof of an AI agent's claim about off-chain reality** —
applied to a domain (venture milestone financing) I actually have the diligence background to
judge correctness in, rather than a generic "AI oracle" demo.

## How it works

```
investor ──funds──▶ TrancheVault ◀──evidence── recipient
                         │
                         │ agent reviews evidence, posts EAS attestation
                         ▼
                  submitAttestation()
                         │
                    dispute window (e.g. 72h)
                    ╱              ╲
        no dispute ╱                ╲ investor disputes
                   ▼                  ▼
              release()         arbitrator resolves
           funds → recipient    release or clawback
```

1. **Investor** deposits capital into a `TrancheVault`, split into tranches. Each tranche has an
   amount, a hard deadline, a dispute window, and a required [EAS](https://attest.org) schema.
2. **Recipient** (the startup) submits evidence for a milestone — a shipped repo, audited
   financials, a metrics export, whatever the deal calls for.
3. **Review agent** (Claude, via `agent/`) evaluates the evidence against explicit, falsifiable
   acceptance criteria and — if satisfied — posts a signed EAS attestation.
4. **`submitAttestation`** on the vault checks the attestation is from the authorized agent
   address, matches the tranche's schema, and hasn't been revoked — then starts the dispute clock.
5. If the **investor doesn't dispute** within the window, anyone can call `release` and the
   tranche pays out. If they **do dispute**, a designated **arbitrator** resolves it — release or
   clawback.
6. If a tranche's **deadline passes** with no attestation at all, the investor can claw it back
   unilaterally — no milestone, no funds held hostage indefinitely.

## Repo structure

```
src/TrancheVault.sol             — core contract: funding, attestation checks, dispute, release, clawback
src/mocks/MockERC20.sol          — test-only stablecoin stand-in
test/TrancheVault.t.sol          — Foundry test suite, deployed against real EAS + SchemaRegistry (no mocked oracle)
script/DeployTrancheVault.s.sol  — env-var-driven deploy script (any chain)
script/DeployBaseSepolia.s.sol   — the actual script used for the live Base Sepolia deploy
script/DemoSeed.s.sol            — local Anvil demo-deal deployer
script/seed-demo.sh              — posts the demo attestation (see note in that file on why)
agent/                           — off-chain TypeScript review agent (Claude review → EAS attestation)
web/                             — frontend — live at tranche-ai.vercel.app
```

## Status

### Phase 0 — Contract core (done)
- [x] `TrancheVault.sol`: fund → attest → dispute-or-release → clawback, full access control
- [x] Integration tests against real EAS + SchemaRegistry deployments (11/11 passing)
- [x] Env-var-driven deploy script

### Phase 1 — Agent wiring (next)
- [ ] Evidence fetchers: GitHub API (commit/PR activity), doc pinning to IPFS/Arweave
- [ ] `postAttestation()` — sign and submit via `@ethereum-attestation-service/eas-sdk`
- [ ] `submitToVault()` — plain ethers/viem call to `submitAttestation`
- [x] Milestone EAS schema registered on testnet (see below)

### Phase 2 — Testnet deployment (done)
- [x] Deploy `TrancheVault` + a mock USDC to **Base Sepolia**, against the real, live
      OP-Stack EAS predeploys (not a locally-deployed EAS instance)
- [x] Register a real EAS schema, run one full demo deal end-to-end from a script

**Live on Base Sepolia:**
| Contract | Address |
|---|---|
| `TrancheVault` | [`0x5c0a3EaC01B98478B9838bC3c93dCcFc81C92f7A`](https://sepolia.basescan.org/address/0x5c0a3EaC01B98478B9838bC3c93dCcFc81C92f7A) |
| `MockERC20` (demo stablecoin) | [`0x5300F6bC8E1A72b3F59d02020530DE868906d495`](https://sepolia.basescan.org/address/0x5300F6bC8E1A72b3F59d02020530DE868906d495) |
| EAS (real predeploy) | `0x4200000000000000000000000000000000000021` |
| SchemaRegistry (real predeploy) | `0x4200000000000000000000000000000000000020` |

This testnet deal uses one funded deployer address for all four roles
(investor/recipient/agent/arbitrator) to avoid needing to fund multiple wallets — the
multi-party flow is already fully exercised by the local Anvil test suite and demo seed
(`script/DemoSeed.s.sol` + `script/seed-demo.sh`).

### Phase 3 — Frontend (done)
- [x] Investor view: see tranche status, dispute, claw back a missed-deadline tranche
- [x] Recipient view: submit a milestone attestation UID, track attestation/dispute status
- [x] Public view: read-only deal explorer (anyone can inspect a deal's attestation trail)
- [x] Wired to real on-chain data, verified live in-browser before deploying
- [x] **Deployed to Vercel**, auto-deploying on every push to `main`: [tranche-ai.vercel.app](https://tranche-ai.vercel.app)
- [ ] "Create a deal" flow (currently one deal per deployed vault, configured via env var)

### Phase 4 — Polish / demo readiness
- [ ] Get a real WalletConnect Cloud project ID (currently a dev placeholder — injected wallets
      like MetaMask work fine, only the WalletConnect QR option is affected)
- [ ] Wire the agent end-to-end (see Phase 1)
- [ ] Seed a second, richer demo deal (2-3 tranches, more realistic evidence) for a walkthrough
- [ ] One-page deck: problem, whitespace framing (KYA / verification layer), how it works, demo link

### Deliberately out of scope for v1
- Multi-deal factory pattern (v1 is one vault per deal — clean and legible; factory is a v2 concern)
- A real arbitration process beyond "a designated address decides" (a small reviewer panel is v2)
- Any token/points/incentive layer — this is infrastructure, not a token launch

## Stack

- **Contracts:** Solidity + [Foundry](https://book.getfoundry.sh) (forge/cast/anvil), built on
  [EAS](https://attest.org) rather than a custom oracle
- **Frontend:** Next.js (App Router) + TypeScript + [wagmi](https://wagmi.sh)/[viem](https://viem.sh) +
  [RainbowKit](https://rainbowkit.com), hosted on Vercel
- **Chain:** Base Sepolia — EAS has first-class support there, it's where the x402 agent-payment
  ecosystem actually lives (Coinbase-backed, highest real agent transaction volume of any chain
  right now), and it's cheap/fast for a demo
- **Agent:** TypeScript + the Anthropic SDK (Claude), posting attestations via the EAS SDK

## What else to plan for

- **A private key for the agent's signing address**, separate from your personal wallet — this is
  the address whose attestations the contract trusts, so treat it like a service credential, not
  a wallet you also hold funds in.
- **The pitch framing**: lead with the KYA/verification-layer whitespace, not "VC tool" — that's
  what makes it read as infrastructure-aware rather than a niche fintech utility.

## Local development

```bash
forge install          # pulls forge-std, eas-contracts, openzeppelin-contracts
forge build
forge test -vv
```

To stand up a full local demo deal against Anvil, or run the frontend locally, see
[`web/README.md`](web/README.md).

## Deploying

```bash
export TOKEN_ADDRESS=...
export EAS_ADDRESS=...            # per-chain EAS deployment — see docs.attest.org/docs/quick--start
export INVESTOR_ADDRESS=...
export RECIPIENT_ADDRESS=...
export AGENT_ADDRESS=...          # the review agent's signing address
export MILESTONE_SCHEMA_UID=...   # register your schema with SchemaRegistry first
export TRANCHE_AMOUNTS=10000000000,40000000000
export TRANCHE_DEADLINES=1750000000,1755000000
export DISPUTE_WINDOWS_SECONDS=259200,259200

forge script script/DeployTrancheVault.s.sol --rpc-url <RPC> --broadcast
```
