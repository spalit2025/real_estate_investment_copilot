/**
 * Database row types (snake_case to match PostgreSQL conventions)
 * These map directly to the Supabase table schemas
 */

import type { Verdict, DealStatus, MarketTag, PropertyType } from '@/types/deal';

/**
 * Database row for deals table
 */
export interface DealRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;

  // Property
  address: string;
  city: string;
  state: string;
  zip: string;
  market_tag: MarketTag | null;
  property_type: PropertyType | null;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  year_built: number | null;

  // Purchase
  purchase_price: number;
  closing_costs_pct: number;

  // Financing
  down_payment_pct: number;
  interest_rate: number;
  loan_term_years: number;
  is_arm: boolean;
  arm_adjust_year: number | null;
  arm_adjust_rate: number | null;

  // Income
  monthly_rent: number;
  vacancy_pct: number;
  rent_growth_pct: number;

  // Expenses
  property_tax_annual: number | null;
  insurance_annual: number | null;
  hoa_monthly: number;
  management_pct: number;
  repairs_pct: number;
  capex_pct: number;
  utilities_monthly: number;

  // Exit
  appreciation_pct: number;
  selling_costs_pct: number;

  // Constraints
  is_rent_controlled: boolean;
  has_hoa_rental_limit: boolean;
  known_capex: string | null;

  // Overrides
  assumption_overrides: Record<string, unknown>;

  // Status
  status: DealStatus;
  verdict: Verdict | null;
}

/**
 * Database row for memos table
 */
export interface MemoRow {
  id: string;
  deal_id: string;
  created_at: string;
  model_output: Record<string, unknown>;
  narrative: Record<string, unknown> | null;
  assumptions_snapshot: Record<string, unknown>;
  version: number;
}

/**
 * Database row for assumption_profiles table
 */
export interface AssumptionProfileRow {
  id: string;
  user_id: string;
  name: string;
  assumptions: Record<string, unknown>;
  is_default: boolean;
  created_at: string;
}

/**
 * Insert types (without auto-generated fields)
 */
export type DealInsert = Omit<DealRow, 'id' | 'created_at' | 'updated_at'>;
export type DealUpdate = Partial<Omit<DealRow, 'id' | 'user_id' | 'created_at'>>;

export type MemoInsert = Omit<MemoRow, 'id' | 'created_at'>;
export type MemoUpdate = Partial<Omit<MemoRow, 'id' | 'deal_id' | 'created_at'>>;

export type AssumptionProfileInsert = Omit<AssumptionProfileRow, 'id' | 'created_at'>;
export type AssumptionProfileUpdate = Partial<Omit<AssumptionProfileRow, 'id' | 'user_id' | 'created_at'>>;
