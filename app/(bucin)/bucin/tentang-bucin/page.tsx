import type { Metadata } from "next";
import Link from "next/link";
import { BucinNavbar, BucinFooter } from "@/components/bucin/BucinNav";
import { createServerClient } from "@/lib/supabase.server";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Tentang Bucin — Apa Itu Bucin dan Tingkatannya? | BucinQuiz",
  description:
    "Pelajari apa itu bucin, tingkatan bucin dari Hati Es hingga Budak Cinta Sejati, dan FAQ tentang platform BucinQuiz. Panduan percintaan yang seru dan relate abis!",
  keywords: ["tentang bucin","apa itu bucin","tingkatan bucin","budak cinta","bucin quiz","purity test cinta","tes bucin"],
  openGraph: {
    title: "Tentang Bucin — Apa Itu Bucin dan Tingkatannya?",
    description: "Pelajari apa itu bucin, tingkatan bucin, dan FAQ tentang platform BucinQuiz.",
    type: "website",
  },
  alternates: { canonical: "https://seberapakamu.id/bucin/tentang-bucin" },
};

interface FaqItem { q: string; a: string }
interface TentangTierItem { rank: number; name: string; emoji: string; range: string; desc: string }
interface TentangIntro { title: string; paragraphs: string[] }

const DEFAULT_INTRO: TentangIntro = {
  title: "Apa Itu Bucin?",
  paragraphs: [
    'Bucin adalah singkatan dari "Budak Cinta", sebuah istilah gaul Indonesia untuk mendeskripsikan seseorang yang sedang dimabuk asmara hingga rela melakukan apa saja demi pasangannya.',
    "Terkadang, menjadi bucin itu lucu dan romantis, tapi kalau sudah kelewatan, bisa jadi red flag dan merugikan diri sendiri lho! Makanya penting buat tahu di mana batas kewajaranmu.",
    "Dari yang cuek bebek sampai yang rela ngutang demi beliin ayang hadiah mahal—semua ada tingkatannya, dan kuis ini akan mengukur sedalam apa kamu sudah jatuh cinta. 💘",
  ],
};
const DEFAULT_TIERS: TentangTierItem[] = [
  { rank: 1, name: "Hati Es", emoji: "🧊", range: "0–19%", desc: "Logika di atas segalanya. Kamu susah jatuh cinta atau memang terlalu rasional." },
  { rank: 2, name: "Normal", emoji: "😊", range: "20–39%", desc: "Sayang sewajarnya. Kamu peduli tapi tetap punya batasan yang sehat." },
  { rank: 3, name: "Bucin Pemula", emoji: "🥺", range: "40–59%", desc: "Mulai sering overthinking dan kompromi demi ayang. Hati-hati bablas!" },
  { rank: 4, name: "Bucin Akut", emoji: "😍", range: "60–79%", desc: "Dunia milik berdua. Prioritas utamamu adalah dia, teman mah nomor dua." },
  { rank: 5, name: "Budak Cinta Sejati", emoji: "🧎‍♂️", range: "80–100%", desc: "Totalitas tanpa batas. Hati-hati jangan sampai kehilangan jati dirimu sendiri ya!" },
];
const DEFAULT_FAQS: FaqItem[] = [
  { q: "Apakah jawaban kuis saya disebar?", a: "Tentu tidak! Jawaban kuis kamu bersifat anonim dan hanya tersimpan di perangkatmu sendiri." },
  { q: "Apakah hasil kuis ini valid secara psikologis?", a: "Kuis ini dibuat murni untuk hiburan seru-seruan bareng teman atau pasangan, bukan tes psikologi klinis." },
  { q: "Berapa lama waktu untuk menyelesaikan kuis?", a: "Cuma butuh waktu 2-3 menit kok untuk menjawab 25 pertanyaan Ya/Tidak." },
  { q: "Bisakah saya pamer hasil ke pasangan?", a: "Sangat disarankan! Setelah selesai, kamu bisa klik tombol Share ke WhatsApp atau download kartunya." },
];

const tierColors = ["var(--color-info)", "var(--color-success)", "var(--color-warning)", "var(--color-accent)", "var(--color-primary)"];

async function getTentangContent() {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("site_content")
      .select("key, value")
      .eq("module_slug", "bucin")
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

export default async function TentangBucinPage() {
  const { intro, tiers, faqs } = await getTentangContent();
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
            <div className="text-5xl sm:text-6xl mb-4" aria-hidden="true">💘</div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-4"
              style={{ color: "var(--color-text-bold)" }}
            >
              Tentang Bucin
            </h1>
            <p
              className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ color: "var(--color-text)" }}
            >
              Cari tahu apa itu bucin, tingkatan bucin dari yang normal sampai yang ekstrem, dan informasi seputar kuis ini. 💕
            </p>
          </div>
        </section>

        {/* Apa Itu Bucin */}
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

        {/* Tingkatan Bucin */}
        <section className="py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black mb-2 text-center" style={{ color: "var(--color-text-bold)" }}>
              ⭐ Tingkatan Bucin
            </h2>
            <p className="text-center text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
              5 tier yang menentukan seberapa mabuk asmaranya dirimu
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
              ❓ FAQ Kuis
            </h2>
            <p className="text-center text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
              Pertanyaan yang sering ditanya tentang BucinQuiz
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
            <div className="text-4xl mb-3" aria-hidden="true">💖</div>
            <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: "var(--color-text-bold)" }}>
              Kamu ada di tier mana?
            </h2>
            <p className="text-sm sm:text-base mb-6" style={{ color: "var(--color-text)" }}>
              Sudah tahu semua tingkatannya — sekarang saatnya buktikan posisimu!
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
                href="/bucin/wiki"
                className="px-8 py-3 rounded-full font-bold transition-colors hover:opacity-80"
                style={{ color: "var(--color-accent)", border: "2px solid var(--color-accent)" }}
              >
                📖 Baca Wiki Bucin
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
              ⚖️ Disclaimer & Privacy
            </h2>
            <div className="text-xs sm:text-sm leading-relaxed space-y-2" style={{ color: "var(--color-text-muted)" }}>
              <p>
                Platform BucinQuiz dibuat semata-mata untuk tujuan hiburan. Kuis ini tidak memiliki dasar psikologis klinis. Hasil kuis bersifat hiburan dan tidak ditujukan sebagai nasihat hubungan atau asesmen psikologis.
              </p>
              <p>
                © {new Date().getFullYear()} BucinQuiz by Seberapa Kamu. Semua hak cipta dilindungi undang-undang.
              </p>
            </div>
          </div>
        </section>
      </main>

      <BucinFooter />
    </div>
  );
}
