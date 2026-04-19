import { createServerClient } from "@/lib/supabase.server";
import { createAdminClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import Link from "next/link";
import { TIERS } from "@/lib/scoring";

const NAV_LINKS = [
  { href: "/admin/wibu/questions", label: "📝 Pertanyaan", desc: "Kelola soal kuis Wibu Purity Test" },
  { href: "/admin/wibu/content", label: "📚 Konten Blog", desc: "Kelola artikel blog" },
  { href: "/admin/wibu/site-content", label: "✏️ Edit Halaman", desc: "Edit konten landing, wiki, tier" },
  { href: "/admin/tebak-karakter/characters", label: "🎭 Tebak Karakter", desc: "Kelola karakter & konfigurasi kuis tebak" },
];

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m} menit ${s} detik`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default async function AdminDashboardPage() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const admin = createAdminClient();

  const [
    { count: totalStarted },
    { count: totalFinished },
    { count: totalShareClicked },
    { data: tierRows },
    { data: durationRows },
  ] = await Promise.all([
    admin.from("sessions").select("*", { count: "exact", head: true }),
    admin.from("sessions").select("*", { count: "exact", head: true }).not("finished_at", "is", null),
    admin.from("sessions").select("*", { count: "exact", head: true }).eq("share_clicked", true).not("finished_at", "is", null),
    admin.from("sessions").select("tier").not("tier", "is", null),
    admin.from("sessions").select("started_at, finished_at").not("finished_at", "is", null),
  ]);

  const started = totalStarted ?? 0;
  const finished = totalFinished ?? 0;
  const shareClicked = totalShareClicked ?? 0;

  const completionRate = started > 0 ? (finished / started) * 100 : 0;
  const shareRate = finished > 0 ? (shareClicked / finished) * 100 : 0;

  // Tier distribution
  const tierCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const row of tierRows ?? []) {
    const t = row.tier as number;
    if (t >= 1 && t <= 5) tierCounts[t]++;
  }
  const maxTierCount = Math.max(...Object.values(tierCounts), 1);

  // Average duration
  let avgDurationSeconds = 0;
  if (durationRows && durationRows.length > 0) {
    const totalSeconds = durationRows.reduce((sum, row) => {
      const start = new Date(row.started_at).getTime();
      const end = new Date(row.finished_at).getTime();
      return sum + (end - start) / 1000;
    }, 0);
    avgDurationSeconds = totalSeconds / durationRows.length;
  }

  const statCards = [
    { label: "Total Sesi Dimulai", value: started.toLocaleString("id-ID"), emoji: "🎮" },
    { label: "Total Sesi Selesai", value: finished.toLocaleString("id-ID"), emoji: "✅" },
    { label: "Completion Rate", value: formatPercent(completionRate), emoji: "📈" },
    { label: "Share Rate", value: formatPercent(shareRate), emoji: "🔗" },
    { label: "Rata-rata Durasi", value: finished > 0 ? formatDuration(avgDurationSeconds) : "—", emoji: "⏱️" },
  ];

  return (
    <div
      className="min-h-screen px-4 py-12"
      style={{ backgroundColor: "var(--color-bg)" }}
    >
      {/* Decorative blobs */}
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

      <div className="relative max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div
          className="rounded-3xl shadow-lg p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div>
            <div className="text-4xl mb-2" aria-hidden="true">🌸</div>
            <h1
              className="text-2xl sm:text-3xl font-black mb-1"
              style={{ color: "var(--color-text-bold)" }}
            >
              Dashboard Admin
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Selamat datang,{" "}
              <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                {user.email}
              </span>{" "}
              ✨
            </p>
          </div>
          <AdminLogoutButton />
        </div>

        {/* Stats grid */}
        <div>
          <h2
            className="text-lg font-black mb-3"
            style={{ color: "var(--color-text-bold)" }}
          >
            📊 Statistik Sesi
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {statCards.map(({ label, value, emoji }) => (
              <div
                key={label}
                className="rounded-3xl p-5 shadow-sm"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div className="text-2xl mb-1" aria-hidden="true">{emoji}</div>
                <div
                  className="text-xl font-black"
                  style={{ color: "var(--color-primary)" }}
                >
                  {value}
                </div>
                <div className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier distribution */}
        <div
          className="rounded-3xl p-6 shadow-sm"
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
          }}
        >
          <h2
            className="text-lg font-black mb-4"
            style={{ color: "var(--color-text-bold)" }}
          >
            🏅 Distribusi Tier
          </h2>
          <div className="space-y-3">
            {TIERS.map((tier) => {
              const count = tierCounts[tier.tier] ?? 0;
              const barWidth = maxTierCount > 0 ? (count / maxTierCount) * 100 : 0;
              return (
                <div key={tier.tier}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-sm font-bold"
                      style={{ color: "var(--color-text-bold)" }}
                    >
                      {tier.emoji} {tier.title}
                    </span>
                    <span
                      className="text-sm font-black"
                      style={{ color: "var(--color-primary)" }}
                    >
                      {count}
                    </span>
                  </div>
                  <div
                    className="w-full rounded-full h-3 overflow-hidden"
                    style={{ backgroundColor: "var(--color-border)" }}
                  >
                    <div
                      className="h-3 rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        backgroundColor: "var(--color-primary)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Nav cards */}
        <div>
          <h2
            className="text-lg font-black mb-3"
            style={{ color: "var(--color-text-bold)" }}
          >
            🗂️ Menu Admin
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {NAV_LINKS.map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="block rounded-3xl p-6 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <div
                  className="text-2xl font-black mb-1"
                  style={{ color: "var(--color-text-bold)" }}
                >
                  {label}
                </div>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
