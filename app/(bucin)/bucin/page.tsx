import type { Metadata } from "next";
import Link from "next/link";
import { BucinNavbar, BucinFooter } from "@/components/bucin/BucinNav";
import { createServerClient } from "@/lib/supabase.server";

export const revalidate = 60;

export const metadata: Metadata = {
  alternates: {
    canonical: "https://seberapakamu.id/bucin",
  },
};

const DEFAULT_HERO = {
  title: "Seberapa Bucin Kamu?",
  subtitle: "Uji tingkat kebucinan kamu dengan kuis Purity Test ini! Dari yang cuek bebek sampai budak cinta sejati, kamu ada di level mana? 😍",
  ctaPrimary: "💕 Mulai Kuis Sekarang!",
  ctaSecondary: "📖 Baca Wiki Bucin"
};

const DEFAULT_CTA = {
  title: "Berani lihat seberapa bucin dirimu?",
  subtitle: "Jangan takut jujur — hasilnya bisa jadi bahan ketawaan bareng teman-teman! 😂",
  buttonText: "💕 Gas Mulai!"
};

const DEFAULT_HOW_IT_WORKS = [
  { step: "1", emoji: "💌", title: "Isi Nama Panggilan", desc: "Masukkan namamu biar hasil kuisnya terasa lebih personal!" },
  { step: "2", emoji: "💘", title: "Jawab Jujur", desc: "Jawab serangkaian pertanyaan seputar hubungan asmaramu." },
  { step: "3", emoji: "📸", title: "Pamerkan Hasilnya", desc: "Bagikan kartu hasil kebucinanmu ke teman atau pasanganmu!" },
];

async function getLandingContent() {
  try {
    const supabase = await createServerClient();
    const { data } = await supabase
      .from("site_content")
      .select("key, value")
      .eq("module_slug", "bucin")
      .in("key", ["landing_hero", "landing_cta", "landing_how_it_works"]);
    
    const get = (key: string) => data?.find((r) => r.key === key)?.value;
    
    return {
      hero: (get("landing_hero") as typeof DEFAULT_HERO) ?? DEFAULT_HERO,
      cta: (get("landing_cta") as typeof DEFAULT_CTA) ?? DEFAULT_CTA,
      howItWorks: (get("landing_how_it_works") as typeof DEFAULT_HOW_IT_WORKS) ?? DEFAULT_HOW_IT_WORKS,
    };
  } catch {
    return { hero: DEFAULT_HERO, cta: DEFAULT_CTA, howItWorks: DEFAULT_HOW_IT_WORKS };
  }
}

export default async function BucinHomePage() {
  const { hero, cta, howItWorks } = await getLandingContent();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <BucinNavbar />

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
            {/* Heartbeat Animation */}
            <div className="text-6xl mb-4 animate-pulse" aria-hidden="true">💖</div>
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
              <Link
                href="/bucin/username"
                className="px-8 py-4 rounded-full text-lg font-black text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {hero.ctaPrimary}
              </Link>
              <Link
                href="/bucin/wiki"
                className="px-8 py-4 rounded-full text-lg font-bold transition-colors hover:opacity-80"
                style={{ color: "var(--color-accent)", border: "2px solid var(--color-accent)" }}
              >
                {hero.ctaSecondary}
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-3xl font-black text-center mb-12"
              style={{ color: "var(--color-text-bold)" }}
            >
              Cara Main 📖
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {howItWorks.map((item) => (
                <div key={item.step} className="text-center relative">
                  <div
                    className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-2xl font-black mb-4 shadow-sm"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      color: "var(--color-primary)",
                      border: "2px solid var(--color-border)",
                    }}
                  >
                    {item.step}
                  </div>
                  <div className="text-3xl mb-3" aria-hidden="true">{item.emoji}</div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: "var(--color-text-bold)" }}
                  >
                    {item.title}
                  </h3>
                  <p style={{ color: "var(--color-text-muted)" }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 text-center">
          <div
            className="max-w-3xl mx-auto rounded-3xl p-8 sm:p-12 shadow-lg"
            style={{
              background: "linear-gradient(135deg, var(--color-primary), var(--color-accent))",
            }}
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              {cta.title}
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-xl mx-auto">
              {cta.subtitle}
            </p>
            <Link
              href="/bucin/username"
              className="inline-block px-8 py-4 rounded-full text-lg font-black transition-transform hover:scale-105 active:scale-95"
              style={{
                backgroundColor: "var(--color-surface)",
                color: "var(--color-primary-dark)",
              }}
            >
              {cta.buttonText}
            </Link>
          </div>
        </section>
      </main>

      <BucinFooter />
    </div>
  );
}

