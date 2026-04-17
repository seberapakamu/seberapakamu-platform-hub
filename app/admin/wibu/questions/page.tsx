"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuestionType = "ya_tidak" | "skala_1_5";
type Kategori = "Tonton" | "Koleksi" | "Bahasa" | "Komunitas" | "Genre";

interface OpsiJawaban {
  nilai: number;
  label: string;
}

interface Question {
  id: number;
  teks: string;
  tipe: QuestionType;
  kategori: Kategori;
  bobot: number;
  opsi_jawaban: OpsiJawaban[];
  aktif: boolean;
  created_at: string;
}

type FormData = {
  teks: string;
  tipe: QuestionType;
  kategori: Kategori;
  bobot: string;
  aktif: boolean;
  opsi_jawaban: OpsiJawaban[];
};

type FormErrors = Partial<Record<keyof FormData | "opsi_jawaban_items", string>>;

// ─── Constants ────────────────────────────────────────────────────────────────

const KATEGORI_OPTIONS: Kategori[] = ["Tonton", "Koleksi", "Bahasa", "Komunitas", "Genre"];

const DEFAULT_YA_TIDAK: OpsiJawaban[] = [
  { nilai: 0, label: "Tidak" },
  { nilai: 1, label: "Ya" },
];

const DEFAULT_SKALA: OpsiJawaban[] = [
  { nilai: 1, label: "" },
  { nilai: 2, label: "" },
  { nilai: 3, label: "" },
  { nilai: 4, label: "" },
  { nilai: 5, label: "" },
];

const EMPTY_FORM: FormData = {
  teks: "",
  tipe: "ya_tidak",
  kategori: "Tonton",
  bobot: "1.0",
  aktif: true,
  opsi_jawaban: DEFAULT_YA_TIDAK,
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validateForm(form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.teks.trim()) errors.teks = "Teks pertanyaan wajib diisi";
  if (!form.tipe) errors.tipe = "Tipe wajib dipilih";
  if (!form.kategori) errors.kategori = "Kategori wajib dipilih";
  const bobotNum = parseFloat(form.bobot);
  if (!form.bobot || isNaN(bobotNum) || bobotNum <= 0)
    errors.bobot = "Bobot wajib diisi dan harus berupa angka positif";
  const emptyOpsi = form.opsi_jawaban.some((o) => !o.label.trim());
  if (emptyOpsi) errors.opsi_jawaban_items = "Semua label opsi jawaban wajib diisi";
  return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p role="alert" className="mt-1 text-xs font-bold" style={{ color: "var(--color-error)" }}>
      ⚠️ {msg}
    </p>
  );
}

function inputStyle(hasError?: boolean) {
  return {
    backgroundColor: "var(--color-bg)",
    border: `2px solid ${hasError ? "var(--color-error)" : "var(--color-border)"}`,
    color: "var(--color-text-bold)",
  };
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  question,
  onConfirm,
  onCancel,
  loading,
}: {
  question: Question;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(90,90,122,0.4)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div
        className="w-full max-w-md rounded-3xl shadow-xl p-8"
        style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <div className="text-4xl text-center mb-4" aria-hidden="true">🗑️</div>
        <h2
          id="delete-modal-title"
          className="text-xl font-black text-center mb-3"
          style={{ color: "var(--color-text-bold)" }}
        >
          Hapus Soal?
        </h2>
        <p className="text-sm text-center mb-6" style={{ color: "var(--color-text-muted)" }}>
          Soal &ldquo;<strong>{question.teks.slice(0, 60)}{question.teks.length > 60 ? "…" : ""}</strong>&rdquo; akan dihapus permanen.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl font-bold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-bg)",
              border: "2px solid var(--color-border)",
              color: "var(--color-text-bold)",
            }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl font-black text-sm text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: "var(--color-error)" }}
          >
            {loading ? "Menghapus…" : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Question Form ────────────────────────────────────────────────────────────

function QuestionForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: FormData;
  onSave: (form: FormData) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const [errors, setErrors] = useState<FormErrors>({});

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleTipeChange(tipe: QuestionType) {
    setForm((prev) => ({
      ...prev,
      tipe,
      opsi_jawaban: tipe === "ya_tidak" ? DEFAULT_YA_TIDAK : DEFAULT_SKALA,
    }));
    setErrors((prev) => ({ ...prev, tipe: undefined, opsi_jawaban_items: undefined }));
  }

  function updateOpsiLabel(index: number, label: string) {
    setForm((prev) => {
      const updated = prev.opsi_jawaban.map((o, i) => (i === index ? { ...o, label } : o));
      return { ...prev, opsi_jawaban: updated };
    });
    if (errors.opsi_jawaban_items) setErrors((prev) => ({ ...prev, opsi_jawaban_items: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    await onSave(form);
  }

  const inputClass = "w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none transition-all";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Teks */}
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
          Teks Pertanyaan <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <textarea
          value={form.teks}
          onChange={(e) => setField("teks", e.target.value)}
          rows={3}
          placeholder="Tulis pertanyaan di sini…"
          aria-invalid={!!errors.teks}
          className={`${inputClass} resize-none`}
          style={inputStyle(!!errors.teks)}
        />
        <FieldError msg={errors.teks} />
      </div>

      {/* Tipe + Kategori */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
            Tipe <span style={{ color: "var(--color-error)" }}>*</span>
          </label>
          <select
            value={form.tipe}
            onChange={(e) => handleTipeChange(e.target.value as QuestionType)}
            aria-invalid={!!errors.tipe}
            className={inputClass}
            style={inputStyle(!!errors.tipe)}
          >
            <option value="ya_tidak">Ya / Tidak</option>
            <option value="skala_1_5">Skala 1–5</option>
          </select>
          <FieldError msg={errors.tipe} />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
            Kategori <span style={{ color: "var(--color-error)" }}>*</span>
          </label>
          <select
            value={form.kategori}
            onChange={(e) => setField("kategori", e.target.value as Kategori)}
            aria-invalid={!!errors.kategori}
            className={inputClass}
            style={inputStyle(!!errors.kategori)}
          >
            {KATEGORI_OPTIONS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <FieldError msg={errors.kategori} />
        </div>
      </div>

      {/* Bobot + Aktif */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
            Bobot <span style={{ color: "var(--color-error)" }}>*</span>
          </label>
          <input
            type="number"
            step="0.1"
            min="0.1"
            value={form.bobot}
            onChange={(e) => setField("bobot", e.target.value)}
            aria-invalid={!!errors.bobot}
            className={inputClass}
            style={inputStyle(!!errors.bobot)}
          />
          <FieldError msg={errors.bobot} />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input
            id="form-aktif"
            type="checkbox"
            checked={form.aktif}
            onChange={(e) => setField("aktif", e.target.checked)}
            className="w-5 h-5 rounded accent-pink-400"
          />
          <label htmlFor="form-aktif" className="text-sm font-bold" style={{ color: "var(--color-text-bold)" }}>
            Aktif
          </label>
        </div>
      </div>

      {/* Opsi Jawaban */}
      <div>
        <p className="text-sm font-bold mb-2" style={{ color: "var(--color-text-bold)" }}>
          Opsi Jawaban <span style={{ color: "var(--color-error)" }}>*</span>
        </p>
        <div className="space-y-2">
          {form.opsi_jawaban.map((opsi, i) => (
            <div key={i} className="flex items-center gap-3">
              <span
                className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-black flex-shrink-0"
                style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-text-bold)" }}
              >
                {opsi.nilai}
              </span>
              <input
                type="text"
                value={opsi.label}
                onChange={(e) => updateOpsiLabel(i, e.target.value)}
                placeholder={`Label untuk nilai ${opsi.nilai}`}
                className="flex-1 px-3 py-2 rounded-xl text-sm font-semibold outline-none transition-all"
                style={inputStyle(!!errors.opsi_jawaban_items && !opsi.label.trim())}
              />
            </div>
          ))}
        </div>
        <FieldError msg={errors.opsi_jawaban_items} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 py-3 rounded-2xl font-bold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "2px solid var(--color-border)",
            color: "var(--color-text-bold)",
          }}
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-3 rounded-2xl font-black text-sm text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </form>
  );
}

// ─── Timer Config ─────────────────────────────────────────────────────────────

function TimerConfig() {
  const [enabled, setEnabled] = useState(false);
  const [duration, setDuration] = useState("30");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/admin/questions")
      .then(() => {})
      .catch(() => {});
    // Load config from Supabase via a simple fetch
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          const timerEnabled = json.data.find((c: { key: string; value: string }) => c.key === "timer_enabled");
          const timerDuration = json.data.find((c: { key: string; value: string }) => c.key === "timer_duration_minutes");
          if (timerEnabled) setEnabled(timerEnabled.value === "true");
          if (timerDuration) setDuration(timerDuration.value);
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timer_enabled: String(enabled), timer_duration_minutes: duration }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!loaded) return null;

  return (
    <div
      className="rounded-3xl p-6 mb-6"
      style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <h2 className="text-base font-black mb-4" style={{ color: "var(--color-text-bold)" }}>
        ⏱️ Konfigurasi Timer Kuis
      </h2>
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="w-5 h-5 rounded accent-pink-400"
          />
          <span className="text-sm font-bold" style={{ color: "var(--color-text-bold)" }}>
            Aktifkan Timer
          </span>
        </label>
        {enabled && (
          <label className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
              Durasi (menit):
            </span>
            <input
              type="number"
              min="1"
              max="180"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-20 px-3 py-2 rounded-xl text-sm font-bold outline-none"
              style={{
                backgroundColor: "var(--color-bg)",
                border: "2px solid var(--color-border)",
                color: "var(--color-text-bold)",
              }}
            />
          </label>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-2xl text-sm font-black text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: saved ? "var(--color-success)" : "var(--color-accent)" }}
        >
          {saving ? "Menyimpan…" : saved ? "✓ Tersimpan" : "Simpan"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminQuestionsPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/admin/login");
    };
    void checkAuth();
  }, [supabase, router]);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/questions");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat soal");
      setQuestions(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  function openAdd() {
    setEditingQuestion(null);
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(q: Question) {
    setEditingQuestion(q);
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingQuestion(null);
    setFormError(null);
  }

  async function handleSave(form: FormData) {
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        teks: form.teks.trim(),
        tipe: form.tipe,
        kategori: form.kategori,
        bobot: parseFloat(form.bobot),
        opsi_jawaban: form.opsi_jawaban,
        aktif: form.aktif,
      };

      const url = editingQuestion
        ? `/api/admin/questions/${editingQuestion.id}`
        : "/api/admin/questions";
      const method = editingQuestion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        const msg = json.errors ? json.errors.join(", ") : json.error || "Gagal menyimpan";
        setFormError(msg);
        return;
      }
      closeForm();
      await fetchQuestions();
    } catch {
      setFormError("Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAktif(q: Question) {
    try {
      await fetch(`/api/admin/questions/${q.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aktif: !q.aktif }),
      });
      setQuestions((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, aktif: !item.aktif } : item))
      );
    } catch {
      // silent fail — UI will reflect old state
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/questions/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setQuestions((prev) => prev.filter((q) => q.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch {
      // silent fail
    } finally {
      setDeleting(false);
    }
  }

  const formInitial: FormData = editingQuestion
    ? {
        teks: editingQuestion.teks,
        tipe: editingQuestion.tipe,
        kategori: editingQuestion.kategori,
        bobot: String(editingQuestion.bobot),
        aktif: editingQuestion.aktif,
        opsi_jawaban: editingQuestion.opsi_jawaban,
      }
    : EMPTY_FORM;

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

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <Link
              href="/admin/wibu"
              className="text-sm font-bold mb-1 inline-block transition-opacity hover:opacity-70"
              style={{ color: "var(--color-text-muted)" }}
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--color-text-bold)" }}>
              📝 Manajemen Soal
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              {questions.length} soal terdaftar
            </p>
          </div>
          <button
            onClick={openAdd}
            className="px-6 py-3 rounded-2xl font-black text-sm text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            + Tambah Soal
          </button>
        </div>

        {/* Timer config */}
        <TimerConfig />

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="mb-4 px-4 py-3 rounded-2xl text-sm font-semibold"
            style={{
              backgroundColor: "var(--color-surface-alt)",
              border: "1px solid var(--color-error)",
              color: "var(--color-error)",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Form panel */}
        {showForm && (
          <div
            className="rounded-3xl shadow-lg p-6 sm:p-8 mb-6"
            style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <h2 className="text-lg font-black mb-5" style={{ color: "var(--color-text-bold)" }}>
              {editingQuestion ? "✏️ Edit Soal" : "➕ Tambah Soal Baru"}
            </h2>
            {formError && (
              <div
                role="alert"
                className="mb-4 px-4 py-3 rounded-2xl text-sm font-semibold"
                style={{
                  backgroundColor: "var(--color-surface-alt)",
                  border: "1px solid var(--color-error)",
                  color: "var(--color-error)",
                }}
              >
                ⚠️ {formError}
              </div>
            )}
            <QuestionForm
              initial={formInitial}
              onSave={handleSave}
              onCancel={closeForm}
              saving={saving}
            />
          </div>
        )}

        {/* Questions table */}
        <div
          className="rounded-3xl shadow-sm overflow-hidden"
          style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          {loading ? (
            <div className="py-16 text-center" style={{ color: "var(--color-text-muted)" }}>
              <div className="text-4xl mb-3 animate-pulse" aria-hidden="true">🌸</div>
              <p className="text-sm font-semibold">Memuat soal…</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="py-16 text-center" style={{ color: "var(--color-text-muted)" }}>
              <div className="text-4xl mb-3" aria-hidden="true">📭</div>
              <p className="text-sm font-semibold">Belum ada soal. Tambahkan yang pertama!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Daftar soal kuis">
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                    {["#", "Teks Pertanyaan", "Tipe", "Kategori", "Bobot", "Status", "Aksi"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-black text-xs uppercase tracking-wide"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, idx) => (
                    <tr
                      key={q.id}
                      style={{ borderBottom: "1px solid var(--color-border)" }}
                      className="transition-colors hover:bg-pink-50"
                    >
                      <td className="px-4 py-3 font-bold" style={{ color: "var(--color-text-muted)" }}>
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 max-w-xs" style={{ color: "var(--color-text-bold)" }}>
                        <span className="line-clamp-2">{q.teks}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className="px-2 py-1 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: q.tipe === "ya_tidak" ? "var(--color-info)" : "var(--color-warning)",
                            color: "var(--color-text-bold)",
                          }}
                        >
                          {q.tipe === "ya_tidak" ? "Ya/Tidak" : "Skala 1–5"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-semibold" style={{ color: "var(--color-text)" }}>
                        {q.kategori}
                      </td>
                      <td className="px-4 py-3 font-bold" style={{ color: "var(--color-text)" }}>
                        {q.bobot}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleAktif(q)}
                          aria-label={q.aktif ? "Nonaktifkan soal" : "Aktifkan soal"}
                          className="px-3 py-1 rounded-full text-xs font-black transition-transform hover:scale-105 active:scale-95"
                          style={{
                            backgroundColor: q.aktif ? "var(--color-success)" : "var(--color-surface-alt)",
                            color: q.aktif ? "#2d6a4f" : "var(--color-text-muted)",
                            border: `1px solid ${q.aktif ? "var(--color-success)" : "var(--color-border)"}`,
                          }}
                        >
                          {q.aktif ? "✓ Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(q)}
                            aria-label={`Edit soal: ${q.teks.slice(0, 30)}`}
                            className="px-3 py-1 rounded-xl text-xs font-bold transition-transform hover:scale-105 active:scale-95"
                            style={{
                              backgroundColor: "var(--color-surface-alt)",
                              color: "var(--color-accent)",
                              border: "1px solid var(--color-border)",
                            }}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(q)}
                            aria-label={`Hapus soal: ${q.teks.slice(0, 30)}`}
                            className="px-3 py-1 rounded-xl text-xs font-bold transition-transform hover:scale-105 active:scale-95"
                            style={{
                              backgroundColor: "var(--color-surface-alt)",
                              color: "var(--color-error)",
                              border: "1px solid var(--color-border)",
                            }}
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <DeleteModal
          question={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
