import { PublicNavbar, PublicFooter } from "@/components/PublicNav";

export const BUCIN_NAV_LINKS = [
  { href: "/bucin/couple-sync", label: "👩‍❤️‍👨 Couple Sync" },
  { href: "/bucin/wiki", label: "📖 Wiki" },
  { href: "/bucin/tentang-bucin", label: "ℹ️ Tentang" },
  { href: "/blog?module=bucin", label: "✍️ Blog" },
];

export const BUCIN_FOOTER_LINKS = [
  { href: "/", label: "🏠 Hub" },
  { href: "/bucin", label: "💖 Beranda" },
  { href: "/bucin/couple-sync", label: "👩‍❤️‍👨 Couple Sync" },
  { href: "/bucin/wiki", label: "📖 Wiki" },
  { href: "/bucin/tentang-bucin", label: "ℹ️ Tentang" },
  { href: "/blog?module=bucin", label: "✍️ Blog" },
  { href: "/bucin/username", label: "💕 Mulai Kuis" },
];

export function BucinNavbar() {
  return (
    <PublicNavbar
      logoEmoji="💖"
      logoText="BucinQuiz"
      logoHref="/bucin"
      navLinks={BUCIN_NAV_LINKS}
      quizHref="/bucin/username"
      quizText="Mulai Kuis 💕"
    />
  );
}

export function BucinFooter() {
  return (
    <PublicFooter
      logoEmoji="💖"
      logoText="BucinQuiz"
      footerLinks={BUCIN_FOOTER_LINKS}
    />
  );
}
