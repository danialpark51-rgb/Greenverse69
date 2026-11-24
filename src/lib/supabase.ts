import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Checks whether valid Supabase environment variables have been configured.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey !== 'your-anon-key'
);

if (!isSupabaseConfigured && import.meta.env.DEV) {
  console.warn(
    '[Greenverse Supabase] VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY are not configured. Create a .env.local file with your Supabase credentials.'
  );
}

/**
 * Reusable Supabase client for Greenverse.
 * Uses anon/public key only. Service role key must never be used in frontend.
 */
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
