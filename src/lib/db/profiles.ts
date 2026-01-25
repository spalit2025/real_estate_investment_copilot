/**
 * Assumption Profiles database operations
 * CRUD operations for the assumption_profiles table
 */

import type { GlobalAssumptions } from '@/types/deal';
import type { SupabaseClient } from './client';
import { handleSupabaseError, DatabaseError } from './utils';

/**
 * Assumption Profile type
 */
export interface AssumptionProfile {
  id: string;
  userId: string;
  name: string;
  assumptions: Partial<GlobalAssumptions>;
  isDefault: boolean;
  createdAt: Date;
}

/**
 * Database row type
 */
interface ProfileRow {
  id: string;
  user_id: string;
  name: string;
  assumptions: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
}

/**
 * Convert row to profile
 */
function rowToProfile(row: ProfileRow): AssumptionProfile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    assumptions: row.assumptions as Partial<GlobalAssumptions>,
    isDefault: row.is_default,
    createdAt: new Date(row.created_at),
  };
}

/**
 * Create a new assumption profile
 */
export async function createProfile(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  assumptions: Partial<GlobalAssumptions>,
  isDefault: boolean = false
): Promise<AssumptionProfile> {
  // If this is set as default, unset any existing default
  if (isDefault) {
    await supabase
      .from('assumption_profiles')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);
  }

  const { data, error } = await supabase
    .from('assumption_profiles')
    .insert({
      user_id: userId,
      name,
      assumptions: assumptions as Record<string, unknown>,
      is_default: isDefault,
    })
    .select()
    .single();

  if (error) handleSupabaseError(error);
  if (!data) throw new DatabaseError('No data returned after insert');

  return rowToProfile(data as ProfileRow);
}

/**
 * Get all profiles for a user
 */
export async function getProfiles(
  supabase: SupabaseClient,
  userId: string
): Promise<AssumptionProfile[]> {
  const { data, error } = await supabase
    .from('assumption_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) handleSupabaseError(error);

  return ((data ?? []) as ProfileRow[]).map(rowToProfile);
}

/**
 * Get a single profile by ID
 */
export async function getProfile(
  supabase: SupabaseClient,
  profileId: string
): Promise<AssumptionProfile | null> {
  const { data, error } = await supabase
    .from('assumption_profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error);
  }

  if (!data) return null;

  return rowToProfile(data as ProfileRow);
}

/**
 * Get the default profile for a user
 */
export async function getDefaultProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<AssumptionProfile | null> {
  const { data, error } = await supabase
    .from('assumption_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_default', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error);
  }

  if (!data) return null;

  return rowToProfile(data as ProfileRow);
}

/**
 * Update a profile
 */
export async function updateProfile(
  supabase: SupabaseClient,
  profileId: string,
  updates: {
    name?: string;
    assumptions?: Partial<GlobalAssumptions>;
    isDefault?: boolean;
  }
): Promise<AssumptionProfile> {
  // If setting as default, first unset existing default
  if (updates.isDefault) {
    const profile = await getProfile(supabase, profileId);
    if (profile) {
      await supabase
        .from('assumption_profiles')
        .update({ is_default: false })
        .eq('user_id', profile.userId)
        .eq('is_default', true);
    }
  }

  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.assumptions !== undefined) updateData.assumptions = updates.assumptions;
  if (updates.isDefault !== undefined) updateData.is_default = updates.isDefault;

  const { data, error } = await supabase
    .from('assumption_profiles')
    .update(updateData)
    .eq('id', profileId)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  if (!data) throw new DatabaseError('Profile not found or access denied');

  return rowToProfile(data as ProfileRow);
}

/**
 * Delete a profile
 */
export async function deleteProfile(
  supabase: SupabaseClient,
  profileId: string
): Promise<void> {
  const { error } = await supabase
    .from('assumption_profiles')
    .delete()
    .eq('id', profileId);

  if (error) handleSupabaseError(error);
}

/**
 * Preset profiles for common scenarios
 */
export const PRESET_PROFILES = {
  bayAreaDefaults: {
    name: 'Bay Area Defaults',
    assumptions: {
      federalTaxRate: 0.32,
      stateTaxRate: 0.133, // California top rate
      reitBaselineReturn: 0.06,
      depreciationYears: 27.5,
      landValuePct: 0.30, // Higher land value in Bay Area
      capitalGainsRate: 0.20,
      deprecationRecaptureRate: 0.25,
    },
  },
  cashFlowMarket: {
    name: 'Cash Flow Market',
    assumptions: {
      federalTaxRate: 0.24,
      stateTaxRate: 0.05,
      reitBaselineReturn: 0.06,
      depreciationYears: 27.5,
      landValuePct: 0.15, // Lower land value
      capitalGainsRate: 0.15,
      deprecationRecaptureRate: 0.25,
    },
  },
  conservative: {
    name: 'Conservative Investor',
    assumptions: {
      federalTaxRate: 0.35,
      stateTaxRate: 0.10,
      reitBaselineReturn: 0.08, // Higher baseline expectation
      depreciationYears: 27.5,
      landValuePct: 0.25,
      capitalGainsRate: 0.20,
      deprecationRecaptureRate: 0.25,
    },
  },
};
