import { mockClient } from "./mock";
import { supabaseClient } from "./supabase";
import type { DataClient } from "./types";

export * from "./types";

/** Real backend kicks in automatically once Supabase env keys are present. */
export const isSupabaseEnabled =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * The shared guest code is OPTIONAL. Set NEXT_PUBLIC_EVENT_CODE to require it
 * (one code, printed on the invite, keeps strangers out). Leave it unset for
 * the simplest flow: tap your name, confirm, you're in — and the phone remembers
 * you after, so sign-in is a one-time thing per device either way.
 */
export const requiresEventCode = !!process.env.NEXT_PUBLIC_EVENT_CODE;

export const data: DataClient = isSupabaseEnabled ? supabaseClient : mockClient;
