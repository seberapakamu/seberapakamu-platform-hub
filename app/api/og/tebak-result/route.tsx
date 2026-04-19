import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username") ?? "Wibu";
  const score = parseInt(searchParams.get("score") ?? "0", 10);
  const rank = searchParams.get("rank") ?? "Pemula Wibu";
  const correct = searchParams.get("correct") ?? "0";
  const total = searchParams.get("total") ?? "10";

  // Rank emoji map
  const rankEmojis: Record<string, string> = {
    "Pemula Wibu": "🌱",
    "Wibu Biasa": "🌸",
    "Wibu Sejati": "⚔️",
    "Wibu Veteran": "🏆",
    "Sepuh Wibu": "👑",
  };
  const emoji = rankEmojis[rank] ?? "🎭";

  // Escape XML special characters
  function escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .slice(0, 24);
  }

  const safeUsername = escapeXml(username);
  const safeRank = escapeXml(rank);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFF0F5"/>
      <stop offset="50%" style="stop-color:#F5E6FF"/>
      <stop offset="100%" style="stop-color:#E8D5FF"/>
    </linearGradient>
    <linearGradient id="badge" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#FF9A9E"/>
      <stop offset="100%" style="stop-color:#A18CD1"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="0" cy="0" r="280" fill="rgba(255,154,158,0.15)"/>
  <circle cx="1200" cy="630" r="280" fill="rgba(161,140,209,0.15)"/>
  <circle cx="1200" cy="0" r="180" fill="rgba(255,200,221,0.2)"/>

  <!-- Card -->
  <rect x="200" y="60" width="800" height="510" rx="36" fill="white"
    style="filter:drop-shadow(0 8px 40px rgba(161,140,209,0.25))"/>
  <rect x="200" y="60" width="800" height="510" rx="36" fill="none"
    stroke="#E8D5FF" stroke-width="2"/>

  <!-- Platform name -->
  <text x="600" y="135" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="20" font-weight="900"
    fill="#A18CD1" letter-spacing="2">
    🎭 Tebak Karakter Anime
  </text>
  <text x="600" y="162" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="14" font-weight="600"
    fill="#C4A8E0" letter-spacing="1">
    seberapakamu.id
  </text>

  <!-- Username -->
  <text x="600" y="215" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="32" font-weight="700"
    fill="#6B5B95">
    ${safeUsername}
  </text>

  <!-- Score big -->
  <text x="600" y="330" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="110" font-weight="900"
    fill="#3A3A5A">
    ${score}
  </text>
  <text x="600" y="365" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="20" font-weight="600"
    fill="#9A8AB0">
    poin
  </text>

  <!-- Rank badge -->
  <rect x="300" y="390" width="600" height="70" rx="20" fill="url(#badge)"/>
  <text x="600" y="433" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="28" font-weight="900"
    fill="white">
    ${emoji} ${safeRank}
  </text>

  <!-- Stats row -->
  <text x="420" y="500" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="22" font-weight="900"
    fill="#3A3A5A">
    ${correct}/${total}
  </text>
  <text x="420" y="525" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="14" fill="#9A8AB0">
    Benar
  </text>

  <text x="600" y="500" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="22" font-weight="900"
    fill="#3A3A5A">
    🎌
  </text>

  <text x="780" y="500" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="22" font-weight="900"
    fill="#3A3A5A">
    ${Math.round((parseInt(correct, 10) / Math.max(parseInt(total, 10), 1)) * 100)}%
  </text>
  <text x="780" y="525" text-anchor="middle"
    font-family="Arial, sans-serif" font-size="14" fill="#9A8AB0">
    Akurasi
  </text>
</svg>`;

  const pngBuffer = await sharp(Buffer.from(svg), { density: 300 })
    .resize(1200, 630)
    .png({ quality: 95 })
    .toBuffer();

  return new NextResponse(pngBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600, immutable",
    },
  });
}
