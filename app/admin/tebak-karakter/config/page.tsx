"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { validateConfig } from "@/lib/tebakAdminValidation";
import type { ConfigForm, ConfigErrors } from "@/lib/tebakAdminValidation";

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS: ConfigForm = {
  soal_count: "10",
  score_hint_1: "100",
  score_hint_2: "75",
  score_hint_3: "50",
  score_hint_4: "25",
  streak_bonus: "50",
  streak_interval: "3",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p role="alert" className="mt-1 text-xs font-bold" style={{ color: "var(--color-error)" }}>
      ⚠️ {msg}
    </p>
  );
}

function inputStyle(hasError?: boolean): React.CSSProperties {
  return {
    backgroundColor: "var(--color-bg)",
    border: `2px solid ${hasError ? "var(--color-error)" : "var(--color-border)"}`,
    color: "var(--color-text-bold)",
  };
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TebakConfigPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [form, setForm] = useState<ConfigForm>(DEFAULTS);
  const [errors, setErrors] = useState<ConfigErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/admin/login");
    };
    void checkAuth();
  }, [supabase, router]);

  // Load current config
  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const { data, error } = await supabase
          .from("quiz_config")
          .select("key, value")
          .like("key", "tebak_%");
        if (error) throw new Error(error.message);

        if (data && data.length > 0) {
          const map: Record<string, string> = {};
          for (const row of data) {
            map[row.key] = row.value;
          }
          setForm({
            soal_count: map["tebak_soal_count"] ?? DEFAULTS.soal_count,
            score_hint_1: map["tebak_score_hint_1"] ?? DEFAULTS.score_hint_1,
            score_hint_2: map["tebak_score_hint_2"] ?? DEFAULTS.score_hint_2,
            score_hint_3: map["tebak_score_hint_3"] ?? DEFAULTS.score_hint_3,
            score_hint_4: map["tebak_score_hint_4"] ?? DEFAULTS.score_hint_4,
            streak_bonus: map["tebak_streak_bonus"] ?? DEFAULTS.streak_bonus,
            streak_interval: map["tebak_streak_interval"] ?? DEFAULTS.streak_interval,
          });
        }
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Gagal memuat konfigurasi");
      } finally {
        setLoading(false);
      }
    };
    void loadConfig();
  }, [supabase]);

  function setField(key: keyof ConfigForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateConfig(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSuccess(false);

    try {
      const upserts = [
        { key: "tebak_soal_count", value: form.soal_count.trim() },
        { key: "tebak_score_hint_1", value: form.score_hint_1.trim() },
        { key: "tebak_score_hint_2", value: form.score_hint_2.trim() },
        { key: "tebak_score_hint_3", value: form.score_hint_3.trim() },
        { key: "tebak_score_hint_4", value: form.score_hint_4.trim() },
        { key: "tebak_streak_bonus", value: form.streak_bonus.trim() },
        { key: "tebak_streak_interval", value: form.streak_interval.trim() },
      ];

      const { error } = await supabase
        .from("quiz_config")
        .upsert(upserts, { onConflict: "key" });

      if (error) throw new Error(error.message);
      setSuccess(true);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Gagal menyimpan konfigurasi");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none transition-all";

  return (
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      {/* Decorative blobs */}
      <div
        className="fixed -top-20 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: "var(--color-primary)" }}
        aria-hidden="true"
      />
      <div
        className="fixed -bottom-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ backgroundColor: "var(--color-accent)" }}
        aria-hidden="true"
      />

      <div className="relative max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--color-text-bold)" }}>
            ⚙️ Konfigurasi Kuis
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Pengaturan ini berlaku pada sesi kuis berikutnya
          </p>
        </div>

        {/* Load error */}
        {loadError && (
          <div
            role="alert"
            className="mb-4 px-4 py-3 rounded-2xl text-sm font-semibold"
            style={{
              backgroundColor: "var(--color-surface-alt)",
              border: "1px solid var(--color-error)",
              color: "var(--color-error)",
            }}
          >
            ⚠️ {loadError}
          </div>
        )}

        {/* Form card */}
        <div
          className="rounded-3xl shadow-lg p-6 sm:p-8"
          style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          {loading ? (
            <div className="py-12 text-center" style={{ color: "var(--color-text-muted)" }}>
              <div className="text-4xl mb-3 animate-pulse" aria-hidden="true">⚙️</div>
              <p className="text-sm font-semibold">Memuat konfigurasi…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-6">

              {/* Section: Soal */}
              <section>
                <h2 className="text-base font-black mb-4" style={{ color: "var(--color-text-bold)" }}>
                  📋 Jumlah Soal
                </h2>
                <div>
                  <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
                    Jumlah Soal per Sesi{" "}
                    <span className="font-normal text-xs" style={{ color: "var(--color-text-muted)" }}>
                      (5–20)
                    </span>
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={20}
                    value={form.soal_count}
                    onChange={(e) => setField("soal_count", e.target.value)}
                    aria-invalid={!!errors.soal_count}
                    className={inputClass}
                    style={inputStyle(!!errors.soal_count)}
                  />
                  <FieldError msg={errors.soal_count} />
                </div>
              </section>

              <hr style={{ borderColor: "var(--color-border)" }} />

              {/* Section: Poin per Petunjuk */}
              <section>
                <h2 className="text-base font-black mb-1" style={{ color: "var(--color-text-bold)" }}>
                  🎯 Poin per Petunjuk
                </h2>
                <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
                  Poin yang diperoleh jika menjawab benar dengan jumlah petunjuk tertentu. Harus menurun: petunjuk 1 &gt; 2 &gt; 3 &gt; 4.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {(["score_hint_1", "score_hint_2", "score_hint_3", "score_hint_4"] as const).map((key, i) => (
                    <div key={key}>
                      <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
                        Petunjuk {i + 1}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={form[key]}
                        onChange={(e) => setField(key, e.target.value)}
                        aria-invalid={!!errors[key]}
                        className={inputClass}
                        style={inputStyle(!!errors[key])}
                      />
                      <FieldError msg={errors[key]} />
                    </div>
                  ))}
                </div>
              </section>

              <hr style={{ borderColor: "var(--color-border)" }} />

              {/* Section: Streak */}
              <section>
                <h2 className="text-base font-black mb-1" style={{ color: "var(--color-text-bold)" }}>
                  🔥 Bonus Streak
                </h2>
                <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>
                  Bonus poin yang diberikan setiap N jawaban benar berturut-turut.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
                      Poin Bonus Streak
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.streak_bonus}
                      onChange={(e) => setField("streak_bonus", e.target.value)}
                      aria-invalid={!!errors.streak_bonus}
                      className={inputClass}
                      style={inputStyle(!!errors.streak_bonus)}
                    />
                    <FieldError msg={errors.streak_bonus} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
                      Interval Streak{" "}
                      <span className="font-normal text-xs" style={{ color: "var(--color-text-muted)" }}>
                        (1–10)
                      </span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={form.streak_interval}
                      onChange={(e) => setField("streak_interval", e.target.value)}
                      aria-invalid={!!errors.streak_interval}
                      className={inputClass}
                      style={inputStyle(!!errors.streak_interval)}
                    />
                    <FieldError msg={errors.streak_interval} />
                  </div>
                </div>
              </section>

              {/* Save error */}
              {saveError && (
                <div
                  role="alert"
                  className="px-4 py-3 rounded-2xl text-sm font-semibold"
                  style={{
                    backgroundColor: "var(--color-surface-alt)",
                    border: "1px solid var(--color-error)",
                    color: "var(--color-error)",
                  }}
                >
                  ⚠️ {saveError}
                </div>
              )}

              {/* Success message */}
              {success && (
                <div
                  role="status"
                  className="px-4 py-3 rounded-2xl text-sm font-semibold"
                  style={{
                    backgroundColor: "var(--color-surface-alt)",
                    border: "1px solid var(--color-success)",
                    color: "var(--color-success)",
                  }}
                >
                  ✅ Konfigurasi berhasil disimpan! Berlaku pada sesi kuis berikutnya.
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-2xl font-black text-sm text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {saving ? "Menyimpan…" : "💾 Simpan Konfigurasi"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
