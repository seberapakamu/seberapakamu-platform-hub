import { create } from "zustand";
import { persist } from "zustand/middleware";

/** crypto.randomUUID() requires HTTPS. This fallback works on HTTP too (e.g. local network dev). */
function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  // Fallback: RFC 4122 v4 UUID using Math.random
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export type QuestionType = "ya_tidak" | "skala_1_5";
export type Kategori = "Tonton" | "Koleksi" | "Bahasa" | "Komunitas" | "Genre";

export interface OpsiJawaban {
  nilai: number;
  label: string;
}

export interface Question {
  id: number;
  teks: string;
  tipe: QuestionType;
  kategori: Kategori;
  bobot: number;
  opsi_jawaban: OpsiJawaban[];
}

export interface QuizSession {
  sessionId: string;
  username: string;
  questions: Question[];
  currentIndex: number;
  answers: Record<number, number>; // questionId -> nilai jawaban
  startTime: number; // timestamp ms
  finished: boolean;
}

interface QuizStore extends QuizSession {
  /** True when a persisted session exists and hasn't been resolved yet */
  hasPendingSession: boolean;
  /** True once Zustand persist has finished rehydrating from localStorage */
  _hydrated: boolean;
  initSession: (username: string, questions: Question[]) => void;
  setAnswer: (questionId: number, nilai: number) => void;
  navigate: (index: number) => void;
  /** Mark the pending session as resolved (user chose to continue) */
  resumeSession: () => void;
  /** Clear all session data and start fresh */
  resetSession: () => void;
  finishQuiz: () => void;
}

const EMPTY_SESSION: QuizSession = {
  sessionId: "",
  username: "",
  questions: [],
  currentIndex: 0,
  answers: {},
  startTime: 0,
  finished: false,
};

export const useQuizStore = create<QuizStore & { _hydrated: boolean }>()(
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
      // persist middleware auto-saves to localStorage on every set call

      navigate: (index) =>
        set((state) => ({
          currentIndex: Math.max(0, Math.min(index, state.questions.length - 1)),
        })),

      resumeSession: () => {
        // State is already loaded from localStorage via persist middleware.
        // Just clear the pending flag so the modal is dismissed.
        set({ hasPendingSession: false });
      },

      resetSession: () =>
        set({ ...EMPTY_SESSION, hasPendingSession: false }),

      finishQuiz: () => set({ finished: true }),
    }),
    {
      name: "wibu-quiz-session",
      // After rehydration, flag if there's a real in-progress session
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
