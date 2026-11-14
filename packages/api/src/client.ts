import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';
import type { Database } from '@nexora/types';

export type NexoraClient = SupabaseClient<Database>;

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

