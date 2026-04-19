import type { Metadata } from "next";
import Link from "next/link";
import { PublicNavbar, PublicFooter } from "@/components/PublicNav";
import { createServerClient } from "@/lib/supabase.server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Wiki Wibu — Panduan Dunia Anime & Manga | WibuQuiz",
  description:
    "Panduan lengkap dunia anime dan manga: FAQ wibu, penjelasan meme populer, dan timeline sejarah anime dari 1963 hingga sekarang. Belajar budaya wibu dengan cara yang seru!",
  keywords: ["wiki wibu","anime","manga","wibu","otaku","isekai","waifu","nakama","sejarah anime","budaya wibu"],
  openGraph: {
    title: "Wiki Wibu — Panduan Dunia Anime & Manga",
    description: "Panduan lengkap dunia anime dan manga: FAQ wibu, penjelasan meme populer, dan timeline sejarah anime.",
    type: "website",
  },
  alternates: { canonical: "https://seberapakamu.id/wibu/wiki" },
};

interface FaqItem { q: string; a: string }
interface MemeItem { term: string; emoji: string; definition: string }
interface TimelineItem { year: string; title: string; desc: string }

const DEFAULT_FAQS: FaqItem[] = [
  { q: "Apa itu wibu?", a: 'Wibu (atau "weeaboo") adalah sebutan untuk orang non-Jepang yang sangat terobsesi dengan budaya Jepang, terutama anime dan manga. Istilah ini awalnya bersifat negatif, tapi kini banyak yang memakainya dengan bangga sebagai identitas fandom. Kalau kamu hafal lagu opening anime lebih banyak dari lagu nasional, selamat datang di klub! 🎌' },
  { q: "Bedanya wibu sama weeb?", a: '"Weeb" adalah singkatan dari "weeaboo" dalam bahasa Inggris, sedangkan "wibu" adalah adaptasi pengucapannya dalam bahasa Indonesia.' },
  { q: "Apakah suka anime berarti wibu?", a: "Tidak otomatis! Menonton anime sesekali tidak langsung menjadikanmu wibu." },
  { q: "Apa itu purity test?", a: "Purity test adalah kuis yang mengukur seberapa dalam seseorang terlibat dalam suatu subkultur." },
  { q: "Bagaimana cara menghitung skor?", a: "Skor dihitung berdasarkan formula: Skor = Σ(bobot_soal × jawaban) / Skor_Maksimal × 100." },
];
const DEFAULT_MEMES: MemeItem[] = [
  { term: "Isekai", emoji: "🌀", definition: "Genre anime di mana karakter utama dipindahkan ke dunia lain." },
  { term: "Waifu", emoji: "💕", definition: 'Dari kata Jepang "waifu", merujuk pada karakter anime perempuan yang sangat disukai.' },
  { term: "Nakama", emoji: "🤝", definition: 'Kata Jepang untuk "teman" atau "kawan seperjuangan".' },
  { term: "Power of Friendship", emoji: "✨", definition: "Trope klasik anime di mana karakter mendapat kekuatan dari persahabatan." },
];
const DEFAULT_TIMELINE: TimelineItem[] = [
  { year: "1963", title: "Astro Boy", desc: "Anime TV pertama di dunia karya Osamu Tezuka." },
  { year: "1986", title: "Dragon Ball", desc: "Goku memulai petualangannya." },
  { year: "2002", title: "Naruto", desc: "Ninja oranye yang bikin jutaan anak berlari dengan tangan ke belakang." },
  { year: "2019", title: "Demon Slayer", desc: "Kimetsu no Yaiba dengan animasi Ufotable yang memukau." },
];

async function getWikiContent() {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("site_content")
      .select("key, value")
      .eq("module_slug", "wibu")
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

export default async function WikiPage() {
  const { faqs, memes, timeline } = await getWikiContent();
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <PublicNavbar />

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
              Wiki Wibu
            </h1>
            <p
              className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ color: "var(--color-text)" }}
            >
              Panduan lengkap dunia anime & manga — dari FAQ dasar sampai sejarah panjang industri anime. Belajar sambil ketawa! 🎌
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 px-4" style={{ backgroundColor: "var(--color-surface-alt)" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-center" style={{ color: "var(--color-text-bold)" }}>
              ❓ FAQ — Pertanyaan yang Sering Ditanya
            </h2>
            <p className="text-center text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
              Jawaban jujur untuk pertanyaan yang mungkin kamu malu tanyain langsung
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
              🔥 Meme Breakdown — Istilah Wibu yang Wajib Kamu Tahu
            </h2>
            <p className="text-center text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
              Biar kamu nggak bengong waktu wibu lain ngomong
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
              🕰️ Timeline Sejarah Anime
            </h2>
            <p className="text-center text-sm mb-10" style={{ color: "var(--color-text-muted)" }}>
              Dari Astro Boy sampai Jujutsu Kaisen — perjalanan panjang industri anime
            </p>
            <ol className="relative" aria-label="Timeline sejarah anime">
              {timeline.map((item, i) => (
                <li key={i} className="flex gap-4 sm:gap-6 mb-8 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0 shadow"
                      style={{ backgroundColor: i % 2 === 0 ? "var(--color-primary)" : "var(--color-accent)" }}
                    >
                      {item.year.slice(2)}
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
            <div className="text-4xl mb-3" aria-hidden="true">🎌</div>
            <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: "var(--color-text-bold)" }}>
              Sudah siap uji level wibu-mu?
            </h2>
            <p className="text-sm sm:text-base mb-6" style={{ color: "var(--color-text)" }}>
              Setelah baca wiki ini, kamu pasti makin penasaran ada di tier mana!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/wibu/username"
                className="px-8 py-3 rounded-full font-black text-white shadow-md transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                🚀 Mulai Kuis Sekarang
              </Link>
              <Link
                href="/wibu/tentang-wibu"
                className="px-8 py-3 rounded-full font-bold transition-colors hover:opacity-80"
                style={{ color: "var(--color-accent)", border: "2px solid var(--color-accent)" }}
              >
                ℹ️ Tentang Wibu
              </Link>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section
          className="py-8 px-4"
          style={{ backgroundColor: "var(--color-surface)", borderTop: "1px solid var(--color-border)" }}
        >
          <div className="max-w-3xl mx-auto">
            <h2 className="text-base font-black mb-3" style={{ color: "var(--color-text-bold)" }}>
              ⚖️ Disclaimer & Fair Use
            </h2>
            <div className="text-xs sm:text-sm leading-relaxed space-y-2" style={{ color: "var(--color-text-muted)" }}>
              <p>
                Konten pada halaman ini dibuat untuk tujuan edukasi dan hiburan semata. Semua nama anime, karakter, dan istilah yang disebutkan adalah milik pemegang hak cipta masing-masing (termasuk namun tidak terbatas pada Toei Animation, Shueisha, Kodansha, Aniplex, dan penerbit/studio terkait).
              </p>
              <p>
                Penggunaan nama dan referensi tersebut dilakukan berdasarkan prinsip <em>fair use</em> untuk tujuan komentar, kritik, dan edukasi. WibuQuiz tidak berafiliasi dengan, disponsori oleh, atau didukung oleh perusahaan-perusahaan tersebut.
              </p>
              <p>
                © 2026 WibuQuiz. Konten orisinal platform ini dilindungi hak cipta. Dilarang menyalin atau mendistribusikan ulang tanpa izin tertulis.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
