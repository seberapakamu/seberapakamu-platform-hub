"use client";

import { useState, useCallback } from "react";
import ResultCard, { CARD_TEMPLATES } from "./ResultCard";
import { drawResultCard } from "@/lib/drawResultCard";
import type { TierInfo } from "@/lib/scoring";
import type { ResultCardProps } from "./ResultCard";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ResultCardGeneratorProps {
  username: string;
  score: number;
  tierInfo: TierInfo;
  createdAt: string;
  watermarkText?: string;
  quotes?: string[];
  templates?: typeof CARD_TEMPLATES;
  downloadFilenamePrefix?: string;
}

type Format = "1080x1080" | "1080x1920";

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResultCardGenerator({
  username,
  score,
  tierInfo,
  createdAt,
  watermarkText,
  quotes,
  templates = CARD_TEMPLATES,
  downloadFilenamePrefix = "wibu-result",
}: ResultCardGeneratorProps) {
  const [templateIndex, setTemplateIndex] = useState<number>(() =>
    (username.length + Math.round(score)) % templates.length
  );
  const [format, setFormat] = useState<Format>("1080x1080");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = useCallback(async () => {
    setIsGenerating(true);
    setError(null);

    // Defer canvas work to next task to avoid blocking the main thread
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    try {
      const [w, h] = format === "1080x1080" ? [1080, 1080] : [1080, 1920];
      const canvas = document.createElement("canvas");

      drawResultCard(canvas, {
        username,
        score,
        tierInfo,
        createdAt,
        templateIndex,
        width: w,
        height: h,
        watermarkText,
        quotes,
        template: templates[templateIndex]
      });

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            setError("Gagal membuat gambar. Coba lagi.");
            setIsGenerating(false);
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${downloadFilenamePrefix}-${username}-${format}.png`;
          a.click();
          URL.revokeObjectURL(url);
          setIsGenerating(false);
        },
        "image/png"
      );
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat generate gambar.");
      setIsGenerating(false);
    }
  }, [format, username, score, tierInfo, createdAt, templateIndex]);

  const cycleTemplate = () => {
    setTemplateIndex((prev) => (prev + 1) % templates.length);
  };

  const cardProps: ResultCardProps = {
    username,
    score,
    tierInfo,
    createdAt,
    templateIndex,
    watermarkText,
    quotes,
    templates
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Preview — pure DOM card, no canvas needed for display */}
      <div
        className="overflow-hidden rounded-3xl shadow-lg"
        style={{ maxWidth: "360px", width: "100%" }}
        aria-label="Preview kartu hasil"
      >
        <div
          style={{
            width: "540px",
            transformOrigin: "top left",
            transform: "scale(0.667)",
            marginBottom: "-180px",
          }}
        >
          <ResultCard {...cardProps} />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={cycleTemplate}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold transition-transform hover:scale-[1.04] active:scale-[0.97]"
          style={{
            backgroundColor: "var(--color-surface-alt)",
            color: "var(--color-text-bold)",
            border: "1px solid var(--color-border)",
          }}
          aria-label="Ganti template kartu"
        >
          🎨 {templates[templateIndex].name}
        </button>

        <div
          className="flex rounded-2xl overflow-hidden"
          style={{ border: "1px solid var(--color-border)" }}
          role="group"
          aria-label="Pilih format gambar"
        >
          {(["1080x1080", "1080x1920"] as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className="px-3 py-2 text-xs font-bold transition-colors"
              style={{
                backgroundColor:
                  format === f ? "var(--color-primary)" : "var(--color-surface)",
                color: format === f ? "#fff" : "var(--color-text-muted)",
              }}
              aria-pressed={format === f}
            >
              {f === "1080x1080" ? "⬛ 1:1" : "📱 9:16"}
            </button>
          ))}
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="w-full max-w-xs py-3 rounded-2xl font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: "var(--color-primary)" }}
        aria-label="Download kartu hasil sebagai gambar"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin" aria-hidden="true">⏳</span> Generating...
          </span>
        ) : (
          "⬇️ Download Kartu"
        )}
      </button>

      {error && (
        <p
          className="text-sm text-center"
          style={{ color: "var(--color-error)" }}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
