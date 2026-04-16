import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";
import { getTier } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = parseFloat(searchParams.get("score") ?? "0");
  const username = searchParams.get("username") ?? "Wibu";

  const tierInfo = getTier(score);

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF5F7 0%, #FEEBF0 50%, #F5D5DC 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,154,158,0.25)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(161,140,209,0.25)",
          }}
        />

        {/* Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "white",
            borderRadius: 32,
            padding: "48px 64px",
            boxShadow: "0 8px 40px rgba(255,154,158,0.2)",
            border: "2px solid #F5D5DC",
            minWidth: 600,
          }}
        >
          {/* Site name */}
          <div
            style={{
              fontSize: 20,
              fontWeight: 900,
              color: "#FF9A9E",
              marginBottom: 16,
              letterSpacing: 1,
            }}
          >
            🌸 Seberapa Wibu Kamu?
          </div>

          {/* Username */}
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "#8A8AA0",
              marginBottom: 8,
            }}
          >
            {username}
          </div>

          {/* Score */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              color: "#3A3A5A",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            {score}
            <span style={{ fontSize: 32, color: "#8A8AA0" }}>/100</span>
          </div>

          {/* Tier */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "#FEEBF0",
              borderRadius: 20,
              padding: "12px 28px",
              marginTop: 16,
            }}
          >
            <span style={{ fontSize: 36 }}>{tierInfo.emoji}</span>
            <span
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#3A3A5A",
              }}
            >
              {tierInfo.title}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
