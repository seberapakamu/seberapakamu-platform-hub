"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase";

interface Opsi {
  label: string;
  value: string;
}

interface CoupleQuestion {
  id: number;
  teks: string;
  opsi: Opsi[];
  aktif: boolean;
  urutan: number;
}

export default function AdminCoupleSyncPage() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [questions, setQuestions] = useState<CoupleQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CoupleQuestion | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    teks: "",
    opsi1: "",
    opsi2: "",
    aktif: true,
    urutan: 0,
  });

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/couple-sync/questions");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setQuestions(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/admin/login");
    };
    checkAuth();
    fetchQuestions();
  }, [supabase, router, fetchQuestions]);

  const openAdd = () => {
    setEditing(null);
    setForm({ teks: "", opsi1: "", opsi2: "", aktif: true, urutan: questions.length + 1 });
    setShowForm(true);
  };

  const openEdit = (q: CoupleQuestion) => {
    setEditing(q);
    setForm({
      teks: q.teks,
      opsi1: q.opsi[0]?.label || "",
      opsi2: q.opsi[1]?.label || "",
      aktif: q.aktif,
      urutan: q.urutan,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        teks: form.teks,
        opsi: [
          { label: form.opsi1, value: "A" },
          { label: form.opsi2, value: "B" },
        ],
        aktif: form.aktif,
        urutan: form.urutan,
      };

      const url = editing
        ? `/api/admin/couple-sync/questions/${editing.id}`
        : "/api/admin/couple-sync/questions";
      const method = editing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Gagal menyimpan");
      
      setShowForm(false);
      fetchQuestions();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus?")) return;
    try {
      await fetch(`/api/admin/couple-sync/questions/${id}`, { method: "DELETE" });
      fetchQuestions();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-screen px-4 py-10" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Link href="/admin/bucin" className="text-sm font-bold text-gray-500 hover:opacity-70">← Dashboard</Link>
            <h1 className="text-3xl font-black text-gray-900 mt-1">👩‍❤️‍👨 Couple Sync Questions</h1>
          </div>
          <button
            onClick={openAdd}
            className="px-6 py-3 bg-pink-500 text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-all"
          >
            + Tambah Soal
          </button>
        </div>

        {showForm && (
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-black mb-6">{editing ? "Edit Soal" : "Tambah Soal Baru"}</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label className="block text-sm font-black mb-2">Teks Pertanyaan</label>
                <textarea
                  value={form.teks}
                  onChange={(e) => setForm({ ...form, teks: e.target.value })}
                  className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-pink-300 outline-none"
                  rows={2}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-black mb-2">Opsi 1 (A)</label>
                  <input
                    value={form.opsi1}
                    onChange={(e) => setForm({ ...form, opsi1: e.target.value })}
                    className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-pink-300 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-black mb-2">Opsi 2 (B)</label>
                  <input
                    value={form.opsi2}
                    onChange={(e) => setForm({ ...form, opsi2: e.target.value })}
                    className="w-full p-4 rounded-xl border-2 border-gray-100 focus:border-pink-300 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                    <label className="block text-sm font-black mb-2">Urutan</label>
                    <input
                        type="number"
                        value={form.urutan}
                        onChange={(e) => setForm({ ...form, urutan: parseInt(e.target.value) })}
                        className="w-24 p-4 rounded-xl border-2 border-gray-100 focus:border-pink-300 outline-none"
                    />
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-6">
                  <input
                    type="checkbox"
                    checked={form.aktif}
                    onChange={(e) => setForm({ ...form, aktif: e.target.checked })}
                    className="w-5 h-5 rounded accent-pink-500"
                  />
                  <span className="font-bold text-sm">Aktif</span>
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-4 bg-pink-500 text-white rounded-2xl font-black shadow-lg"
                >
                  {saving ? "Menyimpan..." : "Simpan Soal"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100">
          {loading ? (
            <div className="p-20 text-center animate-pulse">Memuat soal...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-400">Urutan</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-400">Pertanyaan</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-400">Opsi</th>
                  <th className="px-6 py-4 text-left text-xs font-black uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-gray-400">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-400">#{q.urutan}</td>
                    <td className="px-6 py-4">
                      <p className="font-black text-gray-900">{q.teks}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold">{q.opsi[0]?.label}</span>
                        <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold">{q.opsi[1]?.label}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${q.aktif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        {q.aktif ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button onClick={() => openEdit(q)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">✏️</button>
                      <button onClick={() => handleDelete(q.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
