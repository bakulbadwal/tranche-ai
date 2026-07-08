# AI Tranche

Condition-gated capital release for venture-style deals. An investor funds a recipient in
tranches; each tranche unlocks only after a milestone attestation — reviewed by an AI agent,
posted on-chain via [EAS](https://attest.org), and left open to a dispute window — has stood
unchallenged.

This is **not** a token-vesting/streaming project (see [Sablier](https://sablier.com) or
[Superfluid](https://superfluid.finance) for that — time-based unlock schedules are a solved,
commoditized problem). This encodes the actual conditions venture deals are structured around:
milestones, diligence evidence, and the very real possibility that the evidence is fabricated —
which is why every AI verdict here is challengeable, not final.

## Why

Milestone-based financing (SAFEs with conditions, earn-outs, staged grants) exists in traditional
deals but relies entirely on a human — usually the investor's own diligence team — to verify that
a milestone was actually hit. That verification is slow, expensive, and exactly where fraud tends
to live: fabricated revenue numbers, doctored audits, cap tables that don't match reality. This
project moves that verification step on-chain and makes it AI-assisted but not AI-final —
attestations sit behind a dispute window before funds move.

## How it works

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

## Structure

```
src/TrancheVault.sol             — the core contract (funding, attestation checks, dispute, release, clawback)
src/mocks/MockERC20.sol          — test-only stablecoin stand-in
test/TrancheVault.t.sol          — full Foundry test suite, deployed against real EAS + SchemaRegistry (no mocked oracle)
script/DeployTrancheVault.s.sol  — env-var-driven deploy script
agent/                           — off-chain TypeScript review agent (Claude review → EAS attestation)
```

## Status: v1 skeleton

What's built and tested:
- Core vault contract: fund → attest → dispute-or-release → clawback, full access control
- Integration tests against the real EAS + SchemaRegistry contracts (not a mock oracle)
- Deploy script and the Claude-based review-call logic in the agent

What's deliberately left for the next pass (this is a portfolio v1, not a production system):
- The agent's evidence fetchers (GitHub API, doc pinning) and the EAS SDK submission call
- Multi-deal factory pattern (v1 is one investor/recipient/deal per vault deployment)
- A frontend for investors/recipients to track tranche status without reading the chain directly
- A real arbitration process beyond "a designated address decides" (e.g. a small reviewer panel)

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
