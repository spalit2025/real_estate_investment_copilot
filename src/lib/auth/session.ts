/**
 * Server-side session helpers
 * Utilities for getting the current user and session
 */

import { createServerClient } from '@/lib/db/server-client';
import type { User } from '@supabase/supabase-js';

/**
 * Get the current authenticated user (server-side)
 * Returns null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Get the current user ID (server-side)
 * Returns null if not authenticated
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Get the current session (server-side)
 * Returns null if not authenticated
 */
export async function getSession() {
  const supabase = await createServerClient();
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    return null;
  }

  return session;
}

/**
 * Require authentication - throws redirect if not authenticated
 * Use in Server Components or API routes
 */
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    // This will be caught by error boundary or middleware
    throw new Error('UNAUTHORIZED');
  }

  return user;
}
