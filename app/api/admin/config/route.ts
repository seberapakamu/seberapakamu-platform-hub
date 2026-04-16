import { createServerClient } from "@/lib/supabase.server";
import { NextResponse } from "next/server";

async function getAuthenticatedUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// GET /api/admin/config — read all config entries
export async function GET() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.from("quiz_config").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/admin/config — upsert config key/value pairs (admin only)
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const adminClient = await createServerClient();
  const upserts = Object.entries(body).map(([key, value]) => ({ key, value }));

  const { error } = await adminClient
    .from("quiz_config")
    .upsert(upserts, { onConflict: "key" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
