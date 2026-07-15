import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy-url.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key';
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error("CRITICAL: NEXT_PUBLIC_SUPABASE_URL is missing in the client bundle!");
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
