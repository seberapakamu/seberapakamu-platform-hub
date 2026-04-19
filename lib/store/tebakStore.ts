// lib/store/tebakStore.ts

import { create } from "zustand";
import type { AnimeCharacter, TebakConfig, TebakSession } from "../types/tebak";
import { calculateSoalScore } from "../tebakScoring";
import { generateUUID } from "../tebakUtils";

const STORAGE_KEY = "tebak_session";

function saveToStorage(session: TebakSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage errors (e.g. private browsing quota)
  }
}

function removeFromStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

interface TebakStore {
  session: TebakSession | null;

  initSession: (
    username: string,
    characters: AnimeCharacter[],
    config: TebakConfig
  ) => void;

  revealHint: (soalIndex: number) => void;

  submitAnswer: (
    soalIndex: number,
    answer: string,
    correct: boolean,
    config: TebakConfig
  ) => void;

  nextSoal: () => void;

  resumeSession: (session: TebakSession) => void;

  resetSession: () => void;

  finishSession: () => void;
}

export const useTebakStore = create<TebakStore>((set, get) => ({
  session: null,

  initSession(username, characters, config) {
    const count = Math.min(config.soal_count, characters.length);
    const selected = [...characters].sort(() => Math.random() - 0.5).slice(0, count);

    const session: TebakSession = {
      sessionId: generateUUID(),
      username,
      characters: selected,
      currentIndex: 0,
      hintsUsed: Array(count).fill(1), // siluet shown by default = 1 hint
      answers: Array(count).fill(null),
      scores: Array(count).fill(0),
      streak: 0,
      bestStreak: 0,
      totalScore: 0,
      startedAt: new Date().toISOString(),
      finished: false,
    };

    saveToStorage(session);
    set({ session });
  },

  revealHint(soalIndex) {
    const { session } = get();
    if (!session) return;

    const hintsUsed = [...session.hintsUsed];
    if (hintsUsed[soalIndex] >= 4) return; // max 4 hints

    hintsUsed[soalIndex] = hintsUsed[soalIndex] + 1;

    const updated: TebakSession = { ...session, hintsUsed };
    saveToStorage(updated);
    set({ session: updated });
  },

  submitAnswer(soalIndex, answer, correct, config) {
    const { session } = get();
    if (!session) return;

    const answers = [...session.answers];
    const scores = [...session.scores];
    const hintsUsed = session.hintsUsed[soalIndex];

    answers[soalIndex] = answer;
    const soalScore = calculateSoalScore(hintsUsed, correct, config);
    scores[soalIndex] = soalScore;

    let streak = correct ? session.streak + 1 : 0;
    const bestStreak = Math.max(session.bestStreak, streak);

    // Streak bonus: every streak_interval correct answers in a row
    let streakBonus = 0;
    if (correct && streak % config.streak_interval === 0) {
      streakBonus = config.streak_bonus;
    }

    const totalScore = session.totalScore + soalScore + streakBonus;

    const updated: TebakSession = {
      ...session,
      answers,
      scores,
      streak,
      bestStreak,
      totalScore,
    };

    saveToStorage(updated);
    set({ session: updated });
  },

  nextSoal() {
    const { session } = get();
    if (!session) return;

    const updated: TebakSession = {
      ...session,
      currentIndex: session.currentIndex + 1,
    };

    saveToStorage(updated);
    set({ session: updated });
  },

  resumeSession(session) {
    set({ session });
  },

  resetSession() {
    removeFromStorage();
    set({ session: null });
  },

  finishSession() {
    const { session } = get();
    if (!session) return;

    const updated: TebakSession = { ...session, finished: true };
    saveToStorage(updated);
    set({ session: updated });
  },
}));
