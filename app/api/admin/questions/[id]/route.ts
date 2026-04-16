import { createServerClient } from "@/lib/supabase.server";
import { NextResponse } from "next/server";

type QuestionPayload = {
  teks?: string;
  tipe?: "ya_tidak" | "skala_1_5";
  kategori?: "Tonton" | "Koleksi" | "Bahasa" | "Komunitas" | "Genre";
  bobot?: number;
  opsi_jawaban?: { nilai: number; label: string }[];
  aktif?: boolean;
};

function validatePayload(body: QuestionPayload): string[] {
  const errors: string[] = [];
  if (body.teks !== undefined && body.teks.trim() === "") errors.push("teks tidak boleh kosong");
  if (body.tipe !== undefined && !["ya_tidak", "skala_1_5"].includes(body.tipe))
    errors.push("tipe harus 'ya_tidak' atau 'skala_1_5'");
  if (
    body.kategori !== undefined &&
    !["Tonton", "Koleksi", "Bahasa", "Komunitas", "Genre"].includes(body.kategori)
  )
    errors.push("kategori harus salah satu dari: Tonton, Koleksi, Bahasa, Komunitas, Genre");
  if (body.bobot !== undefined && isNaN(Number(body.bobot)))
    errors.push("bobot harus berupa angka");
  if (body.opsi_jawaban !== undefined && (!Array.isArray(body.opsi_jawaban) || body.opsi_jawaban.length === 0))
    errors.push("opsi_jawaban tidak boleh kosong");
  return errors;
}

async function getAuthenticatedUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// PUT /api/admin/questions/[id] — update a question
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  let body: QuestionPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const errors = validatePayload(body);
  if (errors.length > 0) return NextResponse.json({ errors }, { status: 422 });

  const updates: Record<string, unknown> = {};
  if (body.teks !== undefined) updates.teks = body.teks.trim();
  if (body.tipe !== undefined) updates.tipe = body.tipe;
  if (body.kategori !== undefined) updates.kategori = body.kategori;
  if (body.bobot !== undefined) updates.bobot = Number(body.bobot);
  if (body.opsi_jawaban !== undefined) updates.opsi_jawaban = body.opsi_jawaban;
  if (body.aktif !== undefined) updates.aktif = body.aktif;

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: "Tidak ada field yang diupdate" }, { status: 400 });

  const adminClient = await createServerClient();
  const { data, error } = await adminClient
    .from("questions")
    .update(updates)
    .eq("id", numId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Soal tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ data });
}

// DELETE /api/admin/questions/[id] — delete a question
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const numId = parseInt(id, 10);
  if (isNaN(numId)) return NextResponse.json({ error: "ID tidak valid" }, { status: 400 });

  const adminClient = await createServerClient();
  const { error } = await adminClient.from("questions").delete().eq("id", numId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
