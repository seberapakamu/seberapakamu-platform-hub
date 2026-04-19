/**
 * Pure Canvas 2D renderer for the result card.
 * Avoids html2canvas entirely — no CSS color parsing issues.
 */

import { CARD_TEMPLATES, type CardTemplate } from "@/components/ResultCard";
import type { TierInfo } from "@/lib/scoring";

export const WIBU_QUOTES = [
  '"Anime bukan pelarian — ini adalah destinasi." — Sun Tzu (mungkin)',
  '"Satu episode lagi" — kata-kata terakhir sebelum subuh.',
  '"Aku tidak kecanduan anime. Aku hanya sangat berdedikasi."',
  '"Waifu > Kehidupan nyata. Ini bukan opini, ini matematika."',
  '"Tidur itu penting, tapi ending arc ini lebih penting."',
  '"Orang bilang aku perlu keluar. Aku sudah keluar — ke dunia isekai."',
  '"Crunchyroll adalah investasi jangka panjang."',
  '"Bahasa Jepang? Aku belajar sendiri dari subtitle."',
  '"Figurin itu bukan mainan. Itu seni. Itu warisan budaya."',
  '"Kalau anime salah, aku tidak mau benar."',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Parse "linear-gradient(135deg, #AAA 0%, #BBB 50%, #CCC 100%)" into stops */
function parseGradientStops(gradient: string): Array<{ color: string; stop: number }> {
  const stops: Array<{ color: string; stop: number }> = [];
  const re = /(#[0-9a-fA-F]{3,8})\s+([\d.]+)%/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(gradient)) !== null) {
    stops.push({ color: m[1], stop: parseFloat(m[2]) / 100 });
  }
  return stops;
}

/** Draw a rounded rectangle path */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/** Wrap text and return lines */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

// ─── Main draw function ───────────────────────────────────────────────────────

export interface DrawCardOptions {
  username: string;
  score: number;
  tierInfo: TierInfo;
  createdAt: string;
  templateIndex: number;
  /** Output width in px (height is auto-calculated to match aspect) */
  width: number;
  height: number;
  watermarkText?: string;
  quotes?: string[];
  template?: CardTemplate;
}

export function drawResultCard(
  canvas: HTMLCanvasElement,
  opts: DrawCardOptions
): void {
  const { username, score, tierInfo, createdAt, templateIndex, width, height } = opts;
  const template: CardTemplate = opts.template ?? CARD_TEMPLATES[templateIndex];

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;
  const s = width / 1080; // scale factor (1080 is our design base)

  // ── Background gradient ──────────────────────────────────────────────────
  const stops = parseGradientStops(template.bgGradient);
  // 135deg gradient: top-left → bottom-right
  const grd = ctx.createLinearGradient(0, 0, width, height);
  for (const { color, stop } of stops) {
    grd.addColorStop(stop, color);
  }
  roundRect(ctx, 0, 0, width, height, 48 * s);
  ctx.fillStyle = grd;
  ctx.fill();

  // ── Decorative circles ───────────────────────────────────────────────────
  const [ar, ag, ab] = hexToRgb(template.accentColor);
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = template.accentColor;
  ctx.beginPath();
  ctx.arc(width - 120 * s, 120 * s, 200 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.1;
  ctx.beginPath();
  ctx.arc(120 * s, height - 120 * s, 140 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  let y = 80 * s; // current Y cursor

  // ── Header emoji ─────────────────────────────────────────────────────────
  ctx.font = `${56 * s}px serif`;
  ctx.textAlign = "center";
  ctx.fillText(template.headerEmoji, width / 2, y + 50 * s);
  y += 80 * s;

  // ── Header title ─────────────────────────────────────────────────────────
  ctx.font = `900 ${22 * s}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = template.accentColor;
  ctx.letterSpacing = `${4 * s}px`;
  ctx.fillText(template.headerTitle, width / 2, y);
  ctx.letterSpacing = "0px";
  y += 60 * s;

  // ── Username ─────────────────────────────────────────────────────────────
  ctx.font = `800 ${38 * s}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = "#3A3A5A";
  ctx.fillText(username, width / 2, y);
  y += 36 * s;

  // ── Date ─────────────────────────────────────────────────────────────────
  const formattedDate = new Date(createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  ctx.font = `${20 * s}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = "#8A8AA0";
  ctx.fillText(formattedDate, width / 2, y);
  y += 60 * s;

  // ── Score circle ─────────────────────────────────────────────────────────
  const cx = width / 2;
  const cy = y + 100 * s;
  const r = 100 * s;

  // White fill
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fill();

  // Border
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = template.accentColor;
  ctx.lineWidth = 5 * s;
  ctx.stroke();

  // Score number
  ctx.font = `900 ${64 * s}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = "#3A3A5A";
  ctx.textBaseline = "middle";
  ctx.fillText(String(score), cx, cy - 10 * s);

  // "/100" label
  ctx.font = `600 ${18 * s}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = "#8A8AA0";
  ctx.fillText("/ 100", cx, cy + 30 * s);
  ctx.textBaseline = "alphabetic";

  y += 230 * s;

  // ── Tier box ─────────────────────────────────────────────────────────────
  const boxX = 60 * s;
  const boxW = width - 120 * s;
  const boxH = 220 * s;
  roundRect(ctx, boxX, y, boxW, boxH, 24 * s);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fill();

  // Tier emoji
  ctx.font = `${48 * s}px serif`;
  ctx.textAlign = "center";
  ctx.fillText(tierInfo.emoji, width / 2, y + 60 * s);

  // Tier title
  ctx.font = `900 ${30 * s}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = "#3A3A5A";
  ctx.fillText(tierInfo.title, width / 2, y + 110 * s);

  // Tier description (wrapped)
  ctx.font = `${19 * s}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = "#5A5A7A";
  const descLines = wrapText(ctx, tierInfo.description, boxW - 60 * s);
  const lineH = 26 * s;
  let descY = y + 145 * s;
  for (const line of descLines.slice(0, 3)) {
    ctx.fillText(line, width / 2, descY);
    descY += lineH;
  }

  y += boxH + 40 * s;

  // ── Quote ────────────────────────────────────────────────────────────────
  const seed = username.length + Math.round(score);
  const quoteList = opts.quotes ?? WIBU_QUOTES;
  const quote = quoteList[(seed + templateIndex) % quoteList.length];
  ctx.font = `italic ${17 * s}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = "#8A8AA0";
  const quoteLines = wrapText(ctx, quote, width - 120 * s);
  for (const line of quoteLines.slice(0, 3)) {
    ctx.fillText(line, width / 2, y);
    y += 24 * s;
  }

  y += 20 * s;

  // ── Watermark ────────────────────────────────────────────────────────────
  ctx.font = `700 ${18 * s}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = template.accentColor;
  ctx.fillText(opts.watermarkText ?? "🌸 SeberapaKamu.id", width / 2, height - 50 * s);

  ctx.font = `${16 * s}px 'Segoe UI', system-ui, sans-serif`;
  ctx.fillStyle = "#8A8AA0";
  ctx.fillText(template.footerLabel, width / 2, height - 26 * s);
}
