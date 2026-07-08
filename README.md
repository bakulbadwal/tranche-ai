# AI Tranche

**Condition-gated capital release for venture-style deals.** An investor funds a recipient in
tranches; each tranche unlocks only after a milestone attestation — reviewed by an AI agent,
posted on-chain via [EAS](https://attest.org), and left open to a dispute window — has stood
unchallenged.

This is **not** a token-vesting/streaming project. [Sablier](https://sablier.com) and
[Superfluid](https://superfluid.finance) already solved "unlock tokens linearly over time" —
that's commoditized. AI Tranche solves a different problem: releasing capital on a **condition**,
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

AI Tranche is a narrow, concrete instance of exactly that second gap: **a verification layer that
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
script/DeployTrancheVault.s.sol  — env-var-driven deploy script
agent/                           — off-chain TypeScript review agent (Claude review → EAS attestation)
web/                             — frontend (planned — see Roadmap)
```

## Build plan

### Phase 0 — Contract core (done)
- [x] `TrancheVault.sol`: fund → attest → dispute-or-release → clawback, full access control
- [x] Integration tests against real EAS + SchemaRegistry deployments (11/11 passing)
- [x] Env-var-driven deploy script

### Phase 1 — Agent wiring (next)
- [ ] Evidence fetchers: GitHub API (commit/PR activity), doc pinning to IPFS/Arweave
- [ ] `postAttestation()` — sign and submit via `@ethereum-attestation-service/eas-sdk`
- [ ] `submitToVault()` — plain ethers/viem call to `submitAttestation`
- [ ] Register the milestone EAS schema on testnet

### Phase 2 — Testnet deployment
- [ ] Deploy `TrancheVault` + a mock USDC to **Base Sepolia** (see rationale below)
- [ ] Register real EAS schema, run one full demo deal end-to-end from a script

### Phase 3 — Frontend
- [ ] Investor view: create a deal, fund it, see tranche status, dispute
- [ ] Recipient view: submit milestone evidence, track attestation status
- [ ] Public view: read-only deal explorer (anyone can inspect a deal's attestation trail)

### Phase 4 — Polish / demo readiness
- [ ] Seed a realistic demo deal (2-3 tranches) with a walkthrough script
- [ ] One-page deck: problem, whitespace framing (KYA / verification layer), how it works, demo link

### Deliberately out of scope for v1
- Multi-deal factory pattern (v1 is one vault per deal — clean and legible; factory is a v2 concern)
- A real arbitration process beyond "a designated address decides" (a small reviewer panel is v2)
- Any token/points/incentive layer — this is infrastructure, not a token launch

## Frontend & hosting plan

**Stack:** Next.js (App Router) + TypeScript + [wagmi](https://wagmi.sh)/[viem](https://viem.sh) for
contract reads/writes + a wallet connector (RainbowKit or ConnectKit). This is the standard,
boring, well-documented stack for a dApp frontend — no reason to deviate for a portfolio project.

**Chain:** deploying to **Base Sepolia** (Base's testnet), not Ethereum Sepolia. Reasoning:
- EAS has first-class, well-documented support on Base.
- Base is where the x402 agent-payment ecosystem actually lives (Coinbase-backed, highest real
  agent transaction volume of any chain right now) — deploying there puts the demo in the same
  neighborhood as the ecosystem the whitespace framing is about.
- Cheap/fast for a demo; free testnet ETH from a faucet, no real funds at risk.

**Hosting:**
- **Frontend → Vercel.** Free tier, native Next.js support, connects directly to the GitHub repo
  for auto-deploy on push — you get a live URL (`tranche-ai.vercel.app` or a custom domain) with
  zero server management. This is the default choice for this stack; no reason to consider
  anything else at this scale.
- **Contracts → Base Sepolia**, verified on [BaseScan](https://sepolia.basescan.org) so anyone
  (a hackathon judge, a recruiter) can read the deployed contract directly.
- **Agent service** — for a hackathon demo, this can run as a Vercel serverless function or even
  be triggered manually via a CLI script (`agent/src/reviewMilestone.ts`) during the live demo,
  rather than standing up a persistent server. Keep it simple until there's a reason not to.

## What else to plan for

- **A private key for the agent's signing address**, separate from your personal wallet — this is
  the address whose attestations the contract trusts, so treat it like a service credential, not
  a wallet you also hold funds in.
- **An `ANTHROPIC_API_KEY`** for the review agent, and a **Base Sepolia RPC URL** (Alchemy or
  Coinbase Developer Platform both offer free tiers).
- **A short demo script** for the hackathon: one investor wallet, one recipient wallet, one fake
  "milestone" with real evidence (e.g. this very repo's commit history) run through the agent live.
- **The pitch framing**: lead with the KYA/verification-layer whitespace, not "VC tool" — that's
  what makes it read as infrastructure-aware rather than a niche fintech utility.

## Local development

```bash
forge install          # pulls forge-std, eas-contracts, openzeppelin-contracts
forge build
forge test -vv
```

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
