import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';
import type { Database } from '@nexora/types';

export type NexoraClient = SupabaseClient<Database>;

let cachedClient: NexoraClient | null = null;

/**
 * Creates a standard Supabase client for client-side or anonymous usage.
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  options?: SupabaseClientOptions<'public'>
): NexoraClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required to initialize NexoraClient.');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    ...options,
  });
}

/**
 * Returns a cached browser/client-side Supabase client using environment variables.
 */
export function getBrowserClient(): NexoraClient {
  if (cachedClient) return cachedClient;

  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    'https://tspgkssgropugsobofey.supabase.co';

  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_JpYlamzeebwTiEQS23qGVg_49BVOPDA';

  cachedClient = createSupabaseClient(url, key);
  return cachedClient;
}

/**
 * Creates an administrative Supabase client using the Service Role Key.
 * MUST ONLY BE CALLED IN SECURE SERVER-SIDE ENVIRONMENTS (Next.js server actions, Edge Functions).
 * NEVER call this on the client or in mobile apps.
 */
export function createSupabaseAdminClient(
  supabaseUrl: string,
  supabaseServiceRoleKey: string
): NexoraClient {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Supabase URL and Service Role Key are required for admin client.');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
