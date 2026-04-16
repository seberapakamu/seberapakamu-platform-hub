import { createBrowserClient } from "@/lib/supabase";

const STORAGE_KEY = "wibu_supabase_session_id";

/**
 * Insert a new session row and return its id.
 * Requires username and hash (both NOT NULL in schema).
 * Stores the id in localStorage for later updates.
 */
export async function recordSessionStarted(
  username: string,
  hash: string
): Promise<string | null> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("sessions")
      .insert({ username, hash })
      .select("id")
      .single();

    if (error) {
      console.error("[sessionTracking] recordSessionStarted error:", error.message);
      return null;
    }

    const id = data?.id as string;
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id ?? null;
  } catch (err) {
    console.error("[sessionTracking] recordSessionStarted unexpected error:", err);
    return null;
  }
}

/**
 * Update finished_at, score, and tier on the session row.
 */
export async function recordSessionFinished(
  supabaseSessionId: string,
  score: number,
  tier: number
): Promise<void> {
  try {
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from("sessions")
      .update({
        finished_at: new Date().toISOString(),
        score,
        tier: String(tier),
      })
      .eq("id", supabaseSessionId);

    if (error) {
      console.error("[sessionTracking] recordSessionFinished error:", error.message);
    }
  } catch (err) {
    console.error("[sessionTracking] recordSessionFinished unexpected error:", err);
  }
}

/**
 * Save a completed session to Supabase in one shot.
 * Used when we want to upsert the full result at finish time.
 * Returns the session id or null on failure.
 */
export async function saveCompletedSession(params: {
  hash: string;
  username: string;
  score: number;
  tier: string;
  startedAt: string;
  finishedAt: string;
  durationSeconds: number;
}): Promise<string | null> {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        hash: params.hash,
        username: params.username,
        score: params.score,
        tier: params.tier,
        started_at: params.startedAt,
        finished_at: params.finishedAt,
        duration_seconds: params.durationSeconds,
        share_clicked: false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[sessionTracking] saveCompletedSession error:", error.message);
      return null;
    }

    const id = data?.id as string;
    if (id) {
      localStorage.setItem(STORAGE_KEY, id);
    }
    return id ?? null;
  } catch (err) {
    console.error("[sessionTracking] saveCompletedSession unexpected error:", err);
    return null;
  }
}

/**
 * Update share_clicked = true on the session row.
 * Reads the session id from localStorage if not provided.
 */
export async function recordShareClicked(supabaseSessionId: string): Promise<void> {
  try {
    const supabase = createBrowserClient();
    const { error } = await supabase
      .from("sessions")
      .update({ share_clicked: true })
      .eq("id", supabaseSessionId);

    if (error) {
      console.error("[sessionTracking] recordShareClicked error:", error.message);
    }
  } catch (err) {
    console.error("[sessionTracking] recordShareClicked unexpected error:", err);
  }
}

/** Helper to read the stored Supabase session id from localStorage. */
export function getStoredSupabaseSessionId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
