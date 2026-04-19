// Feature: anime-character-quiz, Property 7: Persistensi Sesi Round-Trip

import * as fc from "fast-check";
import type { AnimeCharacter, TebakSession } from "../lib/types/tebak";

/**
 * Validates: Requirements 5.1, 5.3
 *
 * Untuk semua state sesi kuis yang valid (termasuk jawaban, skor, nomor soal, streak),
 * menyimpan state ke localStorage dan kemudian membacanya kembali harus menghasilkan
 * state yang identik dengan state asli.
 */

const STORAGE_KEY = "tebak_session";

// Arbitrary untuk AnimeCharacter
const arbAnimeCharacter: fc.Arbitrary<AnimeCharacter> = fc.record({
  id: fc.integer({ min: 1, max: 9999 }),
  nama: fc.string({ minLength: 1, maxLength: 50 }),
  asal_anime: fc.string({ minLength: 1, maxLength: 50 }),
  siluet_url: fc.webUrl(),
  kutipan: fc.string({ minLength: 1, maxLength: 200 }),
  kekuatan: fc.string({ minLength: 1, maxLength: 100 }),
  deskripsi: fc.string({ minLength: 0, maxLength: 200 }),
  aktif: fc.boolean(),
});

// Arbitrary untuk TebakSession dengan N soal (1–10)
const arbTebakSession: fc.Arbitrary<TebakSession> = fc
  .integer({ min: 1, max: 10 })
  .chain((n) =>
    fc.record({
      sessionId: fc.uuid(),
      username: fc.string({ minLength: 1, maxLength: 30 }),
      characters: fc.array(arbAnimeCharacter, { minLength: n, maxLength: n }),
      currentIndex: fc.integer({ min: 0, max: n - 1 }),
      hintsUsed: fc.array(fc.integer({ min: 1, max: 4 }), {
        minLength: n,
        maxLength: n,
      }),
      answers: fc.array(
        fc.oneof(fc.string({ minLength: 1, maxLength: 50 }), fc.constant(null)),
        { minLength: n, maxLength: n }
      ),
      scores: fc.array(fc.integer({ min: 0, max: 100 }), {
        minLength: n,
        maxLength: n,
      }),
      streak: fc.integer({ min: 0, max: n }),
      bestStreak: fc.integer({ min: 0, max: n }),
      totalScore: fc.integer({ min: 0, max: 1000 }),
      startedAt: fc
        .integer({ min: 0, max: 4102444800000 })
        .map((ms) => new Date(ms).toISOString()),
      finished: fc.boolean(),
    })
  );

describe("Property 7: Persistensi Sesi Round-Trip", () => {
  /**
   * Validates: Requirements 5.1
   * JSON.stringify → JSON.parse harus menghasilkan state yang identik.
   */
  it("JSON round-trip menghasilkan state yang identik", () => {
    fc.assert(
      fc.property(arbTebakSession, (session) => {
        const serialized = JSON.stringify(session);
        const parsed = JSON.parse(serialized) as TebakSession;
        expect(parsed).toEqual(session);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 5.1, 5.3
   * localStorage setItem → getItem → JSON.parse harus menghasilkan state yang identik.
   */
  it("localStorage round-trip menghasilkan state yang identik", () => {
    fc.assert(
      fc.property(arbTebakSession, (session) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        const raw = localStorage.getItem(STORAGE_KEY);
        expect(raw).not.toBeNull();
        const parsed = JSON.parse(raw!) as TebakSession;
        expect(parsed).toEqual(session);
        localStorage.removeItem(STORAGE_KEY);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Validates: Requirements 5.3
   * Setelah overwrite dengan sesi baru, hanya sesi terbaru yang tersimpan.
   */
  it("overwrite sesi di localStorage hanya menyimpan sesi terbaru", () => {
    fc.assert(
      fc.property(arbTebakSession, arbTebakSession, (session1, session2) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session1));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session2));
        const raw = localStorage.getItem(STORAGE_KEY);
        expect(raw).not.toBeNull();
        const parsed = JSON.parse(raw!) as TebakSession;
        expect(parsed).toEqual(session2);
        localStorage.removeItem(STORAGE_KEY);
      }),
      { numRuns: 100 }
    );
  });
});
