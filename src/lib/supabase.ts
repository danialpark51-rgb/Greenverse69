import { createClient } from '@supabase/supabase-js';

// Read environment variables (Vite standard)
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Production project fallback to ensure the app never connects to dummy/placeholder domains
const DEFAULT_SUPABASE_URL = 'https://tviitmmavipnswffagqm.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_OHi7-ae0S_HWObZy1hZ2xw_7XQsUMjw';

// Resolve configuration: prefer explicit environment variables; fall back to the project default
const resolvedUrl = (envUrl && !envUrl.includes('placeholder') && envUrl !== 'https://your-project.supabase.co')
  ? envUrl
  : DEFAULT_SUPABASE_URL;

const resolvedAnonKey = (envAnonKey && !envAnonKey.includes('placeholder') && envAnonKey !== 'your-anon-key')
  ? envAnonKey
  : DEFAULT_SUPABASE_ANON_KEY;

/**
 * Checks whether valid Supabase configuration is present.
 */
export const isSupabaseConfigured = Boolean(
  resolvedUrl &&
  resolvedAnonKey &&
  !resolvedUrl.includes('placeholder') &&
  !resolvedAnonKey.includes('placeholder')
);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[Greenverse Supabase] Supabase environment variables are missing. Using fallback safe mode.'
  );
}

/**
 * Centralized Supabase client for Greenverse.
 * Always targets the valid Supabase project URL.
 * Uses publishable/anon key only. Service role key is never used on the frontend.
 */
export const supabase = createClient(
  resolvedUrl,
  resolvedAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'greenverse-auth-token',
    },
  }
);
