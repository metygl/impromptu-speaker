import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { assertSupabaseServerConfig } from '@/lib/env';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = assertSupabaseServerConfig();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server components may not be able to set cookies; middleware handles refresh.
        }
      },
    },
  });
}
