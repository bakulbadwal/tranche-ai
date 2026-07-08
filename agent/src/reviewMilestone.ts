/**
 * Milestone review agent — the off-chain half of AI Tranche.
 *
 * Flow:
 *   1. Pull evidence for a milestone (a GitHub repo, a PDF, a metrics export — whatever the
 *      deal's tranche schema calls for).
 *   2. Ask Claude to review it against the milestone's stated criteria and return a structured
 *      verdict: approved (bool), confidence (0-100), reasoning, evidenceURI.
 *   3. If approved, sign and submit an EAS attestation on the milestone schema.
 *   4. Call TrancheVault.submitAttestation(trancheId, attestationUID) to start the dispute clock.
 *
 * This is a skeleton, not a finished service — steps 1 and 3 need real integrations wired in
 * (a GitHub API client, an evidence-pinning step to IPFS/Arweave, an EAS SDK signer using the
 * agent's private key) before this runs end-to-end. The Claude review call in step 2 is fully
 * specified and ready to use.
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic(); // reads ANTHROPIC_API_KEY from env

interface MilestoneReviewInput {
  milestoneDescription: string; // e.g. "Recipient has shipped a working v1 and it's deployed"
  acceptanceCriteria: string[]; // explicit, falsifiable criteria — not vibes
  evidence: {
    kind: "github_repo" | "document" | "url" | "text";
    content: string; // raw content, URL, or repo summary — caller fetches/prepares this
  }[];
}

interface MilestoneVerdict {
  approved: boolean;
  confidence: number; // 0-100
  reasoning: string;
  unmetCriteria: string[];
}

const VERDICT_TOOL: Anthropic.Tool = {
  name: "submit_verdict",
  description: "Submit the structured milestone review verdict.",
  input_schema: {
    type: "object",
    properties: {
      approved: { type: "boolean", description: "True only if ALL acceptance criteria are clearly met by the evidence." },
      confidence: { type: "number", description: "0-100. Lower confidence should bias toward NOT approving." },
      reasoning: { type: "string", description: "Plain-English justification citing specific evidence." },
      unmetCriteria: { type: "array", items: { type: "string" }, description: "Any criteria not clearly satisfied, even if approved is true." },
    },
    required: ["approved", "confidence", "reasoning", "unmetCriteria"],
  },
};

export async function reviewMilestone(input: MilestoneReviewInput): Promise<MilestoneVerdict> {
  const evidenceBlock = input.evidence
    .map((e, i) => `Evidence ${i + 1} [${e.kind}]:\n${e.content}`)
    .join("\n\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    tools: [VERDICT_TOOL],
    tool_choice: { type: "tool", name: "submit_verdict" },
    system:
      "You are a skeptical diligence reviewer for a venture capital milestone-financing deal. " +
      "Funds only release if you approve. Do not approve on partial or ambiguous evidence — " +
      "when in doubt, list the criterion as unmet and set approved=false. You are the first " +
      "check, not the only one: a human dispute window follows your verdict, so be precise and " +
      "citeable rather than lenient.",
    messages: [
      {
        role: "user",
        content:
          `Milestone: ${input.milestoneDescription}\n\n` +
          `Acceptance criteria:\n${input.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}\n\n` +
          `${evidenceBlock}`,
      },
    ],
  });

  const toolUse = message.content.find((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");
  if (!toolUse) throw new Error("Model did not return a verdict tool call");

  return toolUse.input as MilestoneVerdict;
}

// --- Next steps to wire this into a running service (not yet implemented here) ---
// 1. evidence fetchers: GitHub API (commit/PR activity), IPFS/Arweave doc pinning, on-chain reads
// 2. postAttestation(verdict, schemaUID, recipient) using @ethereum-attestation-service/eas-sdk,
//    signed by AGENT_PRIVATE_KEY (the same address configured as `agent` on TrancheVault)
// 3. submitToVault(trancheId, attestationUID) — a plain ethers.js contract call
// 4. a small queue/cron so this runs when a recipient marks a milestone ready for review
