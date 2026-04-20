"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { BucinNavbar, BucinFooter } from "@/components/bucin/BucinNav";

export default function CoupleSyncEntryPage() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createBrowserClient();

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!name) {
      setError("Isi nama kamu dulu ya!");
      return;
    }
    setLoading(true);
    setError("");

    const roomCode = generateCode();

    const { data, error: roomError } = await supabase
      .from("couple_rooms")
      .insert({
        code: roomCode,
        user1_name: name,
        status: "waiting",
      })
      .select()
      .single();

    if (roomError) {
      setError("Gagal membuat room. Coba lagi ya.");
      setLoading(false);
      return;
    }

    // Save user index to local storage/session if needed, or just pass it in URL/state
    // We'll use a search param or similar to identify user1 vs user2
    router.push(`/bucin/couple-sync/room/${roomCode}?u=1&name=${encodeURIComponent(name)}`);
  };

  const handleJoinRoom = async () => {
    if (!name || !code) {
      setError("Isi nama dan kode room ya!");
      return;
    }
    setLoading(true);
    setError("");

    const { data: room, error: roomError } = await supabase
      .from("couple_rooms")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (roomError || !room) {
      setError("Room tidak ditemukan. Cek lagi kodenya.");
      setLoading(false);
      return;
    }

    if (room.user2_name && room.user2_name !== name) {
      setError("Room ini sudah penuh!");
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("couple_rooms")
      .update({
        user2_name: name,
        status: "active",
      })
      .eq("id", room.id);

    if (updateError) {
      setError("Gagal join room.");
      setLoading(false);
      return;
    }

    router.push(`/bucin/couple-sync/room/${room.code}?u=2&name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
      <BucinNavbar />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div 
            className="rounded-3xl p-8 shadow-2xl border-4"
            style={{ 
              backgroundColor: "var(--color-surface)",
              borderColor: "var(--color-primary-light)",
            }}
          >
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">👩‍❤️‍👨</span>
              <h1 className="text-3xl font-black mb-2" style={{ color: "var(--color-text-bold)" }}>
                Couple Sync Test
              </h1>
              <p style={{ color: "var(--color-text-muted)" }}>
                Seberapa kompak kamu sama pasanganmu? Ayo uji di sini!
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-100 text-red-600 text-sm font-bold border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--color-text)" }}>
                  Nama Kamu
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi"
                  className="w-full px-5 py-4 rounded-2xl border-2 focus:outline-none focus:ring-4 transition-all"
                  style={{ 
                    backgroundColor: "var(--color-bg)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-bold)",
                  }}
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={handleCreateRoom}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  style={{ 
                    backgroundColor: "var(--color-primary)",
                    color: "white"
                  }}
                >
                  {loading ? "Menyiapkan Room..." : "Buat Room Baru ➕"}
                </button>

                <div className="relative py-4 flex items-center">
                  <div className="flex-grow border-t border-dashed" style={{ borderColor: "var(--color-border)" }}></div>
                  <span className="flex-shrink mx-4 text-sm font-bold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>Atau Join Room</span>
                  <div className="flex-grow border-t border-dashed" style={{ borderColor: "var(--color-border)" }}></div>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Masukkan Kode Room"
                    className="w-full px-5 py-4 rounded-2xl border-2 text-center font-black tracking-widest text-xl focus:outline-none focus:ring-4 transition-all"
                    style={{ 
                      backgroundColor: "var(--color-bg)",
                      borderColor: "var(--color-border)",
                      color: "var(--color-primary)",
                    }}
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={loading}
                    className="w-full py-4 rounded-2xl font-black text-lg border-2 transition-all hover:bg-opacity-10 active:scale-[0.98] disabled:opacity-50"
                    style={{ 
                      borderColor: "var(--color-primary)",
                      color: "var(--color-primary)"
                    }}
                  >
                    Join Room Sekarang 🤝
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <BucinFooter />
    </div>
  );
}
