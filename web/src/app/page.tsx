import Link from "next/link";
import { DealView } from "@/components/DealView";
import { FlowDiagram } from "@/components/FlowDiagram";

const STATS = [
  { label: "Network", value: "Base Sepolia" },
  { label: "Attestations", value: "EAS (live)" },
  { label: "Dispute window", value: "Challengeable" },
  { label: "Tests", value: "11 / 11 green" },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-6">
      {/* ---- Hero ---- */}
      <section className="pt-20 pb-14 text-center sm:pt-28">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs text-neutral-300 animate-fade-up">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          Live on Base Sepolia · verified against real EAS
        </div>

        <h1
          className="mx-auto mt-6 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl animate-fade-up"
          style={{ animationDelay: "80ms" }}
        >
          <span className="gradient-text">Capital that releases</span>
          <br />
          <span className="text-neutral-100">on proof, not trust.</span>
        </h1>

        <p
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg animate-fade-up"
          style={{ animationDelay: "160ms" }}
        >
          Condition-gated capital release for venture-style deals. Milestones are reviewed by an AI
          agent and attested on-chain via{" "}
          <a
            href="https://attest.org"
            target="_blank"
            rel="noreferrer"
            className="text-violet-300 underline decoration-violet-500/40 underline-offset-2 hover:text-violet-200"
          >
            EAS
          </a>
          {" "}— but every attestation sits behind a dispute window, so a single AI verdict can never
          move money on its own.
        </p>

        <div
          className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up"
          style={{ animationDelay: "240ms" }}
        >
          <a
            href="#deal"
            className="rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-violet-500 hover:shadow-[0_8px_30px_-8px_rgba(124,108,255,0.6)]"
          >
            Inspect the live deal
          </a>
          <a
            href="https://github.com/bakulbadwal/tranche-ai"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/10"
          >
            View source
          </a>
        </div>

        {/* Stat chips */}
        <dl
          className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4 animate-fade-up"
          style={{ animationDelay: "320ms" }}
        >
          {STATS.map((s) => (
            <div key={s.label} className="glass rounded-xl px-4 py-3 text-left">
              <dt className="text-[11px] uppercase tracking-wide text-neutral-500">{s.label}</dt>
              <dd className="mt-0.5 text-sm font-medium text-neutral-100">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ---- How it works ---- */}
      <section className="py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Four steps from deposit to settlement — with a human check on the AI in the middle.
            </p>
          </div>
        </div>
        <FlowDiagram />
      </section>

      {/* ---- Live deal ---- */}
      <section id="deal" className="scroll-mt-20 py-10">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight">Live deal</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Real on-chain state, read straight from the vault. Anyone can inspect it; only the{" "}
            <Link href="/investor" className="text-violet-300 hover:text-violet-200">
              investor
            </Link>
            ,{" "}
            <Link href="/recipient" className="text-violet-300 hover:text-violet-200">
              recipient
            </Link>
            , and arbitrator can act on it.
          </p>
        </div>
        <DealView />
      </section>
    </div>
  );
}
