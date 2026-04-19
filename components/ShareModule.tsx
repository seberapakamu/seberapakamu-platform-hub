"use client";

import { useState, useCallback } from "react";
import type { TierInfo } from "@/lib/scoring";
import {
  generateCaption,
  getRandomStyle,
  type CaptionStyle,
} from "@/lib/captionGenerator";
import { recordShareClicked, getStoredSupabaseSessionId } from "@/lib/sessionTracking";

interface ShareModuleProps {
  hash: string;
  tierInfo: TierInfo;
  username: string;
  score: number;
  basePath?: string;
  generateCaptionFn?: (tierInfo: TierInfo, style: CaptionStyle) => string;
}

async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for browsers without Clipboard API
  const el = document.createElement("textarea");
  el.value = text;
  el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

function buildShareUrl(basePath: string, hash: string, score: number, username: string, tier: number): string {
  if (typeof window === "undefined") return `${basePath}${hash}`;
  const params = new URLSearchParams({
    score: String(score),
    username,
    tier: String(tier),
  });
  return `${window.location.origin}${basePath}${hash}?${params.toString()}`;
}

const PLATFORM_BUTTONS = [
  {
    key: "twitter",
    label: "X (Twitter)",
    emoji: "🐦",
    color: "#1DA1F2",
    buildHref: (caption: string, url: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    emoji: "💬",
    color: "#25D366",
    buildHref: (caption: string, url: string) =>
      `https://wa.me/?text=${encodeURIComponent(`${caption}\n${url}`)}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    emoji: "✈️",
    color: "#0088CC",
    buildHref: (caption: string, url: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(caption)}`,
  },
  {
    key: "instagram",
    label: "Instagram",
    emoji: "📸",
    color: "#E1306C",
    // Instagram doesn't support direct share links; copy caption + url instead
    buildHref: null as null | ((caption: string, url: string) => string),
  },
] as const;

export default function ShareModule({ hash, tierInfo, username, score, basePath = "/wibu/result/", generateCaptionFn = generateCaption }: ShareModuleProps) {
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>(() => getRandomStyle());
  const [caption, setCaption] = useState<string>(() =>
    generateCaptionFn(tierInfo, getRandomStyle())
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [instagramCopied, setInstagramCopied] = useState(false);

  const shareUrl = buildShareUrl(basePath, hash, score, username, tierInfo.tier);

  function trackShare() {
    const sessionId = getStoredSupabaseSessionId();
    if (sessionId) recordShareClicked(sessionId);
  }

  const handleRandomCaption = useCallback(() => {
    const styles: CaptionStyle[] = ["roast", "praise", "dramatis", "meme"];
    // Pick a different style than current
    const others = styles.filter((s) => s !== captionStyle);
    const newStyle = others[Math.floor(Math.random() * others.length)];
    setCaptionStyle(newStyle);
    setCaption(generateCaptionFn(tierInfo, newStyle));
  }, [captionStyle, tierInfo, generateCaptionFn]);

  const handleCopyLink = useCallback(async () => {
    await copyToClipboard(shareUrl);
    trackShare();
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }, [shareUrl]);

  const handleCopyCaption = useCallback(async () => {
    await copyToClipboard(caption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  }, [caption]);

  const handleInstagramShare = useCallback(async () => {
    // Instagram has no web share URL; copy caption + link to clipboard
    await copyToClipboard(`${caption}\n${shareUrl}`);
    trackShare();
    setInstagramCopied(true);
    setTimeout(() => setInstagramCopied(false), 3000);
  }, [caption, shareUrl]);

  // Use Web Share API if available
  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Aku dapat tier "${tierInfo.title}"!`,
          text: caption,
          url: shareUrl,
        });
        trackShare();
      } catch {
        // User cancelled or error — silently ignore
      }
    }
  }, [caption, shareUrl, tierInfo.title]);

  const supportsWebShare = typeof navigator !== "undefined" && !!navigator.share;

  const styleLabels: Record<CaptionStyle, string> = {
    roast: "🔥 Roast",
    praise: "✨ Pujian",
    dramatis: "🎭 Dramatis",
    meme: "😂 Meme",
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Caption box */}
      <div
        className="rounded-2xl p-4"
        style={{
          backgroundColor: "var(--color-surface-alt)",
          border: "1px solid var(--color-border)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-xs font-bold uppercase tracking-wide"
            style={{ color: "var(--color-text-muted)" }}
          >
            Caption — {styleLabels[captionStyle]}
          </span>
          <button
            onClick={handleCopyCaption}
            className="text-xs font-bold px-2 py-1 rounded-xl transition-colors"
            style={{
              backgroundColor: copiedCaption ? "var(--color-success)" : "var(--color-border)",
              color: copiedCaption ? "#fff" : "var(--color-text-bold)",
            }}
            aria-label="Salin caption"
          >
            {copiedCaption ? "✅ Tersalin" : "📋 Salin"}
          </button>
        </div>
        <p
          className="text-sm leading-relaxed whitespace-pre-line"
          style={{ color: "var(--color-text)" }}
        >
          {caption}
        </p>
      </div>

      {/* Randomize caption button */}
      <button
        onClick={handleRandomCaption}
        className="w-full py-2.5 rounded-2xl font-bold text-sm transition-transform hover:scale-[1.02] active:scale-[0.97]"
        style={{
          backgroundColor: "var(--color-secondary)",
          color: "var(--color-text-bold)",
          border: "1px solid var(--color-border)",
        }}
        aria-label="Acak ulang caption"
      >
        🎲 Acak Ulang Caption
      </button>

      {/* Share platform buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {PLATFORM_BUTTONS.map((p) => {
          if (p.key === "instagram") {
            return (
              <button
                key="instagram"
                onClick={handleInstagramShare}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold text-white transition-transform hover:scale-[1.04] active:scale-[0.97]"
                style={{ backgroundColor: instagramCopied ? "#84FAB0" : p.color }}
                aria-label="Share ke Instagram (salin caption)"
              >
                <span aria-hidden="true">{p.emoji}</span>
                {instagramCopied ? "Tersalin!" : p.label}
              </button>
            );
          }

          const href = p.buildHref!(caption, shareUrl);
          return (
            <a
              key={p.key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={trackShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold text-white transition-transform hover:scale-[1.04] active:scale-[0.97]"
              style={{ backgroundColor: p.color }}
              aria-label={`Share ke ${p.label}`}
            >
              <span aria-hidden="true">{p.emoji}</span> {p.label}
            </a>
          );
        })}

        {/* Copy link button (fallback always shown) */}
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold transition-all hover:scale-[1.04] active:scale-[0.97]"
          style={{
            backgroundColor: copiedLink ? "var(--color-success)" : "var(--color-surface-alt)",
            color: copiedLink ? "#fff" : "var(--color-text-bold)",
            border: "1px solid var(--color-border)",
          }}
          aria-label="Salin link hasil"
        >
          {copiedLink ? "✅ Tersalin!" : "🔗 Salin Link"}
        </button>

        {/* Native Web Share API button */}
        {supportsWebShare && (
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-bold text-white transition-transform hover:scale-[1.04] active:scale-[0.97]"
            style={{ backgroundColor: "var(--color-accent)" }}
            aria-label="Bagikan via sistem"
          >
            📤 Bagikan
          </button>
        )}
      </div>
    </div>
  );
}
