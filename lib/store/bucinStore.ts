import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BucinQuestion } from "../bucin-questions";

/** crypto.randomUUID() requires HTTPS. This fallback works on HTTP too. */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export interface BucinQuizSession {
  sessionId: string;
  username: string;
  questions: BucinQuestion[];
  currentIndex: number;
  answers: Record<number, number>; // questionId -> nilai jawaban
  startTime: number; // timestamp ms
  finished: boolean;
}

interface BucinStore extends BucinQuizSession {
  hasPendingSession: boolean;
  _hydrated: boolean;
  initSession: (username: string, questions: BucinQuestion[]) => void;
  setAnswer: (questionId: number, nilai: number) => void;
  navigate: (index: number) => void;
  resumeSession: () => void;
  resetSession: () => void;
  finishQuiz: () => void;
}

const EMPTY_SESSION: BucinQuizSession = {
  sessionId: "",
  username: "",
  questions: [],
  currentIndex: 0,
  answers: {},
  startTime: 0,
  finished: false,
};

export const useBucinStore = create<BucinStore & { _hydrated: boolean }>()(
  persist(
    (set, get) => ({
      ...EMPTY_SESSION,
      hasPendingSession: false,
      _hydrated: false,

      initSession: (username, questions) =>
        set({
          sessionId: generateUUID(),
          username,
          questions,
          currentIndex: 0,
          answers: {},
          startTime: Date.now(),
          finished: false,
          hasPendingSession: false,
        }),

      setAnswer: (questionId, nilai) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: nilai },
        })),

      navigate: (index) =>
        set((state) => ({
          currentIndex: Math.max(0, Math.min(index, state.questions.length - 1)),
        })),

      resumeSession: () => set({ hasPendingSession: false }),

      resetSession: () => set({ ...EMPTY_SESSION, hasPendingSession: false }),

      finishQuiz: () => set({ finished: true }),
    }),
    {
      name: "bucin-quiz-session",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hydrated = true;
          if (state.sessionId && !state.finished && state.questions.length > 0) {
            state.hasPendingSession = true;
          }
        }
      },
    }
  )
);
