import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return createBrowserClient(
    supabaseUrl || 'http://localhost:54321',
    supabaseKey || 'missing-supabase-publishable-key'
  );
}
