export interface AnimeCharacter {
  id: number;
  nama: string;
  asal_anime: string;
  /** URL gambar asli (full) */
  image_url: string;
  /** Kolom lama — fallback untuk data yang belum dimigrate */
  siluet_url?: string;
  /** Crop area dalam persen (0–100) */
  crop_x: number;
  crop_y: number;
  crop_width: number;
  crop_height: number;
  kutipan: string;
  kekuatan: string;
  deskripsi: string;
  aktif: boolean;
}

export interface TebakConfig {
  soal_count: number;
  score_hint_1: number;
  score_hint_2: number;
  score_hint_3: number;
  score_hint_4: number;
  streak_bonus: number;
  streak_interval: number;
}

export interface TebakSession {
  sessionId: string;
  username: string;
  characters: AnimeCharacter[];
  currentIndex: number;
  hintsUsed: number[];
  answers: (string | null)[];
  scores: number[];
  streak: number;
  bestStreak: number;
  totalScore: number;
  startedAt: string;
  finished: boolean;
}

export interface SoalResult {
  character: AnimeCharacter;
  hints_used: number;
  correct: boolean;
  score: number;
}

export interface TebakSessionResult {
  hash: string;
  username: string;
  total_score: number;
  correct_count: number;
  total_soal: number;
  best_streak: number;
  rank: TebakRank;
  soal_results: SoalResult[];
  finished_at: string;
}

export type TebakRank =
  | "Pemula Wibu"
  | "Wibu Biasa"
  | "Wibu Sejati"
  | "Wibu Veteran"
  | "Sepuh Wibu";
