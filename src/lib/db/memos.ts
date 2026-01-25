/**
 * Memo database operations
 * CRUD operations for the memos table
 */

import type { ModelOutput } from '@/types/model';
import type { MemoContent, MemoNarrative } from '@/types/memo';
import type { SupabaseClient } from './client';
import type { MemoRow } from './types';
import { handleSupabaseError, DatabaseError } from './utils';

/**
 * Convert a MemoRow to MemoContent for application use
 */
function rowToMemo(row: MemoRow): MemoContent {
  return {
    id: row.id,
    dealId: row.deal_id,
    createdAt: new Date(row.created_at),
    modelOutput: row.model_output as unknown as ModelOutput,
    narrative: row.narrative as unknown as MemoNarrative,
    assumptionsSnapshot: row.assumptions_snapshot as Record<string, unknown>,
    version: row.version,
  };
}

/**
 * Save a new memo (or update if exists for this deal)
 * Note: narrative can be either the legacy MemoNarrative type or a simpler AI-generated narrative
 */
export async function saveMemo(
  supabase: SupabaseClient,
  dealId: string,
  modelOutput: ModelOutput,
  assumptionsSnapshot: Record<string, unknown> | object,
  narrative?: MemoNarrative | Record<string, unknown>
): Promise<MemoContent> {
  // Check if a memo already exists for this deal
  const existing = await getMemoByDealId(supabase, dealId);

  if (existing) {
    // Update existing memo with incremented version
    return updateMemo(supabase, existing.id, {
      modelOutput,
      narrative,
      assumptionsSnapshot,
      version: existing.version + 1,
    });
  }

  // Insert new memo
  const { data, error } = await supabase
    .from('memos')
    .insert({
      deal_id: dealId,
      model_output: modelOutput as unknown as Record<string, unknown>,
      narrative: narrative as unknown as Record<string, unknown> | null ?? null,
      assumptions_snapshot: assumptionsSnapshot,
      version: 1,
    })
    .select()
    .single();

  if (error) handleSupabaseError(error);
  if (!data) throw new DatabaseError('No data returned after insert');

  return rowToMemo(data as MemoRow);
}

/**
 * Get the latest memo for a deal
 */
export async function getMemoByDealId(
  supabase: SupabaseClient,
  dealId: string
): Promise<MemoContent | null> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('deal_id', dealId)
    .order('version', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    // PGRST116 = no rows returned
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error);
  }

  if (!data) return null;

  return rowToMemo(data as MemoRow);
}

/**
 * Get a memo by ID
 */
export async function getMemo(
  supabase: SupabaseClient,
  memoId: string
): Promise<MemoContent | null> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('id', memoId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error);
  }

  if (!data) return null;

  return rowToMemo(data as MemoRow);
}

/**
 * Get all memo versions for a deal
 */
export async function getMemoHistory(
  supabase: SupabaseClient,
  dealId: string
): Promise<MemoContent[]> {
  const { data, error } = await supabase
    .from('memos')
    .select('*')
    .eq('deal_id', dealId)
    .order('version', { ascending: false });

  if (error) handleSupabaseError(error);

  return ((data ?? []) as MemoRow[]).map(rowToMemo);
}

/**
 * Update memo options
 */
interface UpdateMemoOptions {
  modelOutput?: ModelOutput;
  narrative?: MemoNarrative | Record<string, unknown>;
  assumptionsSnapshot?: Record<string, unknown> | object;
  version?: number;
}

/**
 * Update an existing memo
 */
export async function updateMemo(
  supabase: SupabaseClient,
  memoId: string,
  updates: UpdateMemoOptions
): Promise<MemoContent> {
  const updateData: Record<string, unknown> = {};

  if (updates.modelOutput !== undefined) {
    updateData.model_output = updates.modelOutput as unknown as Record<string, unknown>;
  }
  if (updates.narrative !== undefined) {
    updateData.narrative = updates.narrative as unknown as Record<string, unknown>;
  }
  if (updates.assumptionsSnapshot !== undefined) {
    updateData.assumptions_snapshot = updates.assumptionsSnapshot;
  }
  if (updates.version !== undefined) {
    updateData.version = updates.version;
  }

  const { data, error } = await supabase
    .from('memos')
    .update(updateData)
    .eq('id', memoId)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  if (!data) throw new DatabaseError('Memo not found or access denied');

  return rowToMemo(data as MemoRow);
}

/**
 * Add or update narrative for a memo
 */
export async function updateMemoNarrative(
  supabase: SupabaseClient,
  memoId: string,
  narrative: MemoNarrative | Record<string, unknown>
): Promise<MemoContent> {
  return updateMemo(supabase, memoId, { narrative });
}

/**
 * Delete a memo
 */
export async function deleteMemo(
  supabase: SupabaseClient,
  memoId: string
): Promise<void> {
  const { error } = await supabase
    .from('memos')
    .delete()
    .eq('id', memoId);

  if (error) handleSupabaseError(error);
}

/**
 * Delete all memos for a deal
 */
export async function deleteMemosByDealId(
  supabase: SupabaseClient,
  dealId: string
): Promise<void> {
  const { error } = await supabase
    .from('memos')
    .delete()
    .eq('deal_id', dealId);

  if (error) handleSupabaseError(error);
}
