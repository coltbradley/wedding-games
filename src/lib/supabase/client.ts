"use client";

import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Browser Supabase client (anon key only — safe for the client). One cached
 * instance per page load.
 *
 * Sessions persist to localStorage, not cookies. The whole app is
 * client-rendered with no server-side auth reads, and localStorage survives
 * iOS Safari and standalone-PWA storage far more reliably than JS-set cookies,
 * which iOS caps and evicts. That is what makes "we'll remember you on this
 * phone" actually hold for a returning guest.
 */
export function createClient(): SupabaseClient {
  if (cached) return cached;
  cached = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    },
  );
  return cached;
}
