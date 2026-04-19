import type { Metadata } from "next";
import Link from "next/link";
import { BucinNavbar, BucinFooter } from "@/components/bucin/BucinNav";
import { createServerClient } from "@/lib/supabase.server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Wiki Bucin — Kamus Dunia Asmara & Percintaan | BucinQuiz",
  description:
    "Panduan lengkap dunia percintaan: FAQ bucin, penjelasan istilah gaul asmara populer, dan red flags dalam hubungan.",
  keywords: ["wiki bucin","cinta","asmara","bucin","ghosting","red flag","green flag","relationship"],
  openGraph: {
    title: "Wiki Bucin — Kamus Dunia Asmara & Percintaan",
    description: "Panduan lengkap dunia percintaan: FAQ bucin, penjelasan istilah gaul asmara, dan red flags.",
    type: "website",
  },
  alternates: { canonical: "https://seberapakamu.id/bucin/wiki" },
};

interface FaqItem { q: string; a: string }
interface MemeItem { term: string; emoji: string; definition: string }
interface TimelineItem { year: string; title: string; desc: string }

const DEFAULT_FAQS: FaqItem[] = [
  { q: "Apa itu bucin?", a: 'Bucin (Budak Cinta) adalah sebutan untuk seseorang yang rela melakukan apa saja demi pasangannya, sampai-sampai terkadang melupakan logika atau prioritas pribadinya.' },
  { q: "Apakah menjadi bucin itu salah?", a: "Tergantung levelnya! Bucin sewajarnya wajar sebagai bentuk kasih sayang, tapi kalau sudah merugikan diri sendiri atau membatasi kehidupan sosial, itu toxic." },
  { q: "Apa itu purity test?", a: "Purity test adalah kuis jujur-jujuran yang mengukur seberapa ekstrem perilaku kebucinanmu." },
  { q: "Bagaimana cara mendapat skor tinggi?", a: "Jawablah dengan jujur! Semakin banyak hal-hal ekstrem yang kamu lakukan demi cinta, semakin tinggi skormu." },
];

const DEFAULT_MEMES: MemeItem[] = [
  { term: "Ghosting", emoji: "👻", definition: "Tiba-tiba menghilang tanpa kabar setelah sempat dekat atau PDKT." },
  { term: "Red Flag", emoji: "🚩", definition: "Tanda-tanda bahaya dalam sifat atau perilaku seseorang yang menandakan dia kurang baik untuk dijadikan pasangan." },
  { term: "Green Flag", emoji: "🟩", definition: "Tanda-tanda positif yang menunjukkan seseorang adalah pasangan yang sehat dan suportif." },
  { term: "Love Bombing", emoji: "💣", definition: "Memberikan perhatian atau hadiah yang sangat berlebihan di awal PDKT untuk memanipulasi perasaan." },
];

const DEFAULT_TIMELINE: TimelineItem[] = [
  { year: "Phase 1", title: "PDKT / Talking Stage", desc: "Masa-masa penjajakan. Masih jaim, sering overthinking kalau chat lama dibalas." },
  { year: "Phase 2", title: "Honeymoon Phase", desc: "Awal-awal jadian. Dunia serasa milik berdua, lagi mabuk asmara." },
  { year: "Phase 3", title: "Comfort Zone", desc: "Sudah mulai terbiasa satu sama lain, sifat asli mulai terlihat, butuh kompromi." },
  { year: "Phase 4", title: "Commitment / Drama", desc: "Bisa berlanjut ke jenjang lebih serius, atau malah kandas karena ketidakcocokan." },
];

async function getWikiContent() {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("site_content")
      .select("key, value")
      .eq("module_slug", "bucin")
      .in("key", ["wiki_faqs", "wiki_memes", "wiki_timeline"]);
    const get = (key: string) => data?.find((r) => r.key === key)?.value;
    return {
      faqs: (get("wiki_faqs") as FaqItem[]) ?? DEFAULT_FAQS,
      memes: (get("wiki_memes") as MemeItem[]) ?? DEFAULT_MEMES,
      timeline: (get("wiki_timeline") as TimelineItem[]) ?? DEFAULT_TIMELINE,
    };
  } catch {
    return { faqs: DEFAULT_FAQS, memes: DEFAULT_MEMES, timeline: DEFAULT_TIMELINE };
  }
}

export default async function WikiBucinPage() {
  const { faqs, memes, timeline } = await getWikiContent();
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <BucinNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden py-12 sm:py-16 px-4 text-center">
          <div
            className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ backgroundColor: "var(--color-primary)" }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ backgroundColor: "var(--color-accent)" }}
            aria-hidden="true"
          />
          <div className="relative max-w-3xl mx-auto">
            <div className="text-5xl sm:text-6xl mb-4" aria-hidden="true">📖</div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4"
              style={{ color: "var(--color-text-bold)" }}
            >
              Wiki Bucin
            </h1>
            <p
              className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ color: "var(--color-text)" }}
            >
              Kamus lengkap seputar dunia asmara — dari FAQ dasar sampai istilah gaul percintaan yang wajib kamu tahu! 💕
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 px-4" style={{ backgroundColor: "var(--color-surface-alt)" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-center" style={{ color: "var(--color-text-bold)" }}>
              ❓ FAQ Bucin
            </h2>
            <p className="text-center text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
              Pertanyaan yang sering ditanyakan seputar kebucinan
            </p>
            <div className="flex flex-col gap-4">
              {faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-5 sm:p-6 shadow-sm"
                  style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                >
                  <h3 className="font-black text-base sm:text-lg mb-2" style={{ color: "var(--color-primary)" }}>
                    Q: {faq.q}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed" style={{ color: "var(--color-text)" }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Meme Breakdown Section */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-center" style={{ color: "var(--color-text-bold)" }}>
              🚩 Kamus Istilah Asmara
            </h2>
            <p className="text-center text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
              Biar kamu nggak salah tangkap maksud si dia
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {memes.map((meme, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col gap-3"
                  style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl" aria-hidden="true">{meme.emoji}</span>
                    <span
                      className="text-lg sm:text-xl font-black px-3 py-1 rounded-full"
                      style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-primary-dark)" }}
                    >
                      {meme.term}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                    {meme.definition}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Timeline */}
        <section className="py-12 px-4" style={{ backgroundColor: "var(--color-surface-alt)" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-center" style={{ color: "var(--color-text-bold)" }}>
              🕰️ Fase Hubungan (Relationship Timeline)
            </h2>
            <p className="text-center text-sm mb-10" style={{ color: "var(--color-text-muted)" }}>
              Dari awal kenal sampai bikin komitmen
            </p>
            <ol className="relative" aria-label="Timeline hubungan">
              {timeline.map((item, i) => (
                <li key={i} className="flex gap-4 sm:gap-6 mb-8 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0 shadow"
                      style={{ backgroundColor: i % 2 === 0 ? "var(--color-primary)" : "var(--color-accent)" }}
                    >
                      {i + 1}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className="w-0.5 flex-1 mt-2" style={{ backgroundColor: "var(--color-border)" }} aria-hidden="true" />
                    )}
                  </div>
                  <div
                    className="rounded-2xl p-4 sm:p-5 shadow-sm flex-1 mb-2"
                    style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-primary-dark)" }}
                      >
                        {item.year}
                      </span>
                      <span className="font-black text-sm sm:text-base" style={{ color: "var(--color-text-bold)" }}>
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                      {item.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 px-4 text-center">
          <div className="max-w-xl mx-auto">
            <div className="text-4xl mb-3" aria-hidden="true">💘</div>
            <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: "var(--color-text-bold)" }}>
              Sudah siap uji level kebucinanmu?
            </h2>
            <p className="text-sm sm:text-base mb-6" style={{ color: "var(--color-text)" }}>
              Setelah baca wiki ini, kamu pasti makin penasaran ada di tier mana!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/bucin/username"
                className="px-8 py-3 rounded-full font-black text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                🚀 Mulai Kuis Sekarang
              </Link>
              <Link
                href="/bucin/tentang-bucin"
                className="px-8 py-3 rounded-full font-bold transition-colors hover:opacity-80"
                style={{ color: "var(--color-accent)", border: "2px solid var(--color-accent)" }}
              >
                ℹ️ Tentang BucinQuiz
              </Link>
            </div>
          </div>
        </section>
      </main>

      <BucinFooter />
    </div>
  );
}
