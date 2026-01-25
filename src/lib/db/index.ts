/**
 * Database layer exports
 *
 * NOTE: For server components, import createServerClient directly:
 * import { createServerClient } from '@/lib/db/server-client';
 */

// Client (browser only - safe for client components)
export { createBrowserClient, createAdminClient } from './client';
export type { SupabaseClient } from './client';

// Types
export type {
  DealRow,
  MemoRow,
  AssumptionProfileRow,
  DealInsert,
  DealUpdate,
  MemoInsert,
  MemoUpdate,
  AssumptionProfileInsert,
  AssumptionProfileUpdate,
} from './types';

// Utilities
export { dealToRow, rowToDeal, DatabaseError, handleSupabaseError } from './utils';

// Deal operations
export {
  createDeal,
  getDeal,
  getDeals,
  updateDeal,
  deleteDeal,
  updateDealStatus,
  updateDealVerdict,
  dealExists,
  getDealsCounts,
  getMarketTags,
  getPortfolioSummary,
} from './deals';
export type { ListDealsOptions, PortfolioSummary } from './deals';

// Memo operations
export {
  saveMemo,
  getMemo,
  getMemoByDealId,
  getMemoHistory,
  updateMemo,
  updateMemoNarrative,
  deleteMemo,
  deleteMemosByDealId,
} from './memos';
