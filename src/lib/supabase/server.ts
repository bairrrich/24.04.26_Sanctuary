import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase admin client with service role key (bypasses RLS)
 * Use only in server-side API routes that need elevated access.
 *
 * NOTE: Currently uses anon key since the service role key is not exposed
 * via NEXT_PUBLIC env vars. To enable full admin access, add
 * SUPABASE_SERVICE_ROLE_KEY to your .env file and reference it here.
 * With the service role key, this client bypasses Row Level Security.
 */
export async function createSupabaseAdminClient() {
  const cookieStore = await cookies();

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const key = serviceRoleKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      cookies: {
        getAll() {
          // Admin client doesn't need cookies for auth,
          // but we still read them for context
          return cookieStore.getAll();
        },
        setAll() {
          // Admin client doesn't set cookies
        },
      },
    }
  );
}
