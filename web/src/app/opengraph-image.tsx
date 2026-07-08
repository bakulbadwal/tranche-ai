import { ImageResponse } from "next/og";

export const alt = "Tranche AI — condition-gated capital release for venture-style deals";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#05060a",
          backgroundImage:
            "radial-gradient(circle at 15% 0%, rgba(124,108,255,0.35), transparent 55%), radial-gradient(circle at 100% 20%, rgba(56,232,216,0.22), transparent 50%)",
          position: "relative",
        }}
      >
        {/* Logo mark: three ascending tranches */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
          <div style={{ width: 220, height: 20, borderRadius: 10, background: "linear-gradient(120deg,#a78bfa,#7c6cff)" }} />
          <div style={{ width: 220, height: 20, borderRadius: 10, background: "linear-gradient(120deg,#7c6cff,#38e8d8)", opacity: 0.75 }} />
          <div style={{ width: 220, height: 20, borderRadius: 10, background: "#38e8d8", opacity: 0.45 }} />
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "white",
          }}
        >
          Tranche&nbsp;<span style={{ color: "#a78bfa" }}>AI</span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 30,
            color: "#a3a3ad",
            maxWidth: 880,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Capital that releases on proof, not trust.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 40,
            padding: "10px 20px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.04)",
            fontSize: 22,
            color: "#d4d4d8",
          }}
        >
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "#34d399" }} />
          Live on Base Sepolia · verified against real EAS
        </div>
      </div>
    ),
    { ...size }
  );
}
