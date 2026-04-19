// lib/tebakAdminValidation.ts
// Validation logic for admin quiz configuration

export type ConfigForm = {
  soal_count: string;
  score_hint_1: string;
  score_hint_2: string;
  score_hint_3: string;
  score_hint_4: string;
  streak_bonus: string;
  streak_interval: string;
};

export type ConfigErrors = Partial<Record<keyof ConfigForm, string>>;

/**
 * Validates the admin quiz configuration form.
 * Returns an object with field-level error messages.
 * An empty object means the form is valid.
 */
export function validateConfig(form: ConfigForm): ConfigErrors {
  const errors: ConfigErrors = {};

  const soalCount = parseInt(form.soal_count, 10);
  if (!form.soal_count.trim() || isNaN(soalCount) || !Number.isInteger(soalCount)) {
    errors.soal_count = "Jumlah soal harus berupa bilangan bulat";
  } else if (soalCount < 5 || soalCount > 20) {
    errors.soal_count = "Jumlah soal harus antara 5 dan 20";
  }

  const h1 = parseInt(form.score_hint_1, 10);
  const h2 = parseInt(form.score_hint_2, 10);
  const h3 = parseInt(form.score_hint_3, 10);
  const h4 = parseInt(form.score_hint_4, 10);

  if (!form.score_hint_1.trim() || isNaN(h1) || h1 <= 0) {
    errors.score_hint_1 = "Poin petunjuk 1 harus bilangan bulat positif";
  }
  if (!form.score_hint_2.trim() || isNaN(h2) || h2 <= 0) {
    errors.score_hint_2 = "Poin petunjuk 2 harus bilangan bulat positif";
  }
  if (!form.score_hint_3.trim() || isNaN(h3) || h3 <= 0) {
    errors.score_hint_3 = "Poin petunjuk 3 harus bilangan bulat positif";
  }
  if (!form.score_hint_4.trim() || isNaN(h4) || h4 <= 0) {
    errors.score_hint_4 = "Poin petunjuk 4 harus bilangan bulat positif";
  }

  // Hierarchy: hint_1 > hint_2 > hint_3 > hint_4
  if (!errors.score_hint_1 && !errors.score_hint_2 && h1 <= h2) {
    errors.score_hint_1 = "Poin petunjuk 1 harus lebih besar dari petunjuk 2";
  }
  if (!errors.score_hint_2 && !errors.score_hint_3 && h2 <= h3) {
    errors.score_hint_2 = "Poin petunjuk 2 harus lebih besar dari petunjuk 3";
  }
  if (!errors.score_hint_3 && !errors.score_hint_4 && h3 <= h4) {
    errors.score_hint_3 = "Poin petunjuk 3 harus lebih besar dari petunjuk 4";
  }

  const streakBonus = parseInt(form.streak_bonus, 10);
  if (!form.streak_bonus.trim() || isNaN(streakBonus) || streakBonus <= 0) {
    errors.streak_bonus = "Bonus streak harus bilangan bulat positif";
  }

  const streakInterval = parseInt(form.streak_interval, 10);
  if (!form.streak_interval.trim() || isNaN(streakInterval) || !Number.isInteger(streakInterval)) {
    errors.streak_interval = "Interval streak harus berupa bilangan bulat";
  } else if (streakInterval < 1 || streakInterval > 10) {
    errors.streak_interval = "Interval streak harus antara 1 dan 10";
  }

  return errors;
}

/**
 * Validates only the soal_count field.
 * Returns true if the value is a valid integer in range [5, 20].
 */
export function isSoalCountValid(value: number): boolean {
  return Number.isInteger(value) && value >= 5 && value <= 20;
}
