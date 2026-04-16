"use client";

import { useEffect, useRef, useState } from "react";

interface QuizTimerProps {
  /** Duration in minutes */
  durationMinutes: number;
  /** Called when the countdown reaches zero */
  onTimeUp: () => void;
}

/**
 * Countdown timer component for the quiz.
 * Only rendered when the admin has enabled the timer feature.
 */
export default function QuizTimer({ durationMinutes, onTimeUp }: QuizTimerProps) {
  const totalSeconds = durationMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  useEffect(() => {
    if (secondsLeft <= 0) {
      setTimeout(() => onTimeUpRef.current(), 0);
      return;
    }
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          // Defer to avoid calling parent setState during render
          setTimeout(() => onTimeUpRef.current(), 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  // Only run once on mount — secondsLeft changes are internal
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const pct = (secondsLeft / totalSeconds) * 100;

  const isWarning = secondsLeft <= 60;
  const isDanger = secondsLeft <= 30;

  const color = isDanger
    ? "var(--color-error)"
    : isWarning
    ? "#E07B00"
    : "var(--color-accent-dark)";

  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-sm"
      style={{
        backgroundColor: "var(--color-surface-alt)",
        border: `2px solid ${color}`,
        color,
      }}
      role="timer"
      aria-live="polite"
      aria-label={`Waktu tersisa: ${minutes} menit ${seconds} detik`}
    >
      <span aria-hidden="true">{isDanger ? "🚨" : isWarning ? "⏰" : "⏱️"}</span>
      <span>
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      </span>
      {/* Mini progress bar */}
      <div
        className="w-16 h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: "var(--color-border)" }}
        aria-hidden="true"
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
