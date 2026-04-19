import type { Metadata } from "next";
import Link from "next/link";
import { PublicNavbar, PublicFooter } from "@/components/PublicNav";
import { createServerClient } from "@/lib/supabase.server";

// ISR: revalidate every 60 seconds for near-real-time stats
export const revalidate = 60;

export const metadata: Metadata = {
  alternates: {
    canonical: "https://seberapakamu.id/wibu",
  },
};

interface HeroData { title: string; subtitle: string; ctaPrimary: string; ctaSecondary: string }
interface CtaData { title: string; subtitle: string; buttonText: string }
interface HowItWorksItem { step: string; emoji: string; title: string; desc: string }
interface QuizListItem { id: string; title: string; description: string; questionCount: number; emoji: string; badge: string }

const DEFAULT_HERO: HeroData = {
  title: "Seberapa Wibu Kamu?",
  subtitle: "Uji tingkat kewibuan kamu dengan kuis interaktif yang seru dan jujur! Dari casual watcher sampai sepuh wibu — kamu ada di level mana? 👀",
  ctaPrimary: "🚀 Mulai Kuis Sekarang!",
  ctaSecondary: "📖 Pelajari Lebih Lanjut",
};
const DEFAULT_CTA: CtaData = { title: "Siap buktikan level wibu-mu?", subtitle: "Jangan takut jujur — hasilnya dijamin bikin ngakak! 😂", buttonText: "🚀 Mulai Kuis Gratis!" };
const DEFAULT_HOW: HowItWorksItem[] = [
  { step: "1", emoji: "✏️", title: "Isi Username", desc: "Masukkan nama panggilanmu biar kartu hasil makin personal!" },
  { step: "2", emoji: "🎮", title: "Jawab Kuis", desc: "Jawab 35 pertanyaan jujur seputar dunia anime dan wibu." },
  { step: "3", emoji: "🏆", title: "Lihat Hasilmu", desc: "Dapatkan skor, tier wibu, dan kartu hasil yang bisa dibagikan!" },
];
const DEFAULT_QUIZ_LIST: QuizListItem[] = [
  { id: "wibu-purity-test", title: "Wibu Purity Test 🎌", description: "Seberapa dalam kamu tenggelam di dunia anime? Jawab 35 pertanyaan jujur seputar tontonan, koleksi, bahasa, dan komunitas wibu-mu!", questionCount: 35, emoji: "🌸", badge: "Populer" },
  { id: "tebak-karakter", title: "Tebak Karakter Anime 🎭", description: "Tebak nama karakter anime dari petunjuk bertahap — siluet, kutipan, kekuatan, hingga asal anime. Semakin sedikit petunjuk, semakin tinggi skor!", questionCount: 10, emoji: "🎭", badge: "Baru" },
];

async function getSiteContent() {
  try {
    const supabase = await createServerClient();
    // Hitung semua pengguna kuis (wibu purity test + tebak karakter)
    const { count: total } = await supabase.from("sessions").select("*", { count: "exact", head: true });
    const { data: contentRows } = await supabase
      .from("site_content")
      .select("key, value")
      .in("key", ["landing_hero", "landing_cta", "landing_how_it_works", "landing_quiz_list", "landing_stats_offset"]);

    const get = (key: string) => contentRows?.find((r) => r.key === key)?.value;
    return {
      total: total ?? 0,
      hero: (get("landing_hero") as HeroData) ?? DEFAULT_HERO,
      cta: (get("landing_cta") as CtaData) ?? DEFAULT_CTA,
      howItWorks: (get("landing_how_it_works") as HowItWorksItem[]) ?? DEFAULT_HOW,
      quizList: (get("landing_quiz_list") as QuizListItem[]) ?? DEFAULT_QUIZ_LIST,
      statsOffset: ((get("landing_stats_offset") as { offset: number }) ?? { offset: 1200 }).offset,
    };
  } catch {
    return { total: 0, hero: DEFAULT_HERO, cta: DEFAULT_CTA, howItWorks: DEFAULT_HOW, quizList: DEFAULT_QUIZ_LIST, statsOffset: 1200 };
  }
}

export default async function WibuHomePage() {
  const { total, hero, cta, howItWorks, quizList, statsOffset } = await getSiteContent();

  const displayTotal = total + statsOffset;

  const stats = [
    {
      value: `${displayTotal.toLocaleString("id-ID")}+`,
      label: "Pengguna telah ikut kuis",
      emoji: "👥",
    },
    { value: String(quizList[0]?.questionCount ?? 35), label: "Pertanyaan seru", emoji: "❓" },
    { value: "5", label: "Level tier wibu", emoji: "⭐" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <PublicNavbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 px-4 text-center">
          {/* Decorative blobs */}
          <div
            className="absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
            style={{ backgroundColor: "var(--color-primary)" }}
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
            style={{ backgroundColor: "var(--color-accent)" }}
            aria-hidden="true"
          />

          <div className="relative max-w-3xl mx-auto">
            <div className="text-6xl mb-4" aria-hidden="true">🎌</div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-4"
              style={{ color: "var(--color-text-bold)" }}
            >
              {hero.title}
            </h1>
            <p
              className="text-lg sm:text-xl max-w-xl mx-auto mb-8 leading-relaxed"
              style={{ color: "var(--color-text)" }}
            >
              {hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a
                href="#kuis"
                className="px-8 py-4 rounded-full text-lg font-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {hero.ctaPrimary}
              </a>
              <Link
                href="/wibu/wiki"
                className="px-8 py-4 rounded-full text-lg font-bold transition-colors hover:opacity-80"
                style={{
                  color: "var(--color-accent)",
                  border: "2px solid var(--color-accent)",
                }}
              >
                {hero.ctaSecondary}
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 px-4" style={{ backgroundColor: "var(--color-surface-alt)" }}>
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-center text-2xl font-black mb-8"
              style={{ color: "var(--color-text-bold)" }}
            >
              Bergabung dengan ribuan wibu lainnya! 🎉
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-6 text-center shadow-sm"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="text-4xl mb-2" aria-hidden="true">{stat.emoji}</div>
                  <div
                    className="text-3xl font-black mb-1"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quiz List Section */}
        <section id="kuis" className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-3xl font-black text-center mb-2"
              style={{ color: "var(--color-text-bold)" }}
            >
              Kuis Tersedia 🎮
            </h2>
            <p
              className="text-center mb-10"
              style={{ color: "var(--color-text-muted)" }}
            >
              Pilih kuis dan buktikan level wibu-mu!
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quizList.map((quiz) => (
                <div
                  key={quiz.id}
                  className="rounded-2xl p-6 shadow-sm flex flex-col gap-4 transition-transform hover:-translate-y-1"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-4xl" aria-hidden="true">{quiz.emoji}</div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        backgroundColor: "var(--color-secondary)",
                        color: "var(--color-primary-dark)",
                      }}
                    >
                      {quiz.badge}
                    </span>
                  </div>
                  <div>
                    <h3
                      className="text-xl font-black mb-2"
                      style={{ color: "var(--color-text-bold)" }}
                    >
                      {quiz.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-text)" }}
                    >
                      {quiz.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      📝 {quiz.questionCount} pertanyaan
                    </span>
                    <Link
                      href={quiz.id === "tebak-karakter" ? "/wibu/tebak-username" : "/wibu/username"}
                      className="px-5 py-2 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "var(--color-accent)" }}
                    >
                      Mulai →
                    </Link>
                  </div>
                </div>
              ))}

            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          className="py-16 px-4"
          style={{ backgroundColor: "var(--color-surface-alt)" }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <h2
              className="text-3xl font-black mb-2"
              style={{ color: "var(--color-text-bold)" }}
            >
              Cara Main 🎯
            </h2>
            <p
              className="mb-10"
              style={{ color: "var(--color-text-muted)" }}
            >
              Gampang banget, cuma 3 langkah!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {howItWorks.map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl p-6 shadow-sm"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-lg mx-auto mb-3"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    {item.step}
                  </div>
                  <div className="text-3xl mb-2" aria-hidden="true">{item.emoji}</div>
                  <h3
                    className="font-black text-lg mb-1"
                    style={{ color: "var(--color-text-bold)" }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--color-text)" }}
                  >
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="text-5xl mb-4" aria-hidden="true">🌸</div>
            <h2
              className="text-3xl sm:text-4xl font-black mb-4"
              style={{ color: "var(--color-text-bold)" }}
            >
              {cta.title}
            </h2>
            <p
              className="text-lg mb-8"
              style={{ color: "var(--color-text)" }}
            >
              {cta.subtitle}
            </p>
            <Link
              href="/wibu/username"
              className="inline-block px-10 py-4 rounded-full text-xl font-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              {cta.buttonText}
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
