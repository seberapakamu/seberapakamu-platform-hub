import { createServerClient } from "@/lib/supabase.server";
import { NextResponse } from "next/server";

// GET /api/admin/site-content?keys=tier_1,tier_2&module=wibu
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const keysParam = searchParams.get("keys");
  const moduleSlug = searchParams.get("module") || "wibu";

  const supabase = await createServerClient();
  let query = supabase
    .from("site_content")
    .select("key, value, updated_at")
    .eq("module_slug", moduleSlug);

  if (keysParam) {
    query = query.in("key", keysParam.split(",").map((k) => k.trim()));
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// PUT /api/admin/site-content — upsert one or many { key, value } pairs (admin only)
// Supports module_slug in body items or query param
export async function PUT(request: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const moduleSlug = searchParams.get("module") || "wibu";

  let body: { key: string; value: unknown } | { key: string; value: unknown }[];
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const rows = Array.isArray(body) ? body : [body];
  if (rows.some((r) => !r.key)) {
    return NextResponse.json({ error: "Setiap item harus punya key" }, { status: 400 });
  }

  const { error } = await supabase
    .from("site_content")
    .upsert(
      rows.map((r) => ({ key: r.key, value: r.value, module_slug: moduleSlug })),
      { onConflict: "key,module_slug" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
