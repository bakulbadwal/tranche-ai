# Case Study — Tranche AI
### A product-thinking write-up (not a README). To run it, see [README](./README.md); this is the *why*.

An experimental prototype: condition-gated capital release for venture deals, where an AI agent verifies a milestone, posts a *challengeable* attestation on-chain, and only then unlocks the next tranche.

> Honest framing up front: this is a working **prototype on testnet** (Base Sepolia), not a production system. It's included here because the *product reasoning* — the problem scoping, the trust design, and the honest competitive read — is what I'd want a product hire to see, not because it's shipped at scale.

---

## The problem I scoped

Every milestone-based venture structure — SAFEs with conditions, earn-outs, staged grants, tranche checks — shares one weak point: **a human has to manually verify the milestone actually happened, and that verification step is slow, expensive, and exactly where fraud lives** (fabricated revenue, doctored audits, cap tables that don't reconcile). I have the diligence background to know this is a real, routine failure point, not a hypothetical.

## The sharpest decision: what this is NOT

The most important product move was **refusing the obvious adjacent problem.** Token-vesting / streaming ("unlock tokens linearly over time") is solved and commoditized — Sablier and Superfluid own it. Building another one would be undifferentiated. Tranche AI deliberately solves a *different* problem: releasing capital on a **real-world condition**, judged by an agent whose verdict is **checkable, not final.** Knowing which problem *not* to build is the decision the whole project rests on.

## The core trust-design insight

**The attestation can't be the final word — or you've just built an oracle you have to blindly trust.** So the design separates the agent's *claim* from the *money movement*: the AI reviews evidence against explicit, falsifiable criteria and posts a signed attestation, but that attestation sits behind a **dispute window** before any capital actually moves. The agent is fast and cheap; the challenge window is the check on it. That "verify → attest → *challengeable* → release" shape is the actual product primitive.

## Key product decisions & tradeoffs

| Decision | Why | Tradeoff accepted |
|---|---|---|
| **Condition-gating, not time-streaming** | The commoditized problem is time; the unsolved one is *evidence of a real event*. | Much harder to build and to trust. It's the whole point of the project. |
| **Challengeable attestation (dispute window) over a final agent verdict** | An unaccountable AI judge moving money is a non-starter; the check is what makes it safe. | Slower than instant release. Correct — trust > speed when capital moves. |
| **Narrow to a domain I can judge correctness in (venture milestones)** | Generic "AI oracle" demos can't verify their own quality; I can actually assess whether a VC-milestone verdict is right. | Smaller scope than a general primitive. Right — depth where I have real judgment. |
| **Publish an honest competitive read, not a first-ever claim** | Funded teams (Nava, Circle's escrow agent) are building the same *pattern* for other domains. The accurate claim is "first application to venture milestone financing I could find," not "first ever." | Less hype. Overclaiming is the fastest way to lose a technical reviewer's trust. |

## Where this sits in a real, dated trend

This isn't "AI × crypto" vibes — it's a specific convergence I can point to: the "Know Your Agent" primitive (Sean Neville / a16z crypto, Jan 2026), the "missing verification layer" thesis (Forbes, Feb 2026), corporate agent-payment standards shipping in parallel (Visa, Mastercard, Google AP2), and a NIST RFI on AI-agent security. Tranche AI is one narrow, concrete instance of that gap. Recognizing where a prototype sits in a real market trend is itself the product-sense signal.

## How I'd measure success (if productized)

Verification accuracy (agent verdict vs. ground-truth on known-good/known-fraud milestones), dispute rate and dispute-resolution outcomes (is the challenge window actually catching bad verdicts?), and time/cost per milestone vs. manual human verification. The eval question — *is the agent's judgment measurably correct?* — is the one that decides whether this is ever more than a prototype.

## Honest limitations

Testnet only; the agent-review logic is a prototype, not hardened; real-world evidence ingestion is the hard unsolved part. The value here is the **reasoning** — problem scoping, the checkable-not-final trust design, and the honest market read — demonstrated in working code.

## Why this write-up exists

I wanted to show product thinking on a frontier, ambiguous problem: scoping tightly, designing for trust rather than magic, and being honest about what's real. If you're reading it as a hiring signal, that's the intent.

---

*Tech: Solidity smart contract (Base Sepolia), Ethereum Attestation Service, AI review agent, Next.js front end. Part of a broader portfolio at [github.com/bakulbadwal](https://github.com/bakulbadwal).*
