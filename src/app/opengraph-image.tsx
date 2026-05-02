import { ImageResponse } from "next/og";

/** Default Open Graph image for the site. Next discovers this file by
 *  convention and serves it as the `og:image` for any page that doesn't
 *  override its own. The output is a 1200×630 PNG that link unfurlers
 *  (Slack, iMessage, WhatsApp, X, Discord, LinkedIn) all render at the
 *  large-image card size. */

export const alt =
  "Tesmaraneh — Ethical Fashion, Made in the Provinces of Sierra Leone";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand palette — must stay in sync with src/app/globals.css.
const TERRACOTTA = "#F3920F";
const TERRACOTTA_DARK = "#C77500";
const CHARCOAL = "#432118";
const CREAM = "#FAF6F1";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${TERRACOTTA} 0%, ${TERRACOTTA_DARK} 100%)`,
          color: CREAM,
          padding: "80px 96px",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* Subtle decorative pattern in the corners */}
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 360,
            height: 360,
            borderRadius: "100%",
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -160,
            width: 420,
            height: 420,
            borderRadius: "100%",
            background: "rgba(0,0,0,0.07)",
          }}
        />

        {/* Top eyebrow */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 22,
            fontFamily: "sans-serif",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.85)",
            fontWeight: 600,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "100%",
              background: CHARCOAL,
            }}
          />
          Tesmaraneh
        </div>

        {/* Main headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            marginBottom: "auto",
          }}
        >
          <div
            style={{
              fontSize: 132,
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: "white",
              maxWidth: 980,
            }}
          >
            Ethical Fashion,
          </div>
          <div
            style={{
              fontSize: 132,
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              color: CHARCOAL,
              maxWidth: 980,
              marginTop: 8,
            }}
          >
            Rooted in Sierra Leone.
          </div>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
              fontSize: 26,
              color: "rgba(255,255,255,0.92)",
              maxWidth: 720,
            }}
          >
            <div style={{ fontWeight: 600 }}>
              Hand-batiked, hand-tailored.
            </div>
            <div style={{ color: "rgba(255,255,255,0.78)" }}>
              SS26 Summer Collection — in stock now.
            </div>
          </div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.85)",
              fontWeight: 500,
            }}
          >
            tesmaraneh.vercel.app
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
