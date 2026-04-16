import type { Metadata } from "next";
import Link from "next/link";
import { PublicNavbar, PublicFooter } from "@/components/PublicNav";
import { createServerClient } from "@/lib/supabase.server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tentang Wibu — Apa Itu Wibu dan Budayanya? | WibuQuiz",
  description:
    "Pelajari apa itu wibu, tingkatan wibu dari Casual Watcher hingga Sepuh Wibu, dan FAQ tentang platform WibuQuiz. Panduan budaya anime Indonesia yang seru dan informatif!",
  keywords: ["tentang wibu","apa itu wibu","tingkatan wibu","casual watcher","otaku","sepuh wibu","budaya anime","wibu indonesia","wibu quiz"],
  openGraph: {
    title: "Tentang Wibu — Apa Itu Wibu dan Budayanya?",
    description: "Pelajari apa itu wibu, tingkatan wibu, dan FAQ tentang platform WibuQuiz.",
    type: "website",
  },
  alternates: { canonical: "https://seberapakamu.id/wibu/tentang-wibu" },
};

interface FaqItem { q: string; a: string }
interface TentangTierItem { rank: number; name: string; emoji: string; range: string; desc: string }
interface TentangIntro { title: string; paragraphs: string[] }

const DEFAULT_INTRO: TentangIntro = {
  title: "Apa Itu Wibu?",
  paragraphs: [
    'Wibu adalah sebutan untuk seseorang yang sangat mencintai budaya Jepang — terutama anime, manga, light novel, dan segala hal yang berbau Jepang. Istilah ini berasal dari kata "weeaboo" dalam bahasa Inggris, yang kemudian diadaptasi menjadi "wibu" dalam komunitas internet Indonesia.',
    "Dulu, istilah ini dipakai sebagai ejekan. Sekarang? Banyak yang memakainya dengan bangga sebagai identitas. Komunitas wibu Indonesia adalah salah satu yang terbesar di Asia Tenggara.",
    "Yang membedakan wibu dari penggemar anime biasa adalah intensitas: seberapa dalam kamu menyelami dunia ini. Semua ada spektrumnya — dan itulah yang kami ukur di sini! 🎯",
  ],
};
const DEFAULT_TIERS: TentangTierItem[] = [
  { rank: 1, name: "Casual Watcher", emoji: "👀", range: "0–20%", desc: "Kamu nonton anime sesekali, mungkin cuma yang lagi viral di Twitter." },
  { rank: 2, name: "Anime Enthusiast", emoji: "🌟", range: "21–40%", desc: "Kamu sudah punya list anime yang lumayan panjang." },
  { rank: 3, name: "Hardcore Otaku", emoji: "🎌", range: "41–60%", desc: "Kamu hafal opening anime lebih banyak dari lagu nasional." },
  { rank: 4, name: "Wibu Sejati", emoji: "🏆", range: "61–80%", desc: "Kamu sudah di level yang serius. Koleksi figure, body pillow, atau artbook? Check." },
  { rank: 5, name: "Sepuh Wibu", emoji: "👑", range: "81–100%", desc: "Kamu adalah legenda. Sudah nonton anime sejak era VHS bajakan." },
];
const DEFAULT_FAQS: FaqItem[] = [
  { q: "Apakah data saya disimpan?", a: "Jawaban kuis dan username kamu disimpan di localStorage browser-mu sendiri." },
  { q: "Apakah kuis ini akurat?", a: "Kuis ini dibuat untuk hiburan dan tidak memiliki dasar psikologis ilmiah." },
  { q: "Bisakah saya mengulang kuis?", a: "Tentu! Kamu bisa mengulang kuis kapan saja." },
  { q: "Bagaimana cara berbagi hasil?", a: "Setelah menyelesaikan kuis, kamu akan mendapatkan halaman hasil dengan link unik yang bisa dibagikan." },
];

const tierColors = ["var(--color-info)", "var(--color-success)", "var(--color-warning)", "var(--color-accent)", "var(--color-primary)"];

async function getTentangContent() {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("site_content")
      .select("key, value")
      .in("key", ["tentang_intro", "tentang_tiers", "tentang_platform_faqs"]);
    const get = (key: string) => data?.find((r) => r.key === key)?.value;
    return {
      intro: (get("tentang_intro") as TentangIntro) ?? DEFAULT_INTRO,
      tiers: (get("tentang_tiers") as TentangTierItem[]) ?? DEFAULT_TIERS,
      faqs: (get("tentang_platform_faqs") as FaqItem[]) ?? DEFAULT_FAQS,
    };
  } catch {
    return { intro: DEFAULT_INTRO, tiers: DEFAULT_TIERS, faqs: DEFAULT_FAQS };
  }
}

export default async function TentangWibuPage() {
  const { intro, tiers, faqs } = await getTentangContent();
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
            <div className="text-5xl sm:text-6xl mb-4" aria-hidden="true">🎌</div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4"
              style={{ color: "var(--color-text-bold)" }}
            >
              Tentang Wibu
            </h1>
            <p
              className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ color: "var(--color-text)" }}
            >
              Apa itu wibu, kenapa ada tingkatannya, dan kenapa kamu perlu tahu posisimu di antara mereka semua. 👀
            </p>
          </div>
        </section>

        {/* Apa Itu Wibu */}
        <section className="py-12 px-4" style={{ backgroundColor: "var(--color-surface-alt)" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-6 text-center" style={{ color: "var(--color-text-bold)" }}>
              🤔 {intro.title}
            </h2>
            <div
              className="rounded-2xl p-6 sm:p-8 shadow-sm"
              style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
            >
              {intro.paragraphs.map((par, i) => (
                <p key={i} className="text-sm sm:text-base leading-relaxed mb-4 last:mb-0" style={{ color: "var(--color-text)" }}>
                  {par}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Tingkatan Wibu */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-center" style={{ color: "var(--color-text-bold)" }}>
              ⭐ Tingkatan Wibu
            </h2>
            <p className="text-center text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
              5 tier yang menentukan posisimu di hierarki kewibuan
            </p>
            <div className="flex flex-col gap-4">
              {tiers.map((tier, i) => (
                <div
                  key={tier.rank}
                  className="rounded-2xl p-5 sm:p-6 shadow-sm flex gap-4 sm:gap-5 items-start"
                  style={{ backgroundColor: "var(--color-surface)", border: "1px solid var(--color-border)" }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shrink-0 shadow"
                    style={{ backgroundColor: tierColors[i] ?? "var(--color-primary)" }}
                    aria-hidden="true"
                  >
                    {tier.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xl" aria-hidden="true">{tier.emoji}</span>
                      <span className="font-black text-base sm:text-lg" style={{ color: "var(--color-text-bold)" }}>
                        {tier.name}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "var(--color-secondary)", color: "var(--color-primary-dark)" }}
                      >
                        {tier.range}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text)" }}>
                      {tier.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Platform */}
        <section className="py-12 px-4" style={{ backgroundColor: "var(--color-surface-alt)" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-center" style={{ color: "var(--color-text-bold)" }}>
              ❓ FAQ Tentang Platform
            </h2>
            <p className="text-center text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
              Pertanyaan yang sering ditanya tentang WibuQuiz
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

        {/* CTA */}
        <section className="py-12 px-4 text-center">
          <div className="max-w-xl mx-auto">
            <div className="text-4xl mb-3" aria-hidden="true">🌸</div>
            <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: "var(--color-text-bold)" }}>
              Kamu ada di tier mana?
            </h2>
            <p className="text-sm sm:text-base mb-6" style={{ color: "var(--color-text)" }}>
              Sudah tahu semua tingkatannya — sekarang saatnya buktikan posisimu!
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
                href="/wibu/wiki"
                className="px-8 py-3 rounded-full font-bold transition-colors hover:opacity-80"
                style={{ color: "var(--color-accent)", border: "2px solid var(--color-accent)" }}
              >
                📖 Baca Wiki
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
                Platform WibuQuiz dibuat untuk tujuan hiburan dan tidak berafiliasi dengan, disponsori oleh, atau didukung oleh perusahaan anime, manga, atau media Jepang mana pun. Semua nama karakter, judul anime, dan istilah yang disebutkan adalah milik pemegang hak cipta masing-masing.
              </p>
              <p>
                Kuis ini tidak memiliki dasar psikologis atau ilmiah. Hasil kuis bersifat hiburan semata dan tidak mencerminkan kepribadian, kecerdasan, atau nilai seseorang. Penggunaan referensi budaya populer dilakukan berdasarkan prinsip <em>fair use</em> untuk tujuan komentar dan hiburan.
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
