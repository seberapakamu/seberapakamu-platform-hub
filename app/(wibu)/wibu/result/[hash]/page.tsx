"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getTier } from "@/lib/scoring";
import { createBrowserClient } from "@/lib/supabase";
import SharedResultLayout from "@/components/quiz/SharedResultLayout";
import ShareModule from "@/components/ShareModule";

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
    const raw = localStorage.getItem(`wibu_result_${hash}`);
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

export default function ResultPage() {
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
      const activeHash = localStorage.getItem("wibu_active_result_hash");
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
          <div className="text-4xl mb-3 animate-bounce" aria-hidden="true">🌸</div>
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
        <div className="text-6xl mb-4" aria-hidden="true">😢</div>
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
          href="/wibu"
          className="px-6 py-3 rounded-2xl font-black text-white"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          🏠 Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const tierInfo = getTier(result.score);

  return (
    <SharedResultLayout
      navTitle="🌸 WibuQuiz"
      navHref="/wibu"
      isOwner={isOwner}
      username={result.username}
      score={result.score}
      tierInfo={tierInfo}
      createdAt={result.createdAt}
      retryUrl="/wibu/username"
      leaderboardUrl="/leaderboard"
      tryQuizUrl="/wibu/username"
      shareComponent={
        <ShareModule
          hash={hash}
          tierInfo={tierInfo}
          username={result.username}
          score={result.score}
          basePath="/wibu/result/"
        />
      }
    />
  );
}
