import { createServerClient } from "@/lib/supabase.server";
import { NextResponse } from "next/server";

async function getAuthenticatedUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// GET /api/admin/config — read config entries
// Supports ?module=wibu|bucin to filter by module_slug
export async function GET(request: Request) {
  const supabase = await createServerClient();
  const { searchParams } = new URL(request.url);
  const moduleSlug = searchParams.get("module") || "wibu";

  const { data, error } = await supabase
    .from("quiz_config")
    .select("*")
    .eq("module_slug", moduleSlug);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/admin/config — upsert config key/value pairs (admin only)
// Supports module_slug in body
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const moduleSlug = body._module_slug || "wibu";
  // Remove the meta field before upserting
  const entries = Object.entries(body).filter(([key]) => key !== "_module_slug");

  const adminClient = await createServerClient();
  const upserts = entries.map(([key, value]) => ({ key, value, module_slug: moduleSlug }));

  const { error } = await adminClient
    .from("quiz_config")
    .upsert(upserts, { onConflict: "key,module_slug" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
