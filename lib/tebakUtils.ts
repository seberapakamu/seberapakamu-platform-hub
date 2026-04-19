// lib/tebakUtils.ts

const DANGEROUS_CHARS = /[&"'`\x00]/;
const HTML_TAG_PATTERN = /<[^>]*>/;
const SCRIPT_INJECTION_PATTERN =
  /javascript\s*:|on\w+\s*=|expression\s*\(|vbscript\s*:/i;

/**
 * Validasi username sebelum memulai kuis tebak karakter.
 * Returns { valid: true } jika valid, atau { valid: false, error: string } jika tidak.
 */
export function validateUsername(input: string): { valid: boolean; error?: string } {
  if (!input || input.length === 0) {
    return { valid: false, error: "Username wajib diisi" };
  }

  if (input.length > 30) {
    return { valid: false, error: "Username maksimal 30 karakter" };
  }

  if (
    HTML_TAG_PATTERN.test(input) ||
    SCRIPT_INJECTION_PATTERN.test(input) ||
    DANGEROUS_CHARS.test(input)
  ) {
    return { valid: false, error: "Username mengandung karakter yang tidak diizinkan" };
  }

  return { valid: true };
}

/**
 * crypto.randomUUID() requires HTTPS in modern browsers.
 * This fallback generates a pseudo-random UUID v4 for HTTP (e.g. local network IP).
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
