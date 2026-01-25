/**
 * Deal database operations
 * CRUD operations for the deals table
 */

import type { Deal, CreateDealInput, UpdateDealInput, DealStatus } from '@/types/deal';
import type { SupabaseClient } from './client';
import type { DealRow } from './types';
import { dealToRow, rowToDeal, handleSupabaseError, DatabaseError } from './utils';

/**
 * Create a new deal
 */
export async function createDeal(
  supabase: SupabaseClient,
  userId: string,
  input: CreateDealInput
): Promise<Deal> {
  const row = dealToRow(input, userId);

  const { data, error } = await supabase
    .from('deals')
    .insert(row)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  if (!data) throw new DatabaseError('No data returned after insert');

  return rowToDeal(data as DealRow);
}

/**
 * Get a single deal by ID
 * Returns null if not found or user doesn't have access
 */
export async function getDeal(
  supabase: SupabaseClient,
  dealId: string
): Promise<Deal | null> {
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('id', dealId)
    .single();

  if (error) {
    // PGRST116 = no rows returned
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error);
  }

  if (!data) return null;

  return rowToDeal(data as DealRow);
}

/**
 * List options for getDeals
 */
export interface ListDealsOptions {
  status?: DealStatus | DealStatus[];
  marketTag?: string | string[];
  limit?: number;
  offset?: number;
  orderBy?: 'created_at' | 'updated_at' | 'purchase_price';
  orderDirection?: 'asc' | 'desc';
}

/**
 * Get all deals for a user
 */
export async function getDeals(
  supabase: SupabaseClient,
  userId: string,
  options: ListDealsOptions = {}
): Promise<{ deals: Deal[]; total: number }> {
  const {
    status,
    marketTag,
    limit = 50,
    offset = 0,
    orderBy = 'created_at',
    orderDirection = 'desc',
  } = options;

  let query = supabase
    .from('deals')
    .select('*', { count: 'exact' })
    .eq('user_id', userId);

  // Filter by status
  if (status) {
    if (Array.isArray(status)) {
      query = query.in('status', status);
    } else {
      query = query.eq('status', status);
    }
  }

  // Filter by market tag
  if (marketTag) {
    if (Array.isArray(marketTag)) {
      query = query.in('market_tag', marketTag);
    } else {
      query = query.eq('market_tag', marketTag);
    }
  }

  // Pagination and ordering
  query = query
    .order(orderBy, { ascending: orderDirection === 'asc' })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) handleSupabaseError(error);

  return {
    deals: ((data ?? []) as DealRow[]).map(rowToDeal),
    total: count ?? 0,
  };
}

/**
 * Update an existing deal
 */
export async function updateDeal(
  supabase: SupabaseClient,
  dealId: string,
  updates: UpdateDealInput
): Promise<Deal> {
  const row = dealToRow(updates);

  // Always update the updated_at timestamp
  const rowWithTimestamp = {
    ...row,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('deals')
    .update(rowWithTimestamp)
    .eq('id', dealId)
    .select()
    .single();

  if (error) handleSupabaseError(error);
  if (!data) throw new DatabaseError('Deal not found or access denied');

  return rowToDeal(data as DealRow);
}

/**
 * Delete a deal (or archive it)
 * By default, archives the deal instead of hard delete
 */
export async function deleteDeal(
  supabase: SupabaseClient,
  dealId: string,
  hardDelete: boolean = false
): Promise<void> {
  if (hardDelete) {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', dealId);

    if (error) handleSupabaseError(error);
  } else {
    // Soft delete - archive the deal
    const { error } = await supabase
      .from('deals')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', dealId);

    if (error) handleSupabaseError(error);
  }
}

/**
 * Update deal status
 */
export async function updateDealStatus(
  supabase: SupabaseClient,
  dealId: string,
  status: DealStatus
): Promise<Deal> {
  return updateDeal(supabase, dealId, { status });
}

/**
 * Update deal verdict (after analysis)
 */
export async function updateDealVerdict(
  supabase: SupabaseClient,
  dealId: string,
  verdict: 'buy' | 'skip' | 'watch'
): Promise<Deal> {
  return updateDeal(supabase, dealId, {
    verdict,
    status: 'analyzed',
  });
}

/**
 * Check if a deal exists and user has access
 */
export async function dealExists(
  supabase: SupabaseClient,
  dealId: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from('deals')
    .select('*', { count: 'exact', head: true })
    .eq('id', dealId);

  if (error) handleSupabaseError(error);

  return (count ?? 0) > 0;
}

/**
 * Get deals count by status for dashboard
 */
export async function getDealsCounts(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<DealStatus, number>> {
  const counts: Record<DealStatus, number> = {
    draft: 0,
    analyzed: 0,
    archived: 0,
  };

  // Get counts for each status
  const { data, error } = await supabase
    .from('deals')
    .select('status')
    .eq('user_id', userId);

  if (error) handleSupabaseError(error);

  for (const deal of (data ?? []) as { status: DealStatus }[]) {
    if (deal.status in counts) {
      counts[deal.status]++;
    }
  }

  return counts;
}

/**
 * Get all unique market tags for a user
 */
export async function getMarketTags(
  supabase: SupabaseClient,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('market_tag')
    .eq('user_id', userId)
    .not('market_tag', 'is', null);

  if (error) handleSupabaseError(error);

  // Extract unique tags
  const tags = new Set<string>();
  for (const deal of (data ?? []) as { market_tag: string }[]) {
    if (deal.market_tag) {
      tags.add(deal.market_tag);
    }
  }

  return Array.from(tags).sort();
}

/**
 * Get portfolio summary by market tag
 */
export interface PortfolioSummary {
  tag: string;
  count: number;
  totalValue: number;
  totalMonthlyRent: number;
  avgGrossYield: number;
  verdicts: {
    buy: number;
    skip: number;
    watch: number;
    pending: number;
  };
}

export async function getPortfolioSummary(
  supabase: SupabaseClient,
  userId: string
): Promise<PortfolioSummary[]> {
  const { data, error } = await supabase
    .from('deals')
    .select('market_tag, purchase_price, monthly_rent, verdict, status')
    .eq('user_id', userId)
    .neq('status', 'archived');

  if (error) handleSupabaseError(error);

  // Group by market tag
  const tagMap = new Map<string, {
    count: number;
    totalValue: number;
    totalMonthlyRent: number;
    verdicts: { buy: number; skip: number; watch: number; pending: number };
  }>();

  for (const deal of (data ?? []) as {
    market_tag: string | null;
    purchase_price: number;
    monthly_rent: number;
    verdict: string | null;
    status: string;
  }[]) {
    const tag = deal.market_tag || 'untagged';

    if (!tagMap.has(tag)) {
      tagMap.set(tag, {
        count: 0,
        totalValue: 0,
        totalMonthlyRent: 0,
        verdicts: { buy: 0, skip: 0, watch: 0, pending: 0 },
      });
    }

    const summary = tagMap.get(tag)!;
    summary.count++;
    summary.totalValue += Number(deal.purchase_price) || 0;
    summary.totalMonthlyRent += Number(deal.monthly_rent) || 0;

    if (deal.verdict === 'buy') summary.verdicts.buy++;
    else if (deal.verdict === 'skip') summary.verdicts.skip++;
    else if (deal.verdict === 'watch') summary.verdicts.watch++;
    else summary.verdicts.pending++;
  }

  // Convert to array with calculated yields
  const summaries: PortfolioSummary[] = [];
  for (const [tag, data] of tagMap) {
    summaries.push({
      tag,
      count: data.count,
      totalValue: data.totalValue,
      totalMonthlyRent: data.totalMonthlyRent,
      avgGrossYield: data.totalValue > 0
        ? (data.totalMonthlyRent * 12) / data.totalValue
        : 0,
      verdicts: data.verdicts,
    });
  }

  return summaries.sort((a, b) => b.totalValue - a.totalValue);
}
