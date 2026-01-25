/**
 * Database utility functions
 * Handles conversion between TypeScript camelCase and PostgreSQL snake_case
 */

import type { Deal, GlobalAssumptions } from '@/types/deal';
import type { DealRow } from './types';

/**
 * Convert a Deal (camelCase) to a DealRow (snake_case) for database insert/update
 */
export function dealToRow(deal: Partial<Deal>, userId?: string): Partial<DealRow> {
  const row: Partial<DealRow> = {};

  if (userId !== undefined) row.user_id = userId;
  if (deal.address !== undefined) row.address = deal.address;
  if (deal.city !== undefined) row.city = deal.city;
  if (deal.state !== undefined) row.state = deal.state;
  if (deal.zip !== undefined) row.zip = deal.zip;
  if (deal.marketTag !== undefined) row.market_tag = deal.marketTag;
  if (deal.propertyType !== undefined) row.property_type = deal.propertyType;
  if (deal.beds !== undefined) row.beds = deal.beds;
  if (deal.baths !== undefined) row.baths = deal.baths;
  if (deal.sqft !== undefined) row.sqft = deal.sqft;
  if (deal.yearBuilt !== undefined) row.year_built = deal.yearBuilt;
  if (deal.purchasePrice !== undefined) row.purchase_price = deal.purchasePrice;
  if (deal.closingCostsPct !== undefined) row.closing_costs_pct = deal.closingCostsPct;
  if (deal.downPaymentPct !== undefined) row.down_payment_pct = deal.downPaymentPct;
  if (deal.interestRate !== undefined) row.interest_rate = deal.interestRate;
  if (deal.loanTermYears !== undefined) row.loan_term_years = deal.loanTermYears;
  if (deal.isARM !== undefined) row.is_arm = deal.isARM;
  if (deal.armAdjustYear !== undefined) row.arm_adjust_year = deal.armAdjustYear;
  if (deal.armAdjustRate !== undefined) row.arm_adjust_rate = deal.armAdjustRate;
  if (deal.monthlyRent !== undefined) row.monthly_rent = deal.monthlyRent;
  if (deal.vacancyPct !== undefined) row.vacancy_pct = deal.vacancyPct;
  if (deal.rentGrowthPct !== undefined) row.rent_growth_pct = deal.rentGrowthPct;
  if (deal.propertyTaxAnnual !== undefined) row.property_tax_annual = deal.propertyTaxAnnual;
  if (deal.insuranceAnnual !== undefined) row.insurance_annual = deal.insuranceAnnual;
  if (deal.hoaMonthly !== undefined) row.hoa_monthly = deal.hoaMonthly;
  if (deal.managementPct !== undefined) row.management_pct = deal.managementPct;
  if (deal.repairsPct !== undefined) row.repairs_pct = deal.repairsPct;
  if (deal.capexPct !== undefined) row.capex_pct = deal.capexPct;
  if (deal.utilitiesMonthly !== undefined) row.utilities_monthly = deal.utilitiesMonthly;
  if (deal.appreciationPct !== undefined) row.appreciation_pct = deal.appreciationPct;
  if (deal.sellingCostsPct !== undefined) row.selling_costs_pct = deal.sellingCostsPct;
  if (deal.isRentControlled !== undefined) row.is_rent_controlled = deal.isRentControlled;
  if (deal.hasHOARentalLimit !== undefined) row.has_hoa_rental_limit = deal.hasHOARentalLimit;
  if (deal.knownCapex !== undefined) row.known_capex = deal.knownCapex;
  if (deal.assumptionOverrides !== undefined) row.assumption_overrides = deal.assumptionOverrides as Record<string, unknown>;
  if (deal.status !== undefined) row.status = deal.status;
  if (deal.verdict !== undefined) row.verdict = deal.verdict;

  return row;
}

/**
 * Convert a DealRow (snake_case) to a Deal (camelCase) for application use
 */
export function rowToDeal(row: DealRow): Deal {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),

    // Property
    address: row.address,
    city: row.city,
    state: row.state,
    zip: row.zip,
    marketTag: row.market_tag ?? 'cash_flow_market',
    propertyType: row.property_type ?? 'sfh',
    beds: row.beds ?? 0,
    baths: row.baths ?? 0,
    sqft: row.sqft ?? 0,
    yearBuilt: row.year_built ?? 0,

    // Purchase
    purchasePrice: row.purchase_price,
    closingCostsPct: row.closing_costs_pct,

    // Financing
    downPaymentPct: row.down_payment_pct,
    interestRate: row.interest_rate,
    loanTermYears: row.loan_term_years,
    isARM: row.is_arm,
    armAdjustYear: row.arm_adjust_year ?? undefined,
    armAdjustRate: row.arm_adjust_rate ?? undefined,

    // Income
    monthlyRent: row.monthly_rent,
    vacancyPct: row.vacancy_pct,
    rentGrowthPct: row.rent_growth_pct,

    // Expenses
    propertyTaxAnnual: row.property_tax_annual ?? 0,
    insuranceAnnual: row.insurance_annual ?? 0,
    hoaMonthly: row.hoa_monthly,
    managementPct: row.management_pct,
    repairsPct: row.repairs_pct,
    capexPct: row.capex_pct,
    utilitiesMonthly: row.utilities_monthly,

    // Exit
    appreciationPct: row.appreciation_pct,
    sellingCostsPct: row.selling_costs_pct,

    // Constraints
    isRentControlled: row.is_rent_controlled,
    hasHOARentalLimit: row.has_hoa_rental_limit,
    knownCapex: row.known_capex ?? '',

    // Overrides
    assumptionOverrides: (row.assumption_overrides ?? {}) as Partial<GlobalAssumptions>,

    // Status
    status: row.status,
    verdict: row.verdict ?? undefined,
  };
}

/**
 * Database error wrapper
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

/**
 * Handle Supabase errors consistently
 */
export function handleSupabaseError(error: { message: string; code?: string; details?: string }): never {
  throw new DatabaseError(error.message, error.code, error.details);
}
