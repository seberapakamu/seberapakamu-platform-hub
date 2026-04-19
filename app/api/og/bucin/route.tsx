import { type NextRequest, NextResponse } from "next/server";
import { getBucinTier } from "@/lib/bucin-scoring";
import sharp from "sharp";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const score = parseFloat(searchParams.get("score") ?? "0");
  const username = searchParams.get("username") ?? "Seseorang";
  const tierInfo = getBucinTier(score);

  // Escape XML special characters
  const safeUsername = username
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .slice(0, 20);

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFF0F5"/>
      <stop offset="50%" style="stop-color:#FCE4EC"/>
      <stop offset="100%" style="stop-color:#F8BBD0"/>
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Decorative circles -->
  <circle cx="0" cy="0" r="250" fill="rgba(255,75,114,0.15)"/>
  <circle cx="1200" cy="630" r="250" fill="rgba(233,30,99,0.15)"/>
  
  <!-- Card -->
  <rect x="250" y="80" width="700" height="470" rx="32" fill="white" 
    style="filter:drop-shadow(0 8px 40px rgba(255,75,114,0.2))"/>
  <rect x="250" y="80" width="700" height="470" rx="32" fill="none" 
    stroke="#F8BBD0" stroke-width="2"/>
  
  <!-- Site name -->
  <text x="600" y="155" text-anchor="middle" 
    font-family="Arial, sans-serif" font-size="22" font-weight="900" 
    fill="#FF4B72" letter-spacing="1">
    💖 Seberapa Bucin Kamu?
  </text>
  
  <!-- Username -->
  <text x="600" y="210" text-anchor="middle" 
    font-family="Arial, sans-serif" font-size="30" font-weight="700" 
    fill="#7B1FA2">
    ${safeUsername}
  </text>
  
  <!-- Score -->
  <text x="600" y="330" text-anchor="middle" 
    font-family="Arial, sans-serif" font-size="100" font-weight="900" 
    fill="#311B92">
    ${Math.round(score)}
  </text>
  <text x="720" y="330" text-anchor="middle" 
    font-family="Arial, sans-serif" font-size="36" font-weight="700" 
    fill="#7B1FA2">
    /100
  </text>
  
  <!-- Tier badge -->
  <rect x="350" y="370" width="500" height="80" rx="20" fill="#FCE4EC"/>
  <text x="600" y="422" text-anchor="middle" 
    font-family="Arial, sans-serif" font-size="32" font-weight="900" 
    fill="#311B92">
    ${tierInfo.emoji} ${tierInfo.title}
  </text>
  
  <!-- Footer -->
  <text x="600" y="530" text-anchor="middle" 
    font-family="Arial, sans-serif" font-size="18" fill="#BA68C8">
    seberapakamu.id/bucin
  </text>
</svg>`;

  // Convert SVG to PNG for WhatsApp compatibility
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
