/**
 * Supabase browser client initialization
 * For use in client components only
 */

import { createClient, SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/auth-helpers-nextjs';

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Get Supabase client for client-side usage (React components)
 * Uses the anon key and respects RLS policies
 */
export function createBrowserClient(): SupabaseClientType {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    );
  }

  return createSupabaseBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Get Supabase admin client (bypasses RLS)
 * Only use for admin operations that need to bypass row-level security
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable
 */
export function createAdminClient(): SupabaseClientType {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Type helper for Supabase client
 */
export type SupabaseClient = SupabaseClientType;
