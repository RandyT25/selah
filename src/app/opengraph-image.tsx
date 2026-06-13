import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Selah — Pause. Reflect. Grow.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
          background: "linear-gradient(135deg, #B8860B 0%, #ca8a04 50%, #854d0e 100%)",
          fontFamily: "serif",
        }}
      >
        {/* Background texture overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "rgba(255,255,255,0.15)",
            border: "2px solid rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
            fontSize: 52,
          }}
        >
          📖
        </div>

        {/* App name */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-2px",
            marginBottom: 16,
            textShadow: "0 2px 20px rgba(0,0,0,0.3)",
          }}
        >
          Selah
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: "rgba(255,255,255,0.85)",
            fontStyle: "italic",
            marginBottom: 40,
            letterSpacing: "1px",
          }}
        >
          Pause. Reflect. Grow.
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
            maxWidth: 800,
          }}
        >
          {["Bible Reading", "AI Study", "Prayer Journal", "Church Community"].map((f) => (
            <div
              key={f}
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 100,
                padding: "8px 20px",
                color: "white",
                fontSize: 20,
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
