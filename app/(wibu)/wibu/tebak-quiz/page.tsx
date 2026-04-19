"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTebakStore } from "@/lib/store/tebakStore";
import { createBrowserClient } from "@/lib/supabase";
import { generateUUID } from "@/lib/tebakUtils";
import type { AnimeCharacter, TebakConfig, TebakSession, SoalResult } from "@/lib/types/tebak";
import TebakProgressBar from "@/components/TebakProgressBar";
import TebakStreakDisplay from "@/components/TebakStreakDisplay";
import TebakScoreDisplay from "@/components/TebakScoreDisplay";
import TebakHintReveal from "@/components/TebakHintReveal";
import TebakAnswerInput from "@/components/TebakAnswerInput";
import TebakSoalResult from "@/components/TebakSoalResult";
import ResumeModal from "@/components/ResumeModal";

const DEFAULT_CONFIG: TebakConfig = {
  soal_count: 10,
  score_hint_1: 100,
  score_hint_2: 75,
  score_hint_3: 50,
  score_hint_4: 25,
  streak_bonus: 50,
  streak_interval: 3,
};

const STORAGE_KEY = "tebak_session";
const USERNAME_KEY = "tebak_username";

function loadSessionFromStorage(): TebakSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TebakSession;
    if (
      !parsed.sessionId ||
      !parsed.username ||
      !Array.isArray(parsed.characters) ||
      parsed.characters.length === 0
    ) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

async function fetchCharactersAndConfig(): Promise<{
  characters: AnimeCharacter[];
  config: TebakConfig;
}> {
  const supabase = createBrowserClient();

  const [{ data: chars, error: charsError }, { data: configRows, error: configError }] =
    await Promise.all([
      supabase
        .from("anime_characters")
        .select("id, nama, asal_anime, image_url, crop_x, crop_y, crop_width, crop_height, kutipan, kekuatan, deskripsi, aktif")
        .eq("aktif", true),
      supabase
        .from("quiz_config")
        .select("key, value")
        .like("key", "tebak_%"),
    ]);

  if (charsError) throw new Error(charsError.message);
  if (configError) throw new Error(configError.message);

  const characters = (chars ?? []) as AnimeCharacter[];

  const configMap: Record<string, string> = {};
  for (const row of configRows ?? []) {
    configMap[row.key as string] = row.value as string;
  }

  const config: TebakConfig = {
    soal_count: parseInt(configMap["tebak_soal_count"] ?? "10", 10) || DEFAULT_CONFIG.soal_count,
    score_hint_1: parseInt(configMap["tebak_score_hint_1"] ?? "100", 10) || DEFAULT_CONFIG.score_hint_1,
    score_hint_2: parseInt(configMap["tebak_score_hint_2"] ?? "75", 10) || DEFAULT_CONFIG.score_hint_2,
    score_hint_3: parseInt(configMap["tebak_score_hint_3"] ?? "50", 10) || DEFAULT_CONFIG.score_hint_3,
    score_hint_4: parseInt(configMap["tebak_score_hint_4"] ?? "25", 10) || DEFAULT_CONFIG.score_hint_4,
    streak_bonus: parseInt(configMap["tebak_streak_bonus"] ?? "50", 10) || DEFAULT_CONFIG.streak_bonus,
    streak_interval: parseInt(configMap["tebak_streak_interval"] ?? "3", 10) || DEFAULT_CONFIG.streak_interval,
  };

  return { characters, config };
}

async function saveTebakSession(params: {
  hash: string;
  username: string;
  totalScore: number;
  correctCount: number;
  bestStreak: number;
  rank: string;
  soalSummary: Array<{ character_id: number; correct: boolean; hints_used: number; score: number }>;
  startedAt: string;
  finishedAt: string;
}) {
  try {
    const supabase = createBrowserClient();
    await supabase.from("sessions").insert({
      hash: params.hash,
      username: params.username,
      score: params.totalScore,
      tier: params.rank,
      started_at: params.startedAt,
      finished_at: params.finishedAt,
      duration_seconds: Math.round(
        (new Date(params.finishedAt).getTime() - new Date(params.startedAt).getTime()) / 1000
      ),
      share_clicked: false,
      quiz_type: "tebak-karakter",
      metadata: {
        correct_count: params.correctCount,
        best_streak: params.bestStreak,
        rank: params.rank,
        soal_summary: params.soalSummary,
      },
    });
  } catch {
    // Fire-and-forget
  }
}

type PageState = "loading" | "resume" | "quiz" | "soal-result" | "error";

export default function TebakQuizPage() {
  const router = useRouter();
  const store = useTebakStore();

  const [pageState, setPageState] = useState<PageState>("loading");
  const [config, setConfig] = useState<TebakConfig>(DEFAULT_CONFIG);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [pendingSession, setPendingSession] = useState<TebakSession | null>(null);
  const [soalResult, setSoalResult] = useState<SoalResult | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const initNewSession = useCallback(
    async (username: string) => {
      setPageState("loading");
      setFetchError(null);
      try {
        const { characters, config: fetchedConfig } = await fetchCharactersAndConfig();
        if (characters.length === 0) {
          setFetchError("Belum ada karakter yang tersedia. Coba lagi nanti.");
          setPageState("error");
          return;
        }
        setConfig(fetchedConfig);
        store.initSession(username, characters, fetchedConfig);
        setPageState("quiz");
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Gagal memuat data kuis. Coba lagi?"
        );
        setPageState("error");
      }
    },
    [store]
  );

  useEffect(() => {
    const username = localStorage.getItem(USERNAME_KEY);
    if (!username) {
      router.replace("/wibu/tebak-username");
      return;
    }

    const saved = loadSessionFromStorage();

    if (saved && !saved.finished) {
      setPendingSession(saved);
      setPageState("resume");
      return;
    }

    initNewSession(username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleResume() {
    if (!pendingSession) return;
    store.resumeSession(pendingSession);
    setPageState("quiz");
    setPendingSession(null);
  }

  function handleStartNew() {
    const username = localStorage.getItem(USERNAME_KEY) ?? pendingSession?.username ?? "";
    store.resetSession();
    setPendingSession(null);
    initNewSession(username);
  }

  function handleRequestHint() {
    const { session } = store;
    if (!session) return;
    store.revealHint(session.currentIndex);
  }

  function handleSubmitAnswer(answer: string) {
    const { session } = store;
    if (!session) return;

    const idx = session.currentIndex;
    const character = session.characters[idx];
    if (!character) return;

    const correct =
      answer.trim().toLowerCase() === character.nama.trim().toLowerCase();

    const hintsUsed = session.hintsUsed[idx];
    const soalScore = correct
      ? [config.score_hint_1, config.score_hint_2, config.score_hint_3, config.score_hint_4][hintsUsed - 1] ?? 0
      : 0;

    store.submitAnswer(idx, answer, correct, config);

    const result: SoalResult = {
      character,
      hints_used: hintsUsed,
      correct,
      score: soalScore,
    };

    setSoalResult(result);
    setPageState("soal-result");
  }

  function handleNextSoal() {
    const { session } = store;
    if (!session) return;

    const isLast = session.currentIndex >= session.characters.length - 1;

    if (isLast) {
      handleFinish();
      return;
    }

    store.nextSoal();
    setSoalResult(null);
    setPageState("quiz");
  }

  async function handleFinish() {
    if (isFinishing) return;
    setIsFinishing(true);

    const { session } = store;
    if (!session) return;

    store.finishSession();

    const hash = generateUUID();
    const finishedAt = new Date().toISOString();

    const soalSummary = session.characters.map((char, i) => ({
      character_id: char.id,
      correct: session.answers[i] !== null && session.answers[i]?.trim().toLowerCase() === char.nama.trim().toLowerCase(),
      hints_used: session.hintsUsed[i],
      score: session.scores[i],
    }));

    const correctCount = soalSummary.filter((s) => s.correct).length;

    const { getTebakRank } = await import("@/lib/tebakScoring");
    const rankData = getTebakRank(session.totalScore);

    const resultData = {
      hash,
      username: session.username,
      totalScore: session.totalScore,
      correctCount,
      totalSoal: session.characters.length,
      bestStreak: session.bestStreak,
      rank: rankData.rank,
      rankEmoji: rankData.emoji,
      soalResults: session.characters.map((char, i) => ({
        character: char,
        hints_used: session.hintsUsed[i],
        correct: soalSummary[i].correct,
        score: session.scores[i],
      })),
      finishedAt,
      startedAt: session.startedAt,
    };
    localStorage.setItem(`tebak_result_${hash}`, JSON.stringify(resultData));

    router.push(`/wibu/tebak-result/${hash}`);

    saveTebakSession({
      hash,
      username: session.username,
      totalScore: session.totalScore,
      correctCount,
      bestStreak: session.bestStreak,
      rank: rankData.rank,
      soalSummary,
      startedAt: session.startedAt,
      finishedAt,
    });
  }

  if (pageState === "loading") {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce" aria-hidden="true">🎭</div>
          <p className="font-bold" style={{ color: "var(--color-text-muted)" }}>
            Memuat kuis...
          </p>
        </div>
      </div>
    );
  }

  if (pageState === "error") {
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
            Gagal Memuat Kuis
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
            {fetchError ?? "Terjadi kesalahan. Coba lagi?"}
          </p>
          <button
            onClick={() => {
              const username = localStorage.getItem(USERNAME_KEY) ?? "";
              initNewSession(username);
            }}
            className="w-full py-3 rounded-2xl font-black text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            🔄 Coba Lagi
          </button>
          <Link
            href="/wibu"
            className="block mt-3 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const { session } = store;

  if (pageState === "resume" && pendingSession) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <ResumeModal
          username={pendingSession.username}
          currentSoal={pendingSession.currentIndex + 1}
          totalSoal={pendingSession.characters.length}
          onResume={handleResume}
          onStartNew={handleStartNew}
        />
      </div>
    );
  }

  if (!session) return null;

  const currentIdx = session.currentIndex;
  const currentCharacter = session.characters[currentIdx];
  // Hanya masukkan karakter yang sedang ditebak agar tidak membocorkan (spoil) jawaban soal lainnya
  const allCharacterNames = currentCharacter ? [currentCharacter.nama] : [];
  const hintsRevealed = session.hintsUsed[currentIdx] ?? 1;
  const isLastSoal = currentIdx >= session.characters.length - 1;
  const alreadyAnswered = session.answers[currentIdx] !== null;

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
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href="/wibu"
            className="text-lg font-black"
            style={{ color: "var(--color-primary)" }}
          >
            🎭 Tebak Karakter
          </Link>
          <div className="flex items-center gap-2">
            <TebakStreakDisplay
              streak={session.streak}
              bestStreak={session.bestStreak}
            />
            <TebakScoreDisplay totalScore={session.totalScore} />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-4 py-6">
        <div
          className="w-full max-w-2xl rounded-3xl shadow-lg p-5 sm:p-7"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div className="mb-5">
            <TebakProgressBar
              current={currentIdx + 1}
              total={session.characters.length}
            />
          </div>

          {pageState === "soal-result" && soalResult ? (
            <TebakSoalResult
              result={soalResult}
              onNext={handleNextSoal}
              isLast={isLastSoal}
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: "var(--color-surface-alt)",
                    color: "var(--color-accent)",
                  }}
                >
                  🎭 Tebak Karakter
                </span>
                <span
                  className="text-xs font-bold"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Soal {currentIdx + 1} / {session.characters.length}
                </span>
              </div>

              {currentCharacter && (
                <div className="mb-5">
                  <TebakHintReveal
                    character={currentCharacter}
                    hintsRevealed={hintsRevealed}
                    onRequestHint={handleRequestHint}
                    maxHints={4}
                  />
                </div>
              )}

              {currentCharacter && (
                <TebakAnswerInput
                  allCharacterNames={allCharacterNames}
                  onSubmit={handleSubmitAnswer}
                  disabled={alreadyAnswered || isFinishing}
                />
              )}

              {alreadyAnswered && (
                <p
                  className="text-center text-xs mt-3"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  Jawaban sudah dikirim. Lihat hasilnya di atas! 🌸
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
