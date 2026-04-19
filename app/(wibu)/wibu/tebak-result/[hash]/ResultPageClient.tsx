"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { TebakSessionResult } from "@/lib/types/tebak";
import { TEBAK_RANKS } from "@/lib/tebakScoring";
import { createBrowserClient } from "@/lib/supabase";
import TebakResultCard from "@/components/TebakResultCard";
import TebakShareButtons from "@/components/TebakShareButtons";

interface StoredResult {
  hash: string;
  username: string;
  totalScore: number;
  correctCount: number;
  totalSoal: number;
  bestStreak: number;
  rank: string;
  rankEmoji: string;
  soalResults: Array<{
    character: {
      id: number;
      nama: string;
      asal_anime: string;
      image_url: string;
      crop_x: number;
      crop_y: number;
      crop_width: number;
      crop_height: number;
      kutipan: string;
      kekuatan: string;
      deskripsi: string;
      aktif: boolean;
    };
    hints_used: number;
    correct: boolean;
    score: number;
  }>;
  finishedAt: string;
  startedAt: string;
}

interface ResultPageClientProps {
  hash: string;
}

export default function ResultPageClient({ hash }: ResultPageClientProps) {
  const router = useRouter();
  const [result, setResult] = useState<TebakSessionResult | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`tebak_result_${hash}`);
      if (raw) {
        const stored: StoredResult = JSON.parse(raw);
        const rankData = TEBAK_RANKS.find((r) => r.rank === stored.rank) ?? TEBAK_RANKS[0];
        const sessionResult: TebakSessionResult = {
          hash: stored.hash,
          username: stored.username,
          total_score: stored.totalScore,
          correct_count: stored.correctCount,
          total_soal: stored.totalSoal,
          best_streak: stored.bestStreak,
          rank: rankData.rank,
          soal_results: stored.soalResults,
          finished_at: stored.finishedAt,
        };
        setResult(sessionResult);
        setIsOwner(true);
        setLoading(false);
        return;
      }
    } catch {
      // Ignore parse errors
    }

    async function fetchFromSupabase() {
      try {
        const supabase = createBrowserClient();
        const { data: sessionData } = await supabase
          .from("sessions")
          .select("hash, username, score, tier, metadata, started_at, finished_at")
          .eq("hash", hash)
          .eq("quiz_type", "tebak-karakter")
          .single();

        if (!sessionData) {
          setLoading(false);
          return;
        }

        const meta = sessionData.metadata as {
          correct_count: number;
          best_streak: number;
          rank: string;
          soal_summary: Array<{ character_id: number; correct: boolean; hints_used: number; score: number }>;
        };

        const characterIds = meta.soal_summary.map((s) => s.character_id);
        const { data: chars } = await supabase
          .from("anime_characters")
          .select("id, nama, asal_anime, image_url, crop_x, crop_y, crop_width, crop_height, kutipan, kekuatan, deskripsi, aktif")
          .in("id", characterIds);

        const charMap = new Map((chars ?? []).map((c) => [c.id, c]));
        const rankData = TEBAK_RANKS.find((r) => r.rank === sessionData.tier) ?? TEBAK_RANKS[0];

        const sessionResult: TebakSessionResult = {
          hash: sessionData.hash,
          username: sessionData.username,
          total_score: sessionData.score,
          correct_count: meta.correct_count,
          total_soal: meta.soal_summary.length,
          best_streak: meta.best_streak,
          rank: rankData.rank,
          soal_results: meta.soal_summary.map((s) => ({
            character: charMap.get(s.character_id) ?? {
              id: s.character_id,
              nama: "???",
              asal_anime: "???",
              image_url: "",
              crop_x: 0,
              crop_y: 0,
              crop_width: 100,
              crop_height: 100,
              kutipan: "",
              kekuatan: "",
              deskripsi: "",
              aktif: false,
            },
            hints_used: s.hints_used,
            correct: s.correct,
            score: s.score,
          })),
          finished_at: sessionData.finished_at,
        };

        setResult(sessionResult);
        setIsOwner(false);
      } catch {
        // Supabase failed — show not found
      } finally {
        setLoading(false);
      }
    }

    fetchFromSupabase();
  }, [hash]);

  function handleCopyLink() {
    const url = `https://seberapakamu.id/wibu/tebak-result/${hash}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce" aria-hidden="true">🎭</div>
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
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div
          className="w-full max-w-sm rounded-3xl p-8 text-center shadow-lg"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="text-5xl mb-4" aria-hidden="true">😢</div>
          <h2
            className="text-xl font-black mb-2"
            style={{ color: "var(--color-text-bold)" }}
          >
            Hasil Tidak Ditemukan
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
            Hasil kuis ini tidak tersedia. Mungkin sudah kedaluwarsa atau link tidak valid.
          </p>
          <Link
            href="/wibu"
            className="block w-full py-3 rounded-2xl font-black text-white text-center transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            🎭 Main Sekarang
          </Link>
        </div>
      </div>
    );
  }

  const rankData = TEBAK_RANKS.find((r) => r.rank === result.rank) ?? TEBAK_RANKS[0];
  const finishedDate = new Date(result.finished_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Navbar */}
      <nav
        className="sticky top-0 z-40 shadow-sm"
        style={{
          backgroundColor: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/wibu"
            className="text-lg font-black"
            style={{ color: "var(--color-primary)" }}
          >
            🎭 Tebak Karakter
          </Link>
          <span className="text-sm font-bold" style={{ color: "var(--color-text-muted)" }}>
            {finishedDate}
          </span>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-4 py-8 gap-6">
        {/* Header result */}
        <div
          className="w-full max-w-2xl rounded-3xl shadow-lg p-6 sm:p-8 text-center"
          style={{
            background: "linear-gradient(135deg, #FFF0F5 0%, #F5E6FF 100%)",
            border: "1px solid var(--color-border)",
          }}
        >
          {!isOwner && (
            <div
              className="mb-4 px-4 py-2 rounded-2xl text-sm font-semibold"
              style={{
                backgroundColor: "rgba(255,154,158,0.15)",
                color: "var(--color-primary)",
                border: "1px solid rgba(255,154,158,0.3)",
              }}
            >
              👀 Kamu sedang melihat hasil orang lain (read-only)
            </div>
          )}

          <div className="text-5xl mb-2" aria-hidden="true">{rankData.emoji}</div>
          <h1
            className="text-2xl font-black mb-1"
            style={{ color: "var(--color-text-bold)" }}
          >
            {result.username}
          </h1>
          <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
            {rankData.rank}
          </p>

          <div
            className="text-6xl font-black mb-2"
            style={{ color: "var(--color-primary)" }}
          >
            {result.total_score}
          </div>
          <p className="text-sm font-semibold mb-6" style={{ color: "var(--color-text-muted)" }}>
            poin
          </p>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div
              className="rounded-2xl p-3"
              style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
            >
              <div className="text-2xl font-black" style={{ color: "var(--color-accent)" }}>
                {result.correct_count}/{result.total_soal}
              </div>
              <div className="text-xs font-semibold mt-1" style={{ color: "var(--color-text-muted)" }}>
                Benar
              </div>
            </div>
            <div
              className="rounded-2xl p-3"
              style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
            >
              <div className="text-2xl font-black" style={{ color: "var(--color-accent)" }}>
                🔥 {result.best_streak}
              </div>
              <div className="text-xs font-semibold mt-1" style={{ color: "var(--color-text-muted)" }}>
                Streak Terbaik
              </div>
            </div>
            <div
              className="rounded-2xl p-3"
              style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
            >
              <div className="text-2xl font-black" style={{ color: "var(--color-accent)" }}>
                {rankData.emoji}
              </div>
              <div className="text-xs font-semibold mt-1" style={{ color: "var(--color-text-muted)" }}>
                {rankData.rank}
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/wibu/tebak-username")}
                className="flex-1 py-3 rounded-2xl font-black text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                🎮 Main Lagi
              </button>
              <button
                onClick={handleCopyLink}
                className="flex-1 py-3 rounded-2xl font-black transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: copied ? "var(--color-success)" : "var(--color-surface)",
                  color: copied ? "#fff" : "var(--color-text-bold)",
                  border: "1px solid var(--color-border)",
                }}
              >
                {copied ? "✅ Tersalin!" : "🔗 Tantang Teman"}
              </button>
            </div>
          )}
        </div>

        {/* Per-soal summary */}
        <div
          className="w-full max-w-2xl rounded-3xl shadow-lg overflow-hidden"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <h2
              className="text-base font-black"
              style={{ color: "var(--color-text-bold)" }}
            >
              📋 Ringkasan Per Soal
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: "var(--color-surface-alt)" }}>
                  <th className="text-left px-4 py-3 font-bold" style={{ color: "var(--color-text-muted)" }}>#</th>
                  <th className="text-left px-4 py-3 font-bold" style={{ color: "var(--color-text-muted)" }}>Karakter</th>
                  <th className="text-center px-4 py-3 font-bold" style={{ color: "var(--color-text-muted)" }}>Hasil</th>
                  <th className="text-center px-4 py-3 font-bold" style={{ color: "var(--color-text-muted)" }}>Petunjuk</th>
                  <th className="text-right px-4 py-3 font-bold" style={{ color: "var(--color-text-muted)" }}>Skor</th>
                </tr>
              </thead>
              <tbody>
                {result.soal_results.map((soal, i) => (
                  <tr
                    key={i}
                    className="border-t"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <td className="px-4 py-3 font-bold" style={{ color: "var(--color-text-muted)" }}>{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold" style={{ color: "var(--color-text-bold)" }}>{soal.character.nama}</div>
                      <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>{soal.character.asal_anime}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-lg">{soal.correct ? "✓" : "✗"}</td>
                    <td className="px-4 py-3 text-center font-semibold" style={{ color: "var(--color-text-muted)" }}>{soal.hints_used}/4</td>
                    <td className="px-4 py-3 text-right font-black" style={{ color: soal.score > 0 ? "var(--color-accent)" : "var(--color-text-muted)" }}>{soal.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isOwner && (
          <div className="w-full max-w-2xl">
            <TebakResultCard result={result} />
          </div>
        )}

        <div className="w-full max-w-2xl">
          <TebakShareButtons result={result} />
        </div>
      </main>
    </div>
  );
}
