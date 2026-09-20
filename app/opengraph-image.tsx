import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";
export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#170A02",
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(217,115,26,0.35), transparent 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 999,
              border: "2px solid #D9731A",
              color: "#D9731A",
              fontSize: 22,
            }}
          >
            RD
          </div>
          <span style={{ fontSize: 28, color: "#EBCBA9" }}>
            {siteConfig.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span
            style={{
              fontSize: 58,
              color: "#EBCBA9",
              lineHeight: 1.15,
              maxWidth: 900,
            }}
          >
            Tecnologia, moda e beleza, com a mesma atenção ao detalhe.
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
