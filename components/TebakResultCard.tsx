"use client";

import { useRef, useState } from "react";
import type { TebakSessionResult } from "@/lib/types/tebak";
import { TEBAK_RANKS } from "@/lib/tebakScoring";

interface TebakResultCardProps {
  result: TebakSessionResult;
}

export default function TebakResultCard({ result }: TebakResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const rankData = TEBAK_RANKS.find((r) => r.rank === result.rank) ?? TEBAK_RANKS[0];
  const finishedDate = new Date(result.finished_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const accuracy = Math.round((result.correct_count / Math.max(result.total_soal, 1)) * 100);

  async function handleDownload() {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `tebak-karakter-${result.username}-${result.total_score}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="rounded-3xl shadow-lg overflow-hidden"
      style={{
        backgroundColor: "var(--color-surface)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h2
          className="text-base font-black"
          style={{ color: "var(--color-text-bold)" }}
        >
          🖼️ Kartu Hasil
        </h2>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-4 py-2 rounded-2xl font-black text-sm text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {downloading ? "⏳ Generating..." : "⬇️ Download PNG"}
        </button>
      </div>

      {/* Preview wrapper — scaled down to fit screen */}
      <div className="p-4 flex justify-center overflow-hidden">
        <div
          style={{
            transform: "scale(0.35)",
            transformOrigin: "top center",
            width: "1080px",
            height: "1080px",
            marginBottom: "calc((1080px * 0.35) - 1080px)",
          }}
        >
          {/* The actual 1080×1080 card */}
          <div
            id="tebak-result-card"
            ref={cardRef}
            style={{
              width: "1080px",
              height: "1080px",
              background: "linear-gradient(135deg, #FFB3C6 0%, #C9A8FF 50%, #A8D8FF 100%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "80px",
              boxSizing: "border-box",
              fontFamily: "Arial, sans-serif",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative circles */}
            <div
              style={{
                position: "absolute",
                top: -100,
                left: -100,
                width: 400,
                height: 400,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -120,
                right: -120,
                width: 500,
                height: 500,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
              }}
            />

            {/* Platform name */}
            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "rgba(255,255,255,0.9)",
                letterSpacing: 3,
                marginBottom: 16,
                textTransform: "uppercase",
              }}
            >
              🎭 Tebak Karakter Anime
            </div>

            {/* Username */}
            <div
              style={{
                fontSize: 56,
                fontWeight: 900,
                color: "#fff",
                textShadow: "0 2px 12px rgba(0,0,0,0.2)",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              {result.username}
            </div>

            {/* Rank */}
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: "rgba(255,255,255,0.85)",
                marginBottom: 48,
              }}
            >
              {rankData.emoji} {rankData.rank}
            </div>

            {/* Score */}
            <div
              style={{
                fontSize: 160,
                fontWeight: 900,
                color: "#fff",
                lineHeight: 1,
                textShadow: "0 4px 24px rgba(0,0,0,0.2)",
                marginBottom: 8,
              }}
            >
              {result.total_score}
            </div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "rgba(255,255,255,0.8)",
                marginBottom: 56,
              }}
            >
              poin
            </div>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                gap: 32,
                marginBottom: 56,
              }}
            >
              {[
                { label: "Benar", value: `${result.correct_count}/${result.total_soal}` },
                { label: "Streak Terbaik", value: `🔥 ${result.best_streak}` },
                { label: "Akurasi", value: `${accuracy}%` },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: "rgba(255,255,255,0.25)",
                    borderRadius: 24,
                    padding: "20px 32px",
                    textAlign: "center",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 40,
                      fontWeight: 900,
                      color: "#fff",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      color: "rgba(255,255,255,0.8)",
                      marginTop: 4,
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Date */}
            <div
              style={{
                fontSize: 22,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 16,
              }}
            >
              {finishedDate}
            </div>

            {/* Watermark */}
            <div
              style={{
                position: "absolute",
                bottom: 40,
                fontSize: 24,
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
                letterSpacing: 2,
              }}
            >
              seberapakamu.id
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
