import { createServerClient as createSSRServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server component / server action client (SSR-compatible with cookies)
// Import from this file only in Server Components, Route Handlers, and Server Actions
export async function createServerClient() {
  const cookieStore = await cookies();
  return createSSRServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — cookies are read-only, ignore
        }
      },
    },
  });
}
