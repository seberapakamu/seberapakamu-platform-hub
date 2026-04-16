"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createBrowserClient } from "@/lib/supabase";

// Lazy-load TipTap to avoid SSR issues
const TipTapEditor = dynamic(() => import("@/components/TipTapEditor"), { ssr: false });

// ─── Types ────────────────────────────────────────────────────────────────────

interface Article {
  id: number;
  judul: string;
  slug: string;
  konten: string;
  status: "draft" | "published";
  gambar_url: string | null;
  created_at: string;
  updated_at: string;
}

type ArticleFormData = {
  judul: string;
  slug: string;
  konten: string;
  status: "draft" | "published";
  gambar_url: string;
};

type FormErrors = Partial<Record<keyof ArticleFormData, string>>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateSlug(judul: string): string {
  return judul
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateForm(form: ArticleFormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.judul.trim()) errors.judul = "Judul wajib diisi";
  if (!form.slug.trim()) {
    errors.slug = "Slug wajib diisi";
  } else if (!SLUG_REGEX.test(form.slug.trim())) {
    errors.slug = "Slug harus URL-safe (huruf kecil, angka, tanda hubung)";
  }
  if (!form.konten || form.konten === "<p></p>" || form.konten.trim() === "")
    errors.konten = "Konten wajib diisi";
  return errors;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const EMPTY_FORM: ArticleFormData = {
  judul: "",
  slug: "",
  konten: "",
  status: "draft",
  gambar_url: "",
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

function inputStyle(hasError?: boolean) {
  return {
    backgroundColor: "var(--color-bg)",
    border: `2px solid ${hasError ? "var(--color-error)" : "var(--color-border)"}`,
    color: "var(--color-text-bold)",
  };
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({
  article,
  onConfirm,
  onCancel,
  loading,
}: {
  article: Article;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const isPublished = article.status === "published";
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
          Hapus Artikel?
        </h2>
        <p className="text-sm text-center mb-3" style={{ color: "var(--color-text-muted)" }}>
          Artikel &ldquo;<strong>{article.judul.slice(0, 60)}{article.judul.length > 60 ? "…" : ""}</strong>&rdquo; akan dihapus permanen.
        </p>
        {isPublished && (
          <div
            className="mb-5 px-4 py-3 rounded-2xl text-sm font-semibold text-center"
            style={{
              backgroundColor: "var(--color-surface-alt)",
              border: "1px solid var(--color-error)",
              color: "var(--color-error)",
            }}
          >
            ⚠️ Artikel ini sudah dipublikasikan dan akan hilang dari halaman publik!
          </div>
        )}
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

// ─── Article Form ─────────────────────────────────────────────────────────────

function ArticleForm({
  initial,
  onSaveDraft,
  onPublish,
  onCancel,
  saving,
  formError,
}: {
  initial: ArticleFormData;
  onSaveDraft: (form: ArticleFormData) => Promise<void>;
  onPublish: (form: ArticleFormData) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
  formError: string | null;
}) {
  const [form, setForm] = useState<ArticleFormData>(initial);
  const [errors, setErrors] = useState<FormErrors>({});
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createBrowserClient();

  // Sync when initial changes (switching between articles)
  useEffect(() => {
    setForm(initial);
    setErrors({});
  }, [initial]);

  function setField<K extends keyof ArticleFormData>(key: K, value: ArticleFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleJudulChange(judul: string) {
    setForm((prev) => ({
      ...prev,
      judul,
      // Only auto-generate slug if it's empty or was previously auto-generated
      slug: prev.slug === generateSlug(prev.judul) || prev.slug === "" ? generateSlug(judul) : prev.slug,
    }));
    if (errors.judul) setErrors((prev) => ({ ...prev, judul: undefined }));
    if (errors.slug) setErrors((prev) => ({ ...prev, slug: undefined }));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("article-images")
        .upload(fileName, file, { upsert: false });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("article-images").getPublicUrl(fileName);
      setField("gambar_url", urlData.publicUrl);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gagal upload gambar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleAction(action: "draft" | "publish") {
    const finalForm: ArticleFormData = { ...form, status: action === "publish" ? "published" : "draft" };
    const errs = validateForm(finalForm);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (action === "draft") {
      await onSaveDraft(finalForm);
    } else {
      await onPublish(finalForm);
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-2xl text-sm font-semibold outline-none transition-all";

  return (
    <div className="space-y-5">
      {formError && (
        <div
          role="alert"
          className="px-4 py-3 rounded-2xl text-sm font-semibold"
          style={{
            backgroundColor: "var(--color-surface-alt)",
            border: "1px solid var(--color-error)",
            color: "var(--color-error)",
          }}
        >
          ⚠️ {formError}
        </div>
      )}

      {/* Judul */}
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
          Judul <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <input
          type="text"
          value={form.judul}
          onChange={(e) => handleJudulChange(e.target.value)}
          placeholder="Judul artikel…"
          aria-invalid={!!errors.judul}
          className={inputClass}
          style={inputStyle(!!errors.judul)}
        />
        <FieldError msg={errors.judul} />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
          Slug <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <input
          type="text"
          value={form.slug}
          onChange={(e) => setField("slug", e.target.value)}
          placeholder="url-artikel-ini"
          aria-invalid={!!errors.slug}
          className={inputClass}
          style={inputStyle(!!errors.slug)}
        />
        <FieldError msg={errors.slug} />
      </div>

      {/* Gambar URL + Upload */}
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
          Gambar (opsional)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={form.gambar_url}
            onChange={(e) => setField("gambar_url", e.target.value)}
            placeholder="https://… atau upload file"
            className={`${inputClass} flex-1`}
            style={inputStyle()}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{
              backgroundColor: "var(--color-surface-alt)",
              border: "2px solid var(--color-border)",
              color: "var(--color-text-bold)",
            }}
          >
            {uploading ? "Uploading…" : "📁 Upload"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Upload gambar artikel"
          />
        </div>
        {uploadError && (
          <p className="mt-1 text-xs font-bold" style={{ color: "var(--color-error)" }}>
            ⚠️ {uploadError}
          </p>
        )}
        {form.gambar_url && (
          <div className="mt-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.gambar_url}
              alt="Preview gambar artikel"
              className="h-24 rounded-2xl object-cover"
              style={{ border: "1px solid var(--color-border)" }}
            />
          </div>
        )}
      </div>

      {/* Konten (TipTap) */}
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
          Konten <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <TipTapEditor
          content={form.konten}
          onChange={(html) => {
            setField("konten", html);
          }}
        />
        <FieldError msg={errors.konten} />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-3 rounded-2xl font-bold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-bg)",
            border: "2px solid var(--color-border)",
            color: "var(--color-text-bold)",
          }}
        >
          Batal
        </button>
        <button
          type="button"
          onClick={() => handleAction("draft")}
          disabled={saving}
          className="px-5 py-3 rounded-2xl font-bold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{
            backgroundColor: "var(--color-warning)",
            border: "2px solid var(--color-warning)",
            color: "var(--color-text-bold)",
          }}
        >
          {saving ? "Menyimpan…" : "💾 Simpan Draft"}
        </button>
        <button
          type="button"
          onClick={() => handleAction("publish")}
          disabled={saving}
          className="px-5 py-3 rounded-2xl font-black text-sm text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {saving ? "Menyimpan…" : "🚀 Publikasikan"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminContentPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/admin/login");
    };
    void checkAuth();
  }, [supabase, router]);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/articles");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal memuat artikel");
      setArticles(json.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  function openAdd() {
    setEditingArticle(null);
    setFormError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEdit(a: Article) {
    setEditingArticle(a);
    setFormError(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    setEditingArticle(null);
    setFormError(null);
  }

  async function handleSave(form: ArticleFormData) {
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        judul: form.judul.trim(),
        slug: form.slug.trim(),
        konten: form.konten,
        status: form.status,
        gambar_url: form.gambar_url.trim() || null,
      };

      const url = editingArticle
        ? `/api/admin/articles/${editingArticle.id}`
        : "/api/admin/articles";
      const method = editingArticle ? "PUT" : "POST";

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
      await fetchArticles();
    } catch {
      setFormError("Terjadi kesalahan jaringan");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleStatus(a: Article) {
    const newStatus = a.status === "published" ? "draft" : "published";
    try {
      const res = await fetch(`/api/admin/articles/${a.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setArticles((prev) =>
          prev.map((item) => (item.id === a.id ? { ...item, status: newStatus } : item))
        );
      }
    } catch {
      // silent fail
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/articles/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles((prev) => prev.filter((a) => a.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch {
      // silent fail
    } finally {
      setDeleting(false);
    }
  }

  const formInitial: ArticleFormData = editingArticle
    ? {
        judul: editingArticle.judul,
        slug: editingArticle.slug,
        konten: editingArticle.konten,
        status: editingArticle.status,
        gambar_url: editingArticle.gambar_url ?? "",
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
              href="/admin/dashboard"
              className="text-sm font-bold mb-1 inline-block transition-opacity hover:opacity-70"
              style={{ color: "var(--color-text-muted)" }}
            >
              ← Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--color-text-bold)" }}>
              📚 Manajemen Konten
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              {articles.length} artikel terdaftar
            </p>
          </div>
          <button
            onClick={openAdd}
            className="px-6 py-3 rounded-2xl font-black text-sm text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            + Tambah Artikel
          </button>
        </div>

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
              {editingArticle ? "✏️ Edit Artikel" : "➕ Tambah Artikel Baru"}
            </h2>
            <ArticleForm
              initial={formInitial}
              onSaveDraft={handleSave}
              onPublish={handleSave}
              onCancel={closeForm}
              saving={saving}
              formError={formError}
            />
          </div>
        )}

        {/* Articles table */}
        <div
          className="rounded-3xl shadow-sm overflow-hidden"
          style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          {loading ? (
            <div className="py-16 text-center" style={{ color: "var(--color-text-muted)" }}>
              <div className="text-4xl mb-3 animate-pulse" aria-hidden="true">🌸</div>
              <p className="text-sm font-semibold">Memuat artikel…</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="py-16 text-center" style={{ color: "var(--color-text-muted)" }}>
              <div className="text-4xl mb-3" aria-hidden="true">📭</div>
              <p className="text-sm font-semibold">Belum ada artikel. Tambahkan yang pertama!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Daftar artikel">
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--color-border)" }}>
                    {["#", "Judul", "Slug", "Status", "Terakhir Diubah", "Aksi"].map((h) => (
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
                  {articles.map((a, idx) => (
                    <tr
                      key={a.id}
                      style={{ borderBottom: "1px solid var(--color-border)" }}
                      className="transition-colors hover:bg-pink-50"
                    >
                      <td className="px-4 py-3 font-bold" style={{ color: "var(--color-text-muted)" }}>
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 max-w-xs" style={{ color: "var(--color-text-bold)" }}>
                        <span className="line-clamp-2 font-semibold">{a.judul}</span>
                      </td>
                      <td className="px-4 py-3 max-w-[140px]">
                        <span
                          className="text-xs font-mono truncate block"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          {a.slug}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(a)}
                          aria-label={a.status === "published" ? "Unpublish artikel" : "Publish artikel"}
                          className="px-3 py-1 rounded-full text-xs font-black transition-transform hover:scale-105 active:scale-95"
                          style={{
                            backgroundColor:
                              a.status === "published"
                                ? "var(--color-success)"
                                : "var(--color-warning)",
                            color: a.status === "published" ? "#2d6a4f" : "#7a5c00",
                            border: `1px solid ${
                              a.status === "published"
                                ? "var(--color-success)"
                                : "var(--color-warning)"
                            }`,
                          }}
                        >
                          {a.status === "published" ? "✓ Published" : "📝 Draft"}
                        </button>
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {formatDate(a.updated_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(a)}
                            aria-label={`Edit artikel: ${a.judul.slice(0, 30)}`}
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
                            onClick={() => setDeleteTarget(a)}
                            aria-label={`Hapus artikel: ${a.judul.slice(0, 30)}`}
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
          article={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
