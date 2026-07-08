import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05060a",
          borderRadius: 9,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 3, width: 20 }}>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: "linear-gradient(120deg, #a78bfa, #7c6cff)",
            }}
          />
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: "linear-gradient(120deg, #7c6cff, #38e8d8)",
              opacity: 0.85,
            }}
          />
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: "#38e8d8",
              opacity: 0.6,
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
