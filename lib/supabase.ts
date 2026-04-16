import { createClient } from "@supabase/supabase-js";
import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton browser client — reuse the same instance across all client components
let browserClient: ReturnType<typeof createSSRBrowserClient> | null = null;

export function createBrowserClient() {
  if (!browserClient) {
    browserClient = createSSRBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}

// Server-side client with service role (for admin routes only)
export function createAdminClient() {
  return createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
