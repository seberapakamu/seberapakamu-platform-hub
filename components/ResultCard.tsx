"use client";

import { forwardRef } from "react";
import type { TierInfo } from "@/lib/scoring";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ResultCardProps {
  username: string;
  score: number;
  tierInfo: TierInfo;
  createdAt: string;
  /** Template index (0-2). If omitted, one is chosen randomly at render time. */
  templateIndex?: number;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export interface CardTemplate {
  id: string;
  name: string;
  /** Tailwind / inline-style bg for the card */
  bgGradient: string;
  accentColor: string;
  headerEmoji: string;
  headerTitle: string;
  footerLabel: string;
}

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: "sertifikat-sepuh",
    name: "Sertifikat Sepuh",
    bgGradient: "linear-gradient(135deg, #FFF5F7 0%, #FECFEF 50%, #A18CD1 100%)",
    accentColor: "#A18CD1",
    headerEmoji: "📜",
    headerTitle: "SERTIFIKAT SEPUH",
    footerLabel: "Disahkan oleh Dewan Wibu Nasional",
  },
  {
    id: "surat-izin-binge",
    name: "Surat Izin Binge",
    bgGradient: "linear-gradient(135deg, #FFF9E6 0%, #FFD89B 50%, #FF9A9E 100%)",
    accentColor: "#FF9A9E",
    headerEmoji: "📋",
    headerTitle: "SURAT IZIN BINGE",
    footerLabel: "Berlaku seumur hidup · Tidak dapat dicabut",
  },
  {
    id: "lulus-akademi-waifu",
    name: "Lulus Akademi Waifu",
    bgGradient: "linear-gradient(135deg, #E8F5FF 0%, #A0C4FF 50%, #84FAB0 100%)",
    accentColor: "#5B9BD5",
    headerEmoji: "🎓",
    headerTitle: "LULUS AKADEMI WAIFU",
    footerLabel: "Angkatan Musim Semi · Kelas Kehormatan",
  },
];

// ─── Quotes ───────────────────────────────────────────────────────────────────

const HUMORIS_QUOTES: string[] = [
  "\"Anime bukan pelarian — ini adalah destinasi.\" — Sun Tzu (mungkin)",
  "\"Satu episode lagi\" — kata-kata terakhir sebelum subuh.",
  "\"Aku tidak kecanduan anime. Aku hanya sangat berdedikasi.\"",
  "\"Waifu > Kehidupan nyata. Ini bukan opini, ini matematika.\"",
  "\"Tidur itu penting, tapi ending arc ini lebih penting.\"",
  "\"Orang bilang aku perlu keluar. Aku sudah keluar — ke dunia isekai.\"",
  "\"Crunchyroll adalah investasi jangka panjang.\"",
  "\"Bahasa Jepang? Aku belajar sendiri dari subtitle.\"",
  "\"Figurin itu bukan mainan. Itu seni. Itu warisan budaya.\"",
  "\"Kalau anime salah, aku tidak mau benar.\"",
];

function getRandomQuote(seed: number): string {
  return HUMORIS_QUOTES[seed % HUMORIS_QUOTES.length];
}

function getRandomTemplateIndex(seed: number): number {
  return seed % CARD_TEMPLATES.length;
}

// ─── ResultCard Component ─────────────────────────────────────────────────────

/**
 * Shareable result card rendered as a DOM element.
 * Use `forwardRef` so the parent can pass a ref to html2canvas.
 */
const ResultCard = forwardRef<HTMLDivElement, ResultCardProps>(
  ({ username, score, tierInfo, createdAt, templateIndex }, ref) => {
    // Deterministic "random" based on username + score so SSR/CSR match
    const seed = username.length + Math.round(score);
    const tplIdx = templateIndex ?? getRandomTemplateIndex(seed);
    const template = CARD_TEMPLATES[tplIdx];
    const quote = getRandomQuote(seed + tplIdx);

    const formattedDate = new Date(createdAt).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div
        ref={ref}
        data-testid="result-card"
        style={{
          width: "540px",
          minHeight: "540px",
          background: template.bgGradient,
          borderRadius: "24px",
          padding: "40px 36px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Decorative circles */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-60px",
            right: "-60px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            backgroundColor: template.accentColor,
            opacity: 0.15,
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: "-40px",
            left: "-40px",
            width: "140px",
            height: "140px",
            borderRadius: "50%",
            backgroundColor: template.accentColor,
            opacity: 0.1,
          }}
        />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px", zIndex: 1 }}>
          <div style={{ fontSize: "32px", marginBottom: "6px" }} aria-hidden="true">
            {template.headerEmoji}
          </div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 900,
              letterSpacing: "3px",
              color: template.accentColor,
              textTransform: "uppercase",
            }}
          >
            {template.headerTitle}
          </div>
        </div>

        {/* Username */}
        <div
          style={{
            fontSize: "22px",
            fontWeight: 800,
            color: "#3A3A5A",
            marginBottom: "4px",
            textAlign: "center",
            zIndex: 1,
          }}
          data-testid="card-username"
        >
          {username}
        </div>
        <div
          style={{
            fontSize: "12px",
            color: "#8A8AA0",
            marginBottom: "24px",
            zIndex: 1,
          }}
          data-testid="card-date"
        >
          {formattedDate}
        </div>

        {/* Score */}
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            backgroundColor: "rgba(255,255,255,0.7)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "20px",
            border: `3px solid ${template.accentColor}`,
            zIndex: 1,
          }}
        >
          <div
            style={{ fontSize: "36px", fontWeight: 900, color: "#3A3A5A", lineHeight: 1 }}
            data-testid="card-score"
          >
            {score}
          </div>
          <div style={{ fontSize: "11px", color: "#8A8AA0", fontWeight: 600 }}>/ 100</div>
        </div>

        {/* Tier */}
        <div
          style={{
            textAlign: "center",
            backgroundColor: "rgba(255,255,255,0.6)",
            borderRadius: "16px",
            padding: "14px 24px",
            marginBottom: "16px",
            width: "100%",
            zIndex: 1,
          }}
        >
          <div style={{ fontSize: "28px", marginBottom: "4px" }} aria-hidden="true">
            {tierInfo.emoji}
          </div>
          <div
            style={{ fontSize: "18px", fontWeight: 900, color: "#3A3A5A", marginBottom: "6px" }}
            data-testid="card-tier"
          >
            {tierInfo.title}
          </div>
          <div style={{ fontSize: "12px", color: "#5A5A7A", lineHeight: 1.5 }}>
            {tierInfo.description}
          </div>
        </div>

        {/* Quote */}
        <div
          style={{
            fontSize: "11px",
            fontStyle: "italic",
            color: "#8A8AA0",
            textAlign: "center",
            marginBottom: "20px",
            padding: "0 8px",
            zIndex: 1,
          }}
          data-testid="card-quote"
        >
          {quote}
        </div>

        {/* Watermark */}
        <div
          style={{
            marginTop: "auto",
            fontSize: "11px",
            fontWeight: 700,
            color: template.accentColor,
            letterSpacing: "1px",
            textAlign: "center",
            zIndex: 1,
          }}
          data-testid="card-watermark"
        >
          🌸 SeberapaWibu.id
        </div>
        <div
          style={{
            fontSize: "10px",
            color: "#8A8AA0",
            marginTop: "4px",
            textAlign: "center",
            zIndex: 1,
          }}
        >
          {template.footerLabel}
        </div>
      </div>
    );
  }
);

ResultCard.displayName = "ResultCard";

export default ResultCard;
