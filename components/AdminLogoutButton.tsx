"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";

export default function AdminLogoutButton() {
  const router = useRouter();
  const supabase = createBrowserClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/admin/login");
  }

  return (
    <button
      onClick={handleLogout}
      className="px-5 py-2.5 rounded-2xl text-sm font-black text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
      style={{ backgroundColor: "var(--color-error)" }}
    >
      Logout 🚪
    </button>
  );
}
