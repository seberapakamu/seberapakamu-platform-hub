import { createServerClient } from "@/lib/supabase.server";
import { NextResponse } from "next/server";

export interface QuestionRow {
  id: number;
  teks: string;
  tipe: "ya_tidak" | "skala_1_5";
  kategori: "Tonton" | "Koleksi" | "Bahasa" | "Komunitas" | "Genre";
  bobot: number;
  opsi_jawaban: { nilai: number; label: string }[];
  aktif: boolean;
  created_at: string;
}

type QuestionPayload = Omit<QuestionRow, "id" | "created_at">;

function validatePayload(body: Partial<QuestionPayload>): string[] {
  const errors: string[] = [];
  if (!body.teks || body.teks.trim() === "") errors.push("teks wajib diisi");
  if (!body.tipe || !["ya_tidak", "skala_1_5"].includes(body.tipe))
    errors.push("tipe harus 'ya_tidak' atau 'skala_1_5'");
  if (
    !body.kategori ||
    !["Tonton", "Koleksi", "Bahasa", "Komunitas", "Genre"].includes(body.kategori)
  )
    errors.push("kategori harus salah satu dari: Tonton, Koleksi, Bahasa, Komunitas, Genre");
  if (body.bobot === undefined || body.bobot === null || isNaN(Number(body.bobot)))
    errors.push("bobot wajib diisi dan harus berupa angka");
  if (!body.opsi_jawaban || !Array.isArray(body.opsi_jawaban) || body.opsi_jawaban.length === 0)
    errors.push("opsi_jawaban wajib diisi dan tidak boleh kosong");
  return errors;
}

async function getAuthenticatedUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// GET /api/admin/questions — list all questions
// Authenticated admins see all; unauthenticated callers see active-only (via RLS)
export async function GET() {
  const user = await getAuthenticatedUser();
  const supabase = await createServerClient();

  const query = user
    ? supabase.from("questions").select("*").order("id", { ascending: true })
    : supabase.from("questions").select("*").eq("aktif", true).order("id", { ascending: true });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/admin/questions — create a new question (admin only)
export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Partial<QuestionPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const errors = validatePayload(body);
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 422 });

  const adminClient = await createServerClient();
  const { data, error } = await adminClient
    .from("questions")
    .insert({
      teks: body.teks!.trim(),
      tipe: body.tipe!,
      kategori: body.kategori!,
      bobot: Number(body.bobot),
      opsi_jawaban: body.opsi_jawaban!,
      aktif: body.aktif ?? true,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
