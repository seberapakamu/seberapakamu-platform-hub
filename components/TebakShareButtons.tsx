"use client";

import { useState } from "react";
import type { TebakSessionResult } from "@/lib/types/tebak";
import { TEBAK_RANKS } from "@/lib/tebakScoring";

interface TebakShareButtonsProps {
  result: TebakSessionResult;
}

export default function TebakShareButtons({ result }: TebakShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const rankData = TEBAK_RANKS.find((r) => r.rank === result.rank) ?? TEBAK_RANKS[0];
  const shareUrl = `https://seberapakamu.id/wibu/tebak-result/${result.hash}`;
  const caption = `Aku dapat ${result.total_score} poin sebagai ${rankData.emoji} ${result.rank} di Tebak Karakter Anime! Coba kamu bisa lebih tinggi? 🎌 ${shareUrl}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}`;
  const waUrl = `https://wa.me/?text=${encodeURIComponent(caption)}`;
  const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Aku dapat ${result.total_score} poin sebagai ${rankData.emoji} ${result.rank} di Tebak Karakter Anime! Coba kamu bisa lebih tinggi? 🎌`)}`;

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  async function handleNativeShare() {
    try {
      await navigator.share({
        title: "Tebak Karakter Anime — seberapakamu.id",
        text: `Aku dapat ${result.total_score} poin sebagai ${rankData.emoji} ${result.rank} di Tebak Karakter Anime!`,
        url: shareUrl,
      });
    } catch {
      // User cancelled or not supported — fallback silently
    }
  }

  const supportsShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div
      className="rounded-3xl shadow-lg p-6"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <h2
        className="text-base font-black mb-4"
        style={{ color: "var(--color-text-bold)" }}
      >
        📣 Bagikan Hasil
      </h2>

      <div className="flex flex-wrap gap-3">
        {/* Native share (if supported) */}
        {supportsShare && (
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #FF9A9E, #A18CD1)" }}
          >
            📤 Bagikan
          </button>
        )}

        {/* X (Twitter) */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: "#000" }}
        >
          𝕏 Share ke X
        </a>

        {/* WhatsApp */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: "#25D366" }}
        >
          💬 WhatsApp
        </a>

        {/* Telegram */}
        <a
          href={tgUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{ backgroundColor: "#0088CC" }}
        >
          ✈️ Telegram
        </a>

        {/* Copy link */}
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          style={{
            backgroundColor: copied ? "var(--color-success, #4CAF50)" : "var(--color-surface-alt)",
            color: copied ? "#fff" : "var(--color-text-bold)",
            border: "1px solid var(--color-border)",
          }}
        >
          {copied ? "✅ Tersalin!" : "🔗 Salin Link"}
        </button>
      </div>

      {/* Caption preview */}
      <div
        className="mt-4 p-3 rounded-2xl text-xs"
        style={{
          backgroundColor: "var(--color-surface-alt)",
          color: "var(--color-text-muted)",
          wordBreak: "break-all",
        }}
      >
        {caption}
      </div>
    </div>
  );
}
