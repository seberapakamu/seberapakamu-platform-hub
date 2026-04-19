"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import type { AnimeCharacter } from "@/lib/types/tebak";
import ImageCropperModal, { type CropArea } from "@/components/ImageCropperModal";
import CroppedImage from "@/components/CroppedImage";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  nama: string;
  asal_anime: string;
  image_url: string;
  crop_x: number;
  crop_y: number;
  crop_width: number;
  crop_height: number;
  kutipan: string;
  kekuatan: string;
  deskripsi: string;
  aktif: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const EMPTY_FORM: FormData = {
  nama: "",
  asal_anime: "",
  image_url: "",
  crop_x: 0,
  crop_y: 0,
  crop_width: 100,
  crop_height: 100,
  kutipan: "",
  kekuatan: "",
  deskripsi: "",
  aktif: true,
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validateForm(form: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!form.nama.trim()) errors.nama = "Nama karakter wajib diisi";
  if (!form.asal_anime.trim()) errors.asal_anime = "Asal anime wajib diisi";
  if (!form.image_url.trim()) errors.image_url = "Gambar karakter wajib diupload";
  if (!form.kutipan.trim()) errors.kutipan = "Kutipan ikonik wajib diisi";
  if (!form.kekuatan.trim()) errors.kekuatan = "Kekuatan/kemampuan wajib diisi";
  if (!form.deskripsi.trim()) errors.deskripsi = "Deskripsi singkat wajib diisi";
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

function inputStyle(hasError?: boolean): React.CSSProperties {
  return {
    backgroundColor: "var(--color-bg)",
    border: `2px solid ${hasError ? "var(--color-error)" : "var(--color-border)"}`,
    color: "var(--color-text-bold)",
  };
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({
  character,
  onConfirm,
  onCancel,
  loading,
}: {
  character: AnimeCharacter;
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
    >
      <div
        className="w-full max-w-md rounded-3xl shadow-xl p-8"
        style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
      >
        <div className="text-4xl text-center mb-4" aria-hidden="true">🗑️</div>
        <h2 className="text-xl font-black text-center mb-3" style={{ color: "var(--color-text-bold)" }}>
          Hapus Karakter?
        </h2>
        <p className="text-sm text-center mb-6" style={{ color: "var(--color-text-muted)" }}>
          <strong style={{ color: "var(--color-text-bold)" }}>&ldquo;{character.nama}&rdquo;</strong>{" "}
          dari <em>{character.asal_anime}</em> akan dihapus permanen.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl font-bold text-sm disabled:opacity-50"
            style={{ backgroundColor: "var(--color-bg)", border: "2px solid var(--color-border)", color: "var(--color-text-bold)" }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl font-black text-sm text-white disabled:opacity-50"
            style={{ backgroundColor: "var(--color-error)" }}
          >
            {loading ? "Menghapus…" : "Hapus"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Image Upload + Crop Section ─────────────────────────────────────────────

function ImageUploadCrop({
  imageUrl,
  cropX,
  cropY,
  cropWidth,
  cropHeight,
  onImageChange,
  onCropChange,
  error,
}: {
  imageUrl: string;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  onImageChange: (url: string) => void;
  onCropChange: (crop: CropArea) => void;
  error?: string;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const supabase = createBrowserClient();

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("File harus berupa gambar (JPG, PNG, WebP, dll.)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Ukuran file maksimal 5MB");
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const filename = `tebak-karakter/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("anime-characters")
        .upload(filename, file, { upsert: false });

      if (uploadErr) throw new Error(uploadErr.message);

      const { data } = supabase.storage.from("anime-characters").getPublicUrl(filename);
      onImageChange(data.publicUrl);
      // Reset crop to full image after new upload
      onCropChange({ x: 0, y: 0, width: 100, height: 100 });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Gagal mengupload gambar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="block text-sm font-bold mb-2" style={{ color: "var(--color-text-bold)" }}>
        Gambar Karakter <span style={{ color: "var(--color-error)" }}>*</span>
      </label>

      {imageUrl ? (
        <div className="space-y-3">
          {/* Preview crop */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              border: `2px solid ${error ? "var(--color-error)" : "var(--color-border)"}`,
              maxWidth: 280,
            }}
          >
            <CroppedImage
              imageUrl={imageUrl}
              cropX={cropX}
              cropY={cropY}
              cropWidth={cropWidth}
              cropHeight={cropHeight}
              alt="Preview crop gambar karakter"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowCropper(true)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
            >
              ✂️ Atur Crop
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02] disabled:opacity-50"
              style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-accent)", border: "1px solid var(--color-border)" }}
            >
              {uploading ? "Mengupload…" : "🔄 Ganti Gambar"}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full py-10 rounded-2xl text-sm font-bold transition-all hover:scale-[1.01] disabled:opacity-50 flex flex-col items-center gap-2"
          style={{
            backgroundColor: "var(--color-surface-alt)",
            border: `2px dashed ${error ? "var(--color-error)" : "var(--color-border)"}`,
            color: "var(--color-text-muted)",
          }}
        >
          <span className="text-3xl" aria-hidden="true">📸</span>
          <span>{uploading ? "Mengupload…" : "Klik untuk upload gambar"}</span>
          <span className="text-xs opacity-70">JPG, PNG, WebP · Maks 5MB</span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {(uploadError || error) && (
        <p role="alert" className="mt-1 text-xs font-bold" style={{ color: "var(--color-error)" }}>
          ⚠️ {uploadError ?? error}
        </p>
      )}

      {showCropper && imageUrl && (
        <ImageCropperModal
          imageUrl={imageUrl}
          initialCrop={{ x: cropX, y: cropY, width: cropWidth, height: cropHeight }}
          onConfirm={(crop) => {
            onCropChange(crop);
            setShowCropper(false);
          }}
          onCancel={() => setShowCropper(false)}
        />
      )}
    </div>
  );
}

// ─── Character Form ───────────────────────────────────────────────────────────

function CharacterForm({
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
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
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
      {/* Nama */}
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
          Nama Karakter <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <input
          type="text"
          value={form.nama}
          onChange={(e) => setField("nama", e.target.value)}
          placeholder="Contoh: Naruto Uzumaki"
          aria-invalid={!!errors.nama}
          className={inputClass}
          style={inputStyle(!!errors.nama)}
        />
        <FieldError msg={errors.nama} />
      </div>

      {/* Asal Anime */}
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
          Asal Anime <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <input
          type="text"
          value={form.asal_anime}
          onChange={(e) => setField("asal_anime", e.target.value)}
          placeholder="Contoh: Naruto"
          aria-invalid={!!errors.asal_anime}
          className={inputClass}
          style={inputStyle(!!errors.asal_anime)}
        />
        <FieldError msg={errors.asal_anime} />
      </div>

      {/* Image Upload + Crop */}
      <ImageUploadCrop
        imageUrl={form.image_url}
        cropX={form.crop_x}
        cropY={form.crop_y}
        cropWidth={form.crop_width}
        cropHeight={form.crop_height}
        onImageChange={(url) => setField("image_url", url)}
        onCropChange={(crop) => {
          setForm((prev) => ({
            ...prev,
            crop_x: crop.x,
            crop_y: crop.y,
            crop_width: crop.width,
            crop_height: crop.height,
          }));
        }}
        error={errors.image_url}
      />

      {/* Kutipan */}
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
          Kutipan Ikonik <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <textarea
          value={form.kutipan}
          onChange={(e) => setField("kutipan", e.target.value)}
          rows={2}
          placeholder="Kutipan terkenal karakter ini…"
          aria-invalid={!!errors.kutipan}
          className={`${inputClass} resize-none`}
          style={inputStyle(!!errors.kutipan)}
        />
        <FieldError msg={errors.kutipan} />
      </div>

      {/* Kekuatan */}
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
          Kekuatan/Kemampuan <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <textarea
          value={form.kekuatan}
          onChange={(e) => setField("kekuatan", e.target.value)}
          rows={2}
          placeholder="Deskripsi kekuatan atau kemampuan karakter…"
          aria-invalid={!!errors.kekuatan}
          className={`${inputClass} resize-none`}
          style={inputStyle(!!errors.kekuatan)}
        />
        <FieldError msg={errors.kekuatan} />
      </div>

      {/* Deskripsi */}
      <div>
        <label className="block text-sm font-bold mb-1" style={{ color: "var(--color-text-bold)" }}>
          Deskripsi Singkat <span style={{ color: "var(--color-error)" }}>*</span>
        </label>
        <textarea
          value={form.deskripsi}
          onChange={(e) => setField("deskripsi", e.target.value)}
          rows={3}
          placeholder="Deskripsi singkat yang ditampilkan saat jawaban benar…"
          aria-invalid={!!errors.deskripsi}
          className={`${inputClass} resize-none`}
          style={inputStyle(!!errors.deskripsi)}
        />
        <FieldError msg={errors.deskripsi} />
      </div>

      {/* Aktif */}
      <div className="flex items-center gap-3">
        <input
          id="form-aktif"
          type="checkbox"
          checked={form.aktif}
          onChange={(e) => setField("aktif", e.target.checked)}
          className="w-5 h-5 rounded accent-pink-400"
        />
        <label htmlFor="form-aktif" className="text-sm font-bold" style={{ color: "var(--color-text-bold)" }}>
          Aktif (tampil di kuis)
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex-1 py-3 rounded-2xl font-bold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: "var(--color-bg)", border: "2px solid var(--color-border)", color: "var(--color-text-bold)" }}
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCharactersPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [characters, setCharacters] = useState<AnimeCharacter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<AnimeCharacter | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<AnimeCharacter | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/admin/login");
    };
    void checkAuth();
  }, [supabase, router]);

  const fetchCharacters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from("anime_characters")
        .select("*")
        .order("created_at", { ascending: false });
      if (dbError) throw new Error(dbError.message);
      setCharacters(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchCharacters(); }, [fetchCharacters]);

  function openAdd() {
    setEditingCharacter(null);
    setFormError(null);
    setShowForm(true);
    setTimeout(() => document.getElementById("character-form")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function openEdit(c: AnimeCharacter) {
    setEditingCharacter(c);
    setFormError(null);
    setShowForm(true);
    setTimeout(() => document.getElementById("character-form")?.scrollIntoView({ behavior: "smooth" }), 100);
  }

  function closeForm() {
    setShowForm(false);
    setEditingCharacter(null);
    setFormError(null);
  }

  async function handleSave(form: FormData) {
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        nama: form.nama.trim(),
        asal_anime: form.asal_anime.trim(),
        image_url: form.image_url.trim(),
        siluet_url: form.image_url.trim(), // backward compat — kolom lama
        crop_x: form.crop_x,
        crop_y: form.crop_y,
        crop_width: form.crop_width,
        crop_height: form.crop_height,
        kutipan: form.kutipan.trim(),
        kekuatan: form.kekuatan.trim(),
        deskripsi: form.deskripsi.trim(),
        aktif: form.aktif,
      };

      if (editingCharacter) {
        const res = await fetch(`/api/admin/anime-characters/${editingCharacter.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json() as { error?: string };
          throw new Error(data.error ?? "Gagal mengupdate karakter");
        }
      } else {
        const res = await fetch("/api/admin/anime-characters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const data = await res.json() as { error?: string };
          throw new Error(data.error ?? "Gagal menyimpan karakter");
        }
      }

      closeForm();
      await fetchCharacters();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Gagal menyimpan karakter");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAktif(c: AnimeCharacter) {
    try {
      const res = await fetch(`/api/admin/anime-characters/${c.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aktif: !c.aktif }),
      });
      if (res.ok) {
        setCharacters((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, aktif: !c.aktif } : item))
        );
      } else {
        const data = await res.json() as { error?: string };
        console.error("Toggle aktif error:", data.error);
      }
    } catch (e) {
      console.error("Toggle aktif exception:", e);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/anime-characters/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCharacters((prev) => prev.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch { /* silent */ }
    finally { setDeleting(false); }
  }

  const formInitial: FormData = editingCharacter
    ? {
        nama: editingCharacter.nama,
        asal_anime: editingCharacter.asal_anime,
        image_url: editingCharacter.image_url ?? (editingCharacter as AnimeCharacter & { siluet_url?: string }).siluet_url ?? "",
        crop_x: editingCharacter.crop_x ?? 0,
        crop_y: editingCharacter.crop_y ?? 0,
        crop_width: editingCharacter.crop_width > 0 ? editingCharacter.crop_width : 100,
        crop_height: editingCharacter.crop_height > 0 ? editingCharacter.crop_height : 100,
        kutipan: editingCharacter.kutipan,
        kekuatan: editingCharacter.kekuatan,
        deskripsi: editingCharacter.deskripsi,
        aktif: editingCharacter.aktif,
      }
    : EMPTY_FORM;

  const activeCount = characters.filter((c) => c.aktif).length;

  return (
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: "var(--color-bg)" }}>
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
            <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--color-text-bold)" }}>
              🎭 Manajemen Karakter
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
              {characters.length} karakter terdaftar · {activeCount} aktif
            </p>
          </div>
          <button
            onClick={openAdd}
            className="px-6 py-3 rounded-2xl font-black text-sm text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            + Tambah Karakter
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="mb-4 px-4 py-3 rounded-2xl text-sm font-semibold"
            style={{ backgroundColor: "var(--color-surface-alt)", border: "1px solid var(--color-error)", color: "var(--color-error)" }}
          >
            ⚠️ {error}
            <button onClick={fetchCharacters} className="ml-3 underline font-bold">Coba Lagi</button>
          </div>
        )}

        {/* Form panel */}
        {showForm && (
          <div
            id="character-form"
            className="rounded-3xl shadow-lg p-6 sm:p-8 mb-6"
            style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          >
            <h2 className="text-lg font-black mb-5" style={{ color: "var(--color-text-bold)" }}>
              {editingCharacter ? "✏️ Edit Karakter" : "➕ Tambah Karakter Baru"}
            </h2>
            {formError && (
              <div
                role="alert"
                className="mb-4 px-4 py-3 rounded-2xl text-sm font-semibold"
                style={{ backgroundColor: "var(--color-surface-alt)", border: "1px solid var(--color-error)", color: "var(--color-error)" }}
              >
                ⚠️ {formError}
              </div>
            )}
            <CharacterForm
              initial={formInitial}
              onSave={handleSave}
              onCancel={closeForm}
              saving={saving}
            />
          </div>
        )}

        {/* Characters grid */}
        <div
          className="rounded-3xl shadow-sm overflow-hidden"
          style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
        >
          {loading ? (
            <div className="py-16 text-center" style={{ color: "var(--color-text-muted)" }}>
              <div className="text-4xl mb-3 animate-pulse" aria-hidden="true">🎭</div>
              <p className="text-sm font-semibold">Memuat karakter…</p>
            </div>
          ) : characters.length === 0 ? (
            <div className="py-16 text-center" style={{ color: "var(--color-text-muted)" }}>
              <div className="text-4xl mb-3" aria-hidden="true">📭</div>
              <p className="text-sm font-semibold">Belum ada karakter. Tambahkan yang pertama!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
              {characters.map((c, idx) => (
                <div
                  key={c.id}
                  className="p-4 flex flex-col gap-3"
                  style={{ borderBottom: "1px solid var(--color-border)", borderRight: "1px solid var(--color-border)" }}
                >
                  {/* Crop preview */}
                  {c.image_url ? (
                    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
                      <CroppedImage
                        imageUrl={c.image_url}
                        cropX={c.crop_x ?? 0}
                        cropY={c.crop_y ?? 0}
                        cropWidth={c.crop_width ?? 100}
                        cropHeight={c.crop_height ?? 100}
                        alt={`Preview ${c.nama}`}
                      />
                    </div>
                  ) : (
                    <div
                      className="rounded-xl flex items-center justify-center"
                      style={{ height: 80, backgroundColor: "var(--color-surface-alt)", border: "1px solid var(--color-border)" }}
                    >
                      <span className="text-2xl" aria-hidden="true">🎭</span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-black leading-tight" style={{ color: "var(--color-text-bold)" }}>
                        {idx + 1}. {c.nama}
                      </p>
                      <button
                        onClick={() => handleToggleAktif(c)}
                        aria-label={c.aktif ? `Nonaktifkan ${c.nama}` : `Aktifkan ${c.nama}`}
                        className="shrink-0 px-2 py-0.5 rounded-full text-xs font-black transition-transform hover:scale-105"
                        style={{
                          backgroundColor: c.aktif ? "var(--color-success)" : "var(--color-surface-alt)",
                          color: c.aktif ? "#2d6a4f" : "var(--color-text-muted)",
                          border: `1px solid ${c.aktif ? "var(--color-success)" : "var(--color-border)"}`,
                        }}
                      >
                        {c.aktif ? "✓" : "○"}
                      </button>
                    </div>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{c.asal_anime}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(c)}
                      aria-label={`Edit ${c.nama}`}
                      className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-transform hover:scale-105"
                      style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-accent)", border: "1px solid var(--color-border)" }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c)}
                      aria-label={`Hapus ${c.nama}`}
                      className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-transform hover:scale-105"
                      style={{ backgroundColor: "var(--color-surface-alt)", color: "var(--color-error)", border: "1px solid var(--color-border)" }}
                    >
                      🗑️ Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {deleteTarget && (
        <DeleteModal
          character={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
