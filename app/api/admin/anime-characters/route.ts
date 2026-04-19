import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase.server";
import { createAdminClient } from "@/lib/supabase";

// POST /api/admin/anime-characters — insert karakter baru (bypass RLS)
export async function POST(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as Record<string, unknown>;
  const admin = createAdminClient();
  const { error } = await admin.from("anime_characters").insert(body);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
