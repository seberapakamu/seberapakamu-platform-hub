import * as fc from "fast-check";
import { validateUsername } from "../lib/tebakUtils";

// Feature: anime-character-quiz, Property 1: Validasi panjang username

describe("Property 1: Validasi Panjang Username", () => {
  /**
   * Validates: Requirements 2.2
   * String dengan panjang 1–30 karakter yang tidak mengandung karakter berbahaya harus valid.
   */
  it("username panjang 1–30 karakter (aman) harus valid", () => {
    fc.assert(
      fc.property(
        fc.string({
          unit: fc.constantFrom(..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-".split("")),
          minLength: 1,
          maxLength: 30,
        }),
        (username) => {
          return validateUsername(username).valid === true;
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Validates: Requirements 2.3
   * String kosong (panjang 0) harus ditolak.
   */
  it("username kosong (panjang 0) harus ditolak", () => {
    fc.assert(
      fc.property(
        fc.constant(""),
        (username) => {
          return validateUsername(username).valid === false;
        }
      ),
      { numRuns: 1 }
    );
  });

  /**
   * Validates: Requirements 2.2
   * String dengan panjang lebih dari 30 karakter harus ditolak.
   */
  it("username panjang >30 karakter harus ditolak", () => {
    fc.assert(
      fc.property(
        fc.string({
          unit: fc.constantFrom(..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("")),
          minLength: 31,
          maxLength: 100,
        }),
        (username) => {
          return validateUsername(username).valid === false;
        }
      ),
      { numRuns: 20 }
    );
  });
});
