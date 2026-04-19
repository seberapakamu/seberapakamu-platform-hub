"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBucinTier } from "@/lib/bucin-scoring";
import { createBrowserClient } from "@/lib/supabase";
import SharedResultLayout from "@/components/quiz/SharedResultLayout";
import ShareModule from "@/components/ShareModule";
import { BUCIN_CARD_TEMPLATES, BUCIN_QUOTES } from "@/lib/bucin-card";
import { generateBucinCaption } from "@/lib/bucinCaptionGenerator";

interface ResultData {
  hash: string;
  username: string;
  score: number;
  tier: number;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStoredResult(hash: string): ResultData | null {
  try {
    const raw = localStorage.getItem(`bucin_result_${hash}`);
    return raw ? (JSON.parse(raw) as ResultData) : null;
  } catch {
    return null;
  }
}

async function fetchResultFromSupabase(hash: string): Promise<ResultData | null> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("sessions")
      .select("hash, username, score, tier, finished_at, started_at")
      .eq("hash", hash)
      .single();

    if (error || !data) return null;

    return {
      hash: data.hash as string,
      username: data.username as string,
      score: Number(data.score ?? 0),
      tier: Number(data.tier ?? 1),
      createdAt: (data.finished_at ?? data.started_at) as string,
    };
  } catch {
    return null;
  }
}

// ─── Main Result Page ─────────────────────────────────────────────────────────

export default function BucinResultPage() {
  const params = useParams();
  const hash = params.hash as string;

  const [result, setResult] = useState<ResultData | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const stored = getStoredResult(hash);
    if (stored) {
      setResult(stored);
      const activeHash = localStorage.getItem("bucin_active_result_hash");
      setIsOwner(activeHash === hash);
    } else {
      fetchResultFromSupabase(hash).then((data) => {
        if (data) {
          setResult(data);
          setIsOwner(false);
        }
      });
    }
  }, [hash]);

  if (!hydrated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse" aria-hidden="true">💖</div>
          <p className="font-bold" style={{ color: "var(--color-text-muted)" }}>
            Memuat hasil...
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="text-6xl mb-4" aria-hidden="true">💔</div>
        <h1
          className="text-2xl font-black mb-2 text-center"
          style={{ color: "var(--color-text-bold)" }}
        >
          Hasil tidak ditemukan
        </h1>
        <p
          className="text-sm mb-6 text-center"
          style={{ color: "var(--color-text-muted)" }}
        >
          Link ini mungkin sudah kedaluwarsa atau tidak valid.
        </p>
        <Link
          href="/bucin"
          className="px-6 py-3 rounded-2xl font-black text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          🏠 Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const tierInfo = getBucinTier(result.score);

  return (
    <SharedResultLayout
      navTitle="💖 BucinQuiz"
      navHref="/bucin"
      isOwner={isOwner}
      username={result.username}
      score={result.score}
      tierInfo={tierInfo}
      createdAt={result.createdAt}
      retryUrl="/bucin/username"
      leaderboardUrl="/leaderboard"
      tryQuizUrl="/bucin/username"
      templates={BUCIN_CARD_TEMPLATES}
      watermarkText="💖 SeberapaBucin.id"
      quotes={BUCIN_QUOTES}
      downloadFilenamePrefix="bucin-result"
      shareComponent={
        <ShareModule
          hash={hash}
          tierInfo={tierInfo}
          username={result.username}
          score={result.score}
          basePath="/bucin/result/"
          generateCaptionFn={generateBucinCaption}
        />
      }
    />
  );
}
