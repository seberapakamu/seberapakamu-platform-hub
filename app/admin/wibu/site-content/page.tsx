"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface TierData {
  title: string;
  emoji: string;
  description: string;
  minScore: number;
  maxScore: number;
}

interface HeroData {
  title: string;
  subtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
}

interface CtaData {
  title: string;
  subtitle: string;
  buttonText: string;
}

interface HowItWorksItem {
  step: string;
  emoji: string;
  title: string;
  desc: string;
}

interface QuizListItem {
  id: string;
  title: string;
  description: string;
  questionCount: number;
  emoji: string;
  badge: string;
}

interface FaqItem { q: string; a: string }
interface MemeItem { term: string; emoji: string; definition: string }
interface TimelineItem { year: string; title: string; desc: string }
interface TentangTierItem { rank: number; name: string; emoji: string; range: string; desc: string }
interface TentangIntro { title: string; paragraphs: string[] }

type Tab = "tiers" | "landing" | "wiki" | "tentang";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function inputCls() {
  return "w-full px-4 py-2.5 rounded-2xl text-sm font-semibold outline-none transition-all";
}

function inputStyle() {
  return {
    backgroundColor: "var(--color-bg)",
    border: "2px solid var(--color-border)",
    color: "var(--color-text-bold)",
  };
}

function textareaStyle() {
  return {
    backgroundColor: "var(--color-bg)",
    border: "2px solid var(--color-border)",
    color: "var(--color-text-bold)",
    resize: "vertical" as const,
  };
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-xs font-black uppercase tracking-wide mb-1" style={{ color: "var(--color-text-muted)" }}>
      {children}
    </label>
  );
}

function SaveBtn({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="px-6 py-2.5 rounded-2xl font-black text-sm text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      {saving ? "Menyimpan…" : "💾 Simpan"}
    </button>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-3xl p-6 shadow-sm mb-6"
      style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
    >
      <h3 className="text-base font-black mb-4" style={{ color: "var(--color-text-bold)" }}>{title}</h3>
      {children}
    </div>
  );
}

function Toast({ msg, type }: { msg: string; type: "success" | "error" }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold"
      style={{
        backgroundColor: type === "success" ? "var(--color-success)" : "var(--color-error)",
        color: type === "success" ? "#1a4731" : "#fff",
      }}
    >
      {type === "success" ? "✅" : "⚠️"} {msg}
    </div>
  );
}

// ─── Tab: Tiers ───────────────────────────────────────────────────────────────

function TiersTab({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
  const [tiers, setTiers] = useState<TierData[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-content?keys=tier_1,tier_2,tier_3,tier_4,tier_5&module=wibu")
      .then((r) => r.json())
      .then(({ data }) => {
        if (!data) return;
        const sorted = [1, 2, 3, 4, 5].map((n) => {
          const row = data.find((d: { key: string; value: TierData }) => d.key === `tier_${n}`);
          return row?.value as TierData ?? { title: "", emoji: "", description: "", minScore: 0, maxScore: 100 };
        });
        setTiers(sorted);
      });
  }, []);

  function update(idx: number, field: keyof TierData, val: string | number) {
    setTiers((prev) => prev.map((t, i) => i === idx ? { ...t, [field]: val } : t));
  }

  async function save() {
    setSaving(true);
    try {
      const body = tiers.map((t, i) => ({ key: `tier_${i + 1}`, value: t }));
      const res = await fetch("/api/admin/site-content?module=wibu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onToast("Distribusi tier berhasil disimpan!", "success");
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  }

  const tierColors = ["var(--color-info)", "var(--color-success)", "var(--color-warning)", "var(--color-accent)", "var(--color-primary)"];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          Edit judul, emoji, deskripsi, dan range skor tiap tier wibu.
        </p>
        <SaveBtn saving={saving} onClick={save} />
      </div>
      <div className="space-y-4">
        {tiers.map((tier, i) => (
          <div
            key={i}
            className="rounded-3xl p-5 shadow-sm"
            style={{ backgroundColor: "var(--color-surface)", border: `2px solid ${tierColors[i]}30` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0"
                style={{ backgroundColor: tierColors[i] }}
              >
                {i + 1}
              </div>
              <span className="font-black text-base" style={{ color: "var(--color-text-bold)" }}>
                Tier {i + 1}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Judul</Label>
                <input
                  type="text"
                  value={tier.title}
                  onChange={(e) => update(i, "title", e.target.value)}
                  className={inputCls()}
                  style={inputStyle()}
                />
              </div>
              <div>
                <Label>Emoji</Label>
                <input
                  type="text"
                  value={tier.emoji}
                  onChange={(e) => update(i, "emoji", e.target.value)}
                  className={inputCls()}
                  style={inputStyle()}
                  maxLength={4}
                />
              </div>
              <div>
                <Label>Skor Min</Label>
                <input
                  type="number"
                  value={tier.minScore}
                  onChange={(e) => update(i, "minScore", parseFloat(e.target.value) || 0)}
                  className={inputCls()}
                  style={inputStyle()}
                  min={0} max={100} step={0.01}
                />
              </div>
              <div>
                <Label>Skor Max</Label>
                <input
                  type="number"
                  value={tier.maxScore}
                  onChange={(e) => update(i, "maxScore", parseFloat(e.target.value) || 0)}
                  className={inputCls()}
                  style={inputStyle()}
                  min={0} max={100} step={0.01}
                />
              </div>
              <div className="sm:col-span-2">
                <Label>Deskripsi</Label>
                <textarea
                  value={tier.description}
                  onChange={(e) => update(i, "description", e.target.value)}
                  rows={3}
                  className={`${inputCls()} leading-relaxed`}
                  style={textareaStyle()}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab: Landing Page ────────────────────────────────────────────────────────

function LandingTab({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
  const [hero, setHero] = useState<HeroData>({ title: "", subtitle: "", ctaPrimary: "", ctaSecondary: "" });
  const [cta, setCta] = useState<CtaData>({ title: "", subtitle: "", buttonText: "" });
  const [howItWorks, setHowItWorks] = useState<HowItWorksItem[]>([]);
  const [quizList, setQuizList] = useState<QuizListItem[]>([]);
  const [statsOffset, setStatsOffset] = useState(1200);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-content?keys=landing_hero,landing_cta,landing_how_it_works,landing_quiz_list,landing_stats_offset&module=wibu")
      .then((r) => r.json())
      .then(({ data }) => {
        if (!data) return;
        const get = (key: string) => data.find((d: { key: string; value: unknown }) => d.key === key)?.value;
        if (get("landing_hero")) setHero(get("landing_hero") as HeroData);
        if (get("landing_cta")) setCta(get("landing_cta") as CtaData);
        if (get("landing_how_it_works")) setHowItWorks(get("landing_how_it_works") as HowItWorksItem[]);
        if (get("landing_quiz_list")) setQuizList(get("landing_quiz_list") as QuizListItem[]);
        if (get("landing_stats_offset")) setStatsOffset((get("landing_stats_offset") as { offset: number }).offset);
      });
  }, []);

  function updateHowItWorks(idx: number, field: keyof HowItWorksItem, val: string) {
    setHowItWorks((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  }

  function updateQuizList(idx: number, field: keyof QuizListItem, val: string | number) {
    setQuizList((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  }

  async function save() {
    setSaving(true);
    try {
      const body = [
        { key: "landing_hero", value: hero },
        { key: "landing_cta", value: cta },
        { key: "landing_how_it_works", value: howItWorks },
        { key: "landing_quiz_list", value: quizList },
        { key: "landing_stats_offset", value: { offset: statsOffset } },
      ];
      const res = await fetch("/api/admin/site-content?module=wibu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onToast("Konten landing page berhasil disimpan!", "success");
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Edit konten hero, statistik, daftar kuis, dan cara main.</p>
        <SaveBtn saving={saving} onClick={save} />
      </div>

      {/* Hero */}
      <SectionCard title="🦸 Hero Section">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Judul Utama</Label>
            <input type="text" value={hero.title} onChange={(e) => setHero({ ...hero, title: e.target.value })} className={inputCls()} style={inputStyle()} />
          </div>
          <div className="sm:col-span-2">
            <Label>Subtitle</Label>
            <textarea value={hero.subtitle} onChange={(e) => setHero({ ...hero, subtitle: e.target.value })} rows={2} className={`${inputCls()} leading-relaxed`} style={textareaStyle()} />
          </div>
          <div>
            <Label>Teks Tombol Utama</Label>
            <input type="text" value={hero.ctaPrimary} onChange={(e) => setHero({ ...hero, ctaPrimary: e.target.value })} className={inputCls()} style={inputStyle()} />
          </div>
          <div>
            <Label>Teks Tombol Sekunder</Label>
            <input type="text" value={hero.ctaSecondary} onChange={(e) => setHero({ ...hero, ctaSecondary: e.target.value })} className={inputCls()} style={inputStyle()} />
          </div>
        </div>
      </SectionCard>

      {/* Stats offset */}
      <SectionCard title="📊 Statistik Pengguna">
        <Label>Offset Jumlah Pengguna (ditambahkan ke angka real dari DB)</Label>
        <input
          type="number"
          value={statsOffset}
          onChange={(e) => setStatsOffset(parseInt(e.target.value) || 0)}
          className={inputCls()}
          style={inputStyle()}
          min={0}
        />
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          Angka ini ditambahkan ke total sesi dari database untuk ditampilkan di landing page.
        </p>
      </SectionCard>

      {/* Quiz list */}
      <SectionCard title="🎮 Daftar Kuis">
        {quizList.map((quiz, i) => (
          <div key={i} className="mb-4 pb-4" style={{ borderBottom: i < quizList.length - 1 ? "1px solid var(--color-border)" : "none" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label>Judul Kuis</Label>
                <input type="text" value={quiz.title} onChange={(e) => updateQuizList(i, "title", e.target.value)} className={inputCls()} style={inputStyle()} />
              </div>
              <div>
                <Label>Emoji</Label>
                <input type="text" value={quiz.emoji} onChange={(e) => updateQuizList(i, "emoji", e.target.value)} className={inputCls()} style={inputStyle()} maxLength={4} />
              </div>
              <div>
                <Label>Badge</Label>
                <input type="text" value={quiz.badge} onChange={(e) => updateQuizList(i, "badge", e.target.value)} className={inputCls()} style={inputStyle()} />
              </div>
              <div>
                <Label>Jumlah Pertanyaan</Label>
                <input type="number" value={quiz.questionCount} onChange={(e) => updateQuizList(i, "questionCount", parseInt(e.target.value) || 0)} className={inputCls()} style={inputStyle()} min={1} />
              </div>
              <div className="sm:col-span-2">
                <Label>Deskripsi</Label>
                <textarea value={quiz.description} onChange={(e) => updateQuizList(i, "description", e.target.value)} rows={2} className={`${inputCls()} leading-relaxed`} style={textareaStyle()} />
              </div>
            </div>
          </div>
        ))}
      </SectionCard>

      {/* How it works */}
      <SectionCard title="🎯 Cara Main">
        <div className="space-y-4">
          {howItWorks.map((item, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>Emoji</Label>
                <input type="text" value={item.emoji} onChange={(e) => updateHowItWorks(i, "emoji", e.target.value)} className={inputCls()} style={inputStyle()} maxLength={4} />
              </div>
              <div>
                <Label>Judul</Label>
                <input type="text" value={item.title} onChange={(e) => updateHowItWorks(i, "title", e.target.value)} className={inputCls()} style={inputStyle()} />
              </div>
              <div>
                <Label>Deskripsi</Label>
                <input type="text" value={item.desc} onChange={(e) => updateHowItWorks(i, "desc", e.target.value)} className={inputCls()} style={inputStyle()} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* CTA */}
      <SectionCard title="🚀 CTA Section (Bawah)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label>Judul</Label>
            <input type="text" value={cta.title} onChange={(e) => setCta({ ...cta, title: e.target.value })} className={inputCls()} style={inputStyle()} />
          </div>
          <div className="sm:col-span-2">
            <Label>Subtitle</Label>
            <textarea value={cta.subtitle} onChange={(e) => setCta({ ...cta, subtitle: e.target.value })} rows={2} className={`${inputCls()} leading-relaxed`} style={textareaStyle()} />
          </div>
          <div>
            <Label>Teks Tombol</Label>
            <input type="text" value={cta.buttonText} onChange={(e) => setCta({ ...cta, buttonText: e.target.value })} className={inputCls()} style={inputStyle()} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Wiki ────────────────────────────────────────────────────────────────

function WikiTab({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [memes, setMemes] = useState<MemeItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-content?keys=wiki_faqs,wiki_memes,wiki_timeline&module=wibu")
      .then((r) => r.json())
      .then(({ data }) => {
        if (!data) return;
        const get = (key: string) => data.find((d: { key: string; value: unknown }) => d.key === key)?.value;
        if (get("wiki_faqs")) setFaqs(get("wiki_faqs") as FaqItem[]);
        if (get("wiki_memes")) setMemes(get("wiki_memes") as MemeItem[]);
        if (get("wiki_timeline")) setTimeline(get("wiki_timeline") as TimelineItem[]);
      });
  }, []);

  async function save() {
    setSaving(true);
    try {
      const body = [
        { key: "wiki_faqs", value: faqs },
        { key: "wiki_memes", value: memes },
        { key: "wiki_timeline", value: timeline },
      ];
      const res = await fetch("/api/admin/site-content?module=wibu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onToast("Konten wiki berhasil disimpan!", "success");
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  }

  function addFaq() { setFaqs((p) => [...p, { q: "", a: "" }]); }
  function removeFaq(i: number) { setFaqs((p) => p.filter((_, idx) => idx !== i)); }
  function updateFaq(i: number, field: "q" | "a", val: string) {
    setFaqs((p) => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  function addMeme() { setMemes((p) => [...p, { term: "", emoji: "✨", definition: "" }]); }
  function removeMeme(i: number) { setMemes((p) => p.filter((_, idx) => idx !== i)); }
  function updateMeme(i: number, field: keyof MemeItem, val: string) {
    setMemes((p) => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  function addTimeline() { setTimeline((p) => [...p, { year: "", title: "", desc: "" }]); }
  function removeTimeline(i: number) { setTimeline((p) => p.filter((_, idx) => idx !== i)); }
  function updateTimeline(i: number, field: keyof TimelineItem, val: string) {
    setTimeline((p) => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Edit FAQ, meme breakdown, dan timeline sejarah anime.</p>
        <SaveBtn saving={saving} onClick={save} />
      </div>

      {/* FAQ */}
      <SectionCard title="❓ FAQ">
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black" style={{ color: "var(--color-text-muted)" }}>FAQ #{i + 1}</span>
                <button onClick={() => removeFaq(i)} className="text-xs font-bold px-2 py-1 rounded-xl" style={{ color: "var(--color-error)", backgroundColor: "var(--color-surface-alt)" }}>✕ Hapus</button>
              </div>
              <div className="space-y-2">
                <div>
                  <Label>Pertanyaan</Label>
                  <input type="text" value={faq.q} onChange={(e) => updateFaq(i, "q", e.target.value)} className={inputCls()} style={inputStyle()} />
                </div>
                <div>
                  <Label>Jawaban</Label>
                  <textarea value={faq.a} onChange={(e) => updateFaq(i, "a", e.target.value)} rows={3} className={`${inputCls()} leading-relaxed`} style={textareaStyle()} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addFaq} className="w-full py-2.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80" style={{ border: "2px dashed var(--color-border)", color: "var(--color-text-muted)" }}>
            + Tambah FAQ
          </button>
        </div>
      </SectionCard>

      {/* Memes */}
      <SectionCard title="🔥 Meme Breakdown">
        <div className="space-y-4">
          {memes.map((meme, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black" style={{ color: "var(--color-text-muted)" }}>Meme #{i + 1}</span>
                <button onClick={() => removeMeme(i)} className="text-xs font-bold px-2 py-1 rounded-xl" style={{ color: "var(--color-error)", backgroundColor: "var(--color-surface-alt)" }}>✕ Hapus</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>Istilah</Label>
                  <input type="text" value={meme.term} onChange={(e) => updateMeme(i, "term", e.target.value)} className={inputCls()} style={inputStyle()} />
                </div>
                <div>
                  <Label>Emoji</Label>
                  <input type="text" value={meme.emoji} onChange={(e) => updateMeme(i, "emoji", e.target.value)} className={inputCls()} style={inputStyle()} maxLength={4} />
                </div>
                <div className="sm:col-span-3">
                  <Label>Definisi</Label>
                  <textarea value={meme.definition} onChange={(e) => updateMeme(i, "definition", e.target.value)} rows={3} className={`${inputCls()} leading-relaxed`} style={textareaStyle()} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addMeme} className="w-full py-2.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80" style={{ border: "2px dashed var(--color-border)", color: "var(--color-text-muted)" }}>
            + Tambah Meme
          </button>
        </div>
      </SectionCard>

      {/* Timeline */}
      <SectionCard title="🕰️ Timeline Sejarah Anime">
        <div className="space-y-3">
          {timeline.map((item, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black" style={{ color: "var(--color-text-muted)" }}>#{i + 1}</span>
                <button onClick={() => removeTimeline(i)} className="text-xs font-bold px-2 py-1 rounded-xl" style={{ color: "var(--color-error)", backgroundColor: "var(--color-surface-alt)" }}>✕ Hapus</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>Tahun</Label>
                  <input type="text" value={item.year} onChange={(e) => updateTimeline(i, "year", e.target.value)} className={inputCls()} style={inputStyle()} maxLength={4} />
                </div>
                <div>
                  <Label>Judul</Label>
                  <input type="text" value={item.title} onChange={(e) => updateTimeline(i, "title", e.target.value)} className={inputCls()} style={inputStyle()} />
                </div>
                <div className="sm:col-span-3">
                  <Label>Deskripsi</Label>
                  <textarea value={item.desc} onChange={(e) => updateTimeline(i, "desc", e.target.value)} rows={2} className={`${inputCls()} leading-relaxed`} style={textareaStyle()} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addTimeline} className="w-full py-2.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80" style={{ border: "2px dashed var(--color-border)", color: "var(--color-text-muted)" }}>
            + Tambah Item Timeline
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Tab: Tentang Wibu ────────────────────────────────────────────────────────

function TentangTab({ onToast }: { onToast: (msg: string, type: "success" | "error") => void }) {
  const [intro, setIntro] = useState<TentangIntro>({ title: "", paragraphs: [""] });
  const [tiers, setTiers] = useState<TentangTierItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-content?keys=tentang_intro,tentang_tiers,tentang_platform_faqs&module=wibu")
      .then((r) => r.json())
      .then(({ data }) => {
        if (!data) return;
        const get = (key: string) => data.find((d: { key: string; value: unknown }) => d.key === key)?.value;
        if (get("tentang_intro")) setIntro(get("tentang_intro") as TentangIntro);
        if (get("tentang_tiers")) setTiers(get("tentang_tiers") as TentangTierItem[]);
        if (get("tentang_platform_faqs")) setFaqs(get("tentang_platform_faqs") as FaqItem[]);
      });
  }, []);

  async function save() {
    setSaving(true);
    try {
      const body = [
        { key: "tentang_intro", value: intro },
        { key: "tentang_tiers", value: tiers },
        { key: "tentang_platform_faqs", value: faqs },
      ];
      const res = await fetch("/api/admin/site-content?module=wibu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      onToast("Konten tentang wibu berhasil disimpan!", "success");
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Gagal menyimpan", "error");
    } finally {
      setSaving(false);
    }
  }

  function updateParagraph(i: number, val: string) {
    setIntro((p) => ({ ...p, paragraphs: p.paragraphs.map((par, idx) => idx === i ? val : par) }));
  }
  function addParagraph() { setIntro((p) => ({ ...p, paragraphs: [...p.paragraphs, ""] })); }
  function removeParagraph(i: number) { setIntro((p) => ({ ...p, paragraphs: p.paragraphs.filter((_, idx) => idx !== i) })); }

  function updateTier(i: number, field: keyof TentangTierItem, val: string) {
    setTiers((p) => p.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
  }

  function updateFaq(i: number, field: "q" | "a", val: string) {
    setFaqs((p) => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  }
  function addFaq() { setFaqs((p) => [...p, { q: "", a: "" }]); }
  function removeFaq(i: number) { setFaqs((p) => p.filter((_, idx) => idx !== i)); }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>Edit konten halaman Tentang Wibu.</p>
        <SaveBtn saving={saving} onClick={save} />
      </div>

      {/* Intro */}
      <SectionCard title="🤔 Apa Itu Wibu?">
        <div className="space-y-3">
          <div>
            <Label>Judul Section</Label>
            <input type="text" value={intro.title} onChange={(e) => setIntro({ ...intro, title: e.target.value })} className={inputCls()} style={inputStyle()} />
          </div>
          {intro.paragraphs.map((par, i) => (
            <div key={i}>
              <div className="flex justify-between items-center mb-1">
                <Label>Paragraf {i + 1}</Label>
                {intro.paragraphs.length > 1 && (
                  <button onClick={() => removeParagraph(i)} className="text-xs font-bold px-2 py-0.5 rounded-xl" style={{ color: "var(--color-error)", backgroundColor: "var(--color-surface-alt)" }}>✕</button>
                )}
              </div>
              <textarea value={par} onChange={(e) => updateParagraph(i, e.target.value)} rows={3} className={`${inputCls()} leading-relaxed`} style={textareaStyle()} />
            </div>
          ))}
          <button onClick={addParagraph} className="text-sm font-bold px-4 py-2 rounded-2xl transition-opacity hover:opacity-80" style={{ border: "2px dashed var(--color-border)", color: "var(--color-text-muted)" }}>
            + Tambah Paragraf
          </button>
        </div>
      </SectionCard>

      {/* Tingkatan */}
      <SectionCard title="⭐ Tingkatan Wibu">
        <div className="space-y-4">
          {tiers.map((tier, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <span className="text-xs font-black mb-2 block" style={{ color: "var(--color-text-muted)" }}>Tingkat {tier.rank}</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <Label>Nama</Label>
                  <input type="text" value={tier.name} onChange={(e) => updateTier(i, "name", e.target.value)} className={inputCls()} style={inputStyle()} />
                </div>
                <div>
                  <Label>Emoji</Label>
                  <input type="text" value={tier.emoji} onChange={(e) => updateTier(i, "emoji", e.target.value)} className={inputCls()} style={inputStyle()} maxLength={4} />
                </div>
                <div>
                  <Label>Range (contoh: 0–20%)</Label>
                  <input type="text" value={tier.range} onChange={(e) => updateTier(i, "range", e.target.value)} className={inputCls()} style={inputStyle()} />
                </div>
                <div className="sm:col-span-3">
                  <Label>Deskripsi</Label>
                  <textarea value={tier.desc} onChange={(e) => updateTier(i, "desc", e.target.value)} rows={3} className={`${inputCls()} leading-relaxed`} style={textareaStyle()} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* FAQ Platform */}
      <SectionCard title="❓ FAQ Platform">
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-2xl p-4" style={{ backgroundColor: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black" style={{ color: "var(--color-text-muted)" }}>FAQ #{i + 1}</span>
                <button onClick={() => removeFaq(i)} className="text-xs font-bold px-2 py-1 rounded-xl" style={{ color: "var(--color-error)", backgroundColor: "var(--color-surface-alt)" }}>✕ Hapus</button>
              </div>
              <div className="space-y-2">
                <div>
                  <Label>Pertanyaan</Label>
                  <input type="text" value={faq.q} onChange={(e) => updateFaq(i, "q", e.target.value)} className={inputCls()} style={inputStyle()} />
                </div>
                <div>
                  <Label>Jawaban</Label>
                  <textarea value={faq.a} onChange={(e) => updateFaq(i, "a", e.target.value)} rows={3} className={`${inputCls()} leading-relaxed`} style={textareaStyle()} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addFaq} className="w-full py-2.5 rounded-2xl text-sm font-bold transition-opacity hover:opacity-80" style={{ border: "2px dashed var(--color-border)", color: "var(--color-text-muted)" }}>
            + Tambah FAQ
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminSiteContentPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [activeTab, setActiveTab] = useState<Tab>("tiers");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) router.push("/admin/login");
    }
    void checkAuth();
  }, [supabase, router]);

  function showToast(msg: string, type: "success" | "error") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "tiers", label: "🏅 Distribusi Tier" },
    { id: "landing", label: "🏠 Landing Page" },
    { id: "wiki", label: "📖 Wiki" },
    { id: "tentang", label: "🎌 Tentang Wibu" },
  ];

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

      <div className="relative max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/wibu"
            className="text-sm font-bold mb-1 inline-block transition-opacity hover:opacity-70"
            style={{ color: "var(--color-text-muted)" }}
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--color-text-bold)" }}>
            ✏️ Edit Konten Halaman
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Perubahan akan langsung terlihat di halaman publik setelah disimpan.
          </p>
        </div>

        {/* Tabs */}
        <div
          className="flex flex-wrap gap-2 mb-6 p-1.5 rounded-2xl"
          style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
          role="tablist"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
              style={
                activeTab === tab.id
                  ? { backgroundColor: "var(--color-primary)", color: "#fff" }
                  : { color: "var(--color-text-muted)" }
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div role="tabpanel">
          {activeTab === "tiers" && <TiersTab onToast={showToast} />}
          {activeTab === "landing" && <LandingTab onToast={showToast} />}
          {activeTab === "wiki" && <WikiTab onToast={showToast} />}
          {activeTab === "tentang" && <TentangTab onToast={showToast} />}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}
