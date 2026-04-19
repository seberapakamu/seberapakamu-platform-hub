"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import quizData from "@/data/quiz_purity.json";
import { useQuizStore } from "@/lib/store/quizStore";
import type { Question } from "@/lib/store/quizStore";
import { calculateScore, getTier } from "@/lib/scoring";
import QuizTimer from "@/components/QuizTimer";
import { saveCompletedSession } from "@/lib/sessionTracking";

const questions = quizData.soal as Question[];

// ─── Resume Modal ────────────────────────────────────────────────────────────

function ResumeModal({
  username,
  answeredCount,
  total,
  onResume,
  onRestart,
}: {
  username: string;
  answeredCount: number;
  total: number;
  onResume: () => void;
  onRestart: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(90,90,122,0.4)", backdropFilter: "blur(4px)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="resume-title"
    >
      <div
        className="w-full max-w-sm rounded-3xl shadow-xl p-8 text-center"
        style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <div className="text-4xl mb-3" aria-hidden="true">💾</div>
        <h2
          id="resume-title"
          className="text-xl font-black mb-2"
          style={{ color: "var(--color-text-bold)" }}
        >
          Sesi Sebelumnya Ditemukan!
        </h2>
        <p className="text-sm mb-1" style={{ color: "var(--color-text-muted)" }}>
          Hei <strong style={{ color: "var(--color-primary)" }}>{username}</strong>!
        </p>
        <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
          Kamu sudah menjawab{" "}
          <strong style={{ color: "var(--color-accent)" }}>
            {answeredCount}/{total}
          </strong>{" "}
          pertanyaan. Lanjutkan?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-2xl font-black text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            ▶️ Lanjutkan
          </button>
          <button
            onClick={onRestart}
            className="w-full py-3 rounded-2xl font-bold transition-colors"
            style={{
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-border)",
            }}
          >
            🔄 Mulai Ulang
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Progress Bar (HP/Mana style) ────────────────────────────────────────────

function ProgressBar({ answered, total }: { answered: number; total: number }) {
  const pct = total > 0 ? Math.round((answered / total) * 100) : 0;
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
          ✨ Progress
        </span>
        <span className="text-xs font-black" style={{ color: "var(--color-accent)" }}>
          {answered}/{total} ({pct}%)
        </span>
      </div>
      <div
        className="w-full h-4 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--color-surface-alt)", border: "1px solid var(--color-border)" }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${answered} dari ${total} pertanyaan terjawab`}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, var(--color-primary), var(--color-accent))",
          }}
        />
      </div>
    </div>
  );
}

// ─── Ya/Tidak Question ───────────────────────────────────────────────────────

function YaTidakQuestion({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex gap-4 justify-center mt-6">
      {question.opsi_jawaban.map((opsi) => {
        const selected = value === opsi.nilai;
        return (
          <button
            key={opsi.nilai}
            onClick={() => onChange(opsi.nilai)}
            className="flex-1 max-w-[160px] py-4 rounded-2xl font-black text-base transition-all hover:scale-[1.03] active:scale-[0.97]"
            style={{
              backgroundColor: selected ? "var(--color-primary)" : "var(--color-bg)",
              color: selected ? "#fff" : "var(--color-text-bold)",
              border: `2px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
              boxShadow: selected ? "0 4px 14px rgba(255,154,158,0.4)" : "none",
            }}
            aria-pressed={selected}
          >
            {opsi.nilai === 1 ? "✅" : "❌"} {opsi.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Skala 1-5 Question ──────────────────────────────────────────────────────

function SkalaQuestion({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3">
      {question.opsi_jawaban.map((opsi) => {
        const selected = value === opsi.nilai;
        return (
          <button
            key={opsi.nilai}
            onClick={() => onChange(opsi.nilai)}
            className="w-full text-left px-5 py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.01] active:scale-[0.99]"
            style={{
              backgroundColor: selected ? "var(--color-secondary)" : "var(--color-bg)",
              color: selected ? "var(--color-text-bold)" : "var(--color-text)",
              border: `2px solid ${selected ? "var(--color-primary)" : "var(--color-border)"}`,
              boxShadow: selected ? "0 2px 10px rgba(255,154,158,0.25)" : "none",
            }}
            aria-pressed={selected}
          >
            <span
              className="inline-block w-7 h-7 rounded-full text-center text-xs font-black mr-3 leading-7"
              style={{
                backgroundColor: selected ? "var(--color-primary)" : "var(--color-border)",
                color: selected ? "#fff" : "var(--color-text-muted)",
              }}
              aria-hidden="true"
            >
              {opsi.nilai}
            </span>
            {opsi.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main Quiz Page ───────────────────────────────────────────────────────────

export default function QuizPage() {
  const router = useRouter();
  const store = useQuizStore();
  const [showResume, setShowResume] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer config fetched from /api/admin/config
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timerDuration, setTimerDuration] = useState(30);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((json) => {
        if (!json.data) return;
        const enabled = json.data.find((c: { key: string; value: string }) => c.key === "timer_enabled");
        const duration = json.data.find((c: { key: string; value: string }) => c.key === "timer_duration_minutes");
        if (enabled?.value === "true") setTimerEnabled(true);
        if (duration?.value) setTimerDuration(parseInt(duration.value, 10) || 30);
      })
      .catch(() => {});
  }, []);

  const hydrated = store._hydrated;

  useEffect(() => {
    if (!hydrated) return;

    const savedUsername = localStorage.getItem("wibu_username");

    if (store.hasPendingSession) {
      setShowResume(true);
      return;
    }

    if (!store.sessionId || store.finished) {
      if (!savedUsername) {
        router.replace("/wibu/username");
        return;
      }
      store.initSession(savedUsername, questions);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  function handleResume() {
    store.resumeSession();
    setShowResume(false);
  }

  function handleRestart() {
    const savedUsername =
      localStorage.getItem("wibu_username") || store.username;
    store.resetSession();
    store.initSession(savedUsername, questions);
    setShowResume(false);
  }

  function handleAnswer(nilai: number) {
    const q = store.questions[store.currentIndex];
    if (q) store.setAnswer(q.id, nilai);
  }

  async function handleFinish() {
    if (isSubmitting) return; // guard against double-click
    setIsSubmitting(true);

    const score = calculateScore(store.answers, store.questions);
    const tier = getTier(score);
    const finishedAt = new Date().toISOString();
    store.finishQuiz();

    const hash = (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
      ? crypto.randomUUID()
      : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        });

    const durationSeconds = store.startTime
      ? Math.round((Date.now() - store.startTime) / 1000)
      : 0;

    // Save to localStorage first so result page loads instantly
    const resultData = {
      hash,
      username: store.username,
      score,
      tier: tier.tier,
      createdAt: finishedAt,
    };
    localStorage.setItem(`wibu_result_${hash}`, JSON.stringify(resultData));
    localStorage.setItem("wibu_active_result_hash", hash);

    // Navigate immediately — DB save happens in background
    router.push(
      `/wibu/result/${hash}?score=${score}&username=${encodeURIComponent(store.username)}&tier=${tier.tier}`
    );

    // Fire-and-forget DB insert (no await needed, localStorage is source of truth for result page)
    saveCompletedSession({
      hash,
      username: store.username,
      score,
      tier: String(tier.tier),
      startedAt: store.startTime ? new Date(store.startTime).toISOString() : new Date().toISOString(),
      finishedAt,
      durationSeconds,
    });
  }

  // ── Loading state ──
  if (!hydrated || (!showResume && store.questions.length === 0)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce" aria-hidden="true">🌸</div>
          <p className="font-bold" style={{ color: "var(--color-text-muted)" }}>
            Memuat kuis...
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = store.questions[store.currentIndex];
  const answeredCount = Object.keys(store.answers).length;
  const totalQuestions = store.questions.length;
  const allAnswered = answeredCount === totalQuestions;
  const currentAnswer = currentQuestion
    ? store.answers[currentQuestion.id]
    : undefined;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Resume Modal */}
      {showResume && (
        <ResumeModal
          username={store.username}
          answeredCount={Object.keys(store.answers).length}
          total={store.questions.length}
          onResume={handleResume}
          onRestart={handleRestart}
        />
      )}

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
            className="text-xl font-black"
            style={{ color: "var(--color-primary)" }}
          >
            🌸 WibuQuiz
          </Link>
          <div className="flex items-center gap-3">
            {timerEnabled && (
              <QuizTimer
                durationMinutes={timerDuration}
                onTimeUp={handleFinish}
              />
            )}
            <span className="text-sm font-bold" style={{ color: "var(--color-text-muted)" }}>
              Hei, <span style={{ color: "var(--color-accent)" }}>{store.username}</span>!
            </span>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div
          className="w-full max-w-2xl rounded-3xl shadow-lg p-6 sm:p-8"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          {/* Progress */}
          <ProgressBar answered={answeredCount} total={totalQuestions} />

          {/* Question counter */}
          <div className="flex items-center justify-between mb-4">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                backgroundColor: "var(--color-surface-alt)",
                color: "var(--color-accent)",
              }}
            >
              {currentQuestion?.kategori}
            </span>
            <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>
              {store.currentIndex + 1} / {totalQuestions}
            </span>
          </div>

          {/* Question text */}
          {currentQuestion && (
            <>
              <h2
                className="text-lg sm:text-xl font-black leading-snug mb-2"
                style={{ color: "var(--color-text-bold)" }}
              >
                {currentQuestion.teks}
              </h2>

              {currentQuestion.tipe === "ya_tidak" ? (
                <YaTidakQuestion
                  question={currentQuestion}
                  value={currentAnswer}
                  onChange={handleAnswer}
                />
              ) : (
                <SkalaQuestion
                  question={currentQuestion}
                  value={currentAnswer}
                  onChange={handleAnswer}
                />
              )}
            </>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 gap-3">
            <button
              onClick={() => store.navigate(store.currentIndex - 1)}
              disabled={store.currentIndex === 0}
              className="px-5 py-3 rounded-2xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text-bold)",
                border: "1px solid var(--color-border)",
              }}
              aria-label="Pertanyaan sebelumnya"
            >
              ← Sebelumnya
            </button>

            {store.currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => store.navigate(store.currentIndex + 1)}
                className="px-5 py-3 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "#fff",
                }}
                aria-label="Pertanyaan berikutnya"
              >
                Berikutnya →
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={!allAnswered || isSubmitting}
                className="px-6 py-3 rounded-2xl font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: allAnswered && !isSubmitting
                    ? "var(--color-accent)"
                    : "var(--color-border)",
                  color: allAnswered && !isSubmitting ? "#fff" : "var(--color-text-muted)",
                }}
                aria-label={
                  isSubmitting
                    ? "Menyimpan hasil..."
                    : allAnswered
                    ? "Selesaikan kuis"
                    : `Masih ada ${totalQuestions - answeredCount} pertanyaan belum dijawab`
                }
                title={
                  !allAnswered
                    ? `Jawab ${totalQuestions - answeredCount} pertanyaan lagi untuk selesai`
                    : undefined
                }
              >
                {isSubmitting ? "⏳ Menyimpan..." : "🏁 Selesai!"}
              </button>
            )}
          </div>

          {/* Quick nav dots */}
          <div
            className="mt-6 flex flex-wrap gap-1.5 justify-center"
            role="navigation"
            aria-label="Navigasi cepat pertanyaan"
          >
            {store.questions.map((q, i) => {
              const isAnswered = store.answers[q.id] !== undefined;
              const isCurrent = i === store.currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => store.navigate(i)}
                  className="w-7 h-7 rounded-full text-xs font-bold transition-all hover:scale-110"
                  style={{
                    backgroundColor: isCurrent
                      ? "var(--color-primary)"
                      : isAnswered
                      ? "var(--color-success)"
                      : "var(--color-border)",
                    color: isCurrent || isAnswered ? "#fff" : "var(--color-text-muted)",
                    outline: isCurrent ? "2px solid var(--color-accent)" : "none",
                    outlineOffset: "2px",
                  }}
                  aria-label={`Pertanyaan ${i + 1}${isAnswered ? " (sudah dijawab)" : ""}`}
                  aria-current={isCurrent ? "true" : undefined}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {/* Finish hint */}
          {!allAnswered && (
            <p
              className="text-center text-xs mt-4"
              style={{ color: "var(--color-text-muted)" }}
            >
              Jawab semua pertanyaan untuk mengaktifkan tombol Selesai 🌸
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
