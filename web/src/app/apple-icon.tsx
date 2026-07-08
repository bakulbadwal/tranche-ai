import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 108 }}>
          <div style={{ height: 22, borderRadius: 11, background: "linear-gradient(120deg,#a78bfa,#7c6cff)" }} />
          <div style={{ height: 22, borderRadius: 11, background: "linear-gradient(120deg,#7c6cff,#38e8d8)", opacity: 0.85 }} />
          <div style={{ height: 22, borderRadius: 11, background: "#38e8d8", opacity: 0.6 }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
