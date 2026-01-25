import type { GlobalAssumptions, Deal } from '@/types';

/**
 * Global default assumptions for financial modeling
 * These can be overridden at the deal level via assumptionOverrides
 */
export const DEFAULT_ASSUMPTIONS: GlobalAssumptions = {
  // Tax Rates
  federalTaxRate: 0.30, // 30%
  stateTaxRate: 0.09, // 9% (California default)

  // Investment Comparison
  reitBaselineReturn: 0.06, // 6% annual (VNQ long-term average)

  // Depreciation
  depreciationYears: 27.5, // Residential standard
  landValuePct: 0.20, // 20% of purchase price (not depreciable)

  // Capital Gains
  capitalGainsRate: 0.15, // 15% federal long-term capital gains
  deprecationRecaptureRate: 0.25, // 25% depreciation recapture rate
};

/**
 * Default values for deal inputs
 * Used when creating new deals or as fallbacks
 */
export const DEFAULT_DEAL_VALUES: Partial<Deal> = {
  // Financing
  downPaymentPct: 0.25, // 25%
  interestRate: 0.06, // 6%
  loanTermYears: 30,
  isARM: false,
  closingCostsPct: 0.02, // 2%

  // Income
  vacancyPct: 0.05, // 5%
  rentGrowthPct: 0.03, // 3%

  // Expenses (as % of gross rent)
  managementPct: 0.08, // 8%
  repairsPct: 0.05, // 5%
  capexPct: 0.05, // 5%
  hoaMonthly: 0,
  utilitiesMonthly: 0,

  // Exit
  appreciationPct: 0.03, // 3%
  sellingCostsPct: 0.07, // 7% (5% agent + 1% transfer + 1% closing)

  // Constraints
  isRentControlled: false,
  hasHOARentalLimit: false,
  knownCapex: '',

  // Overrides
  assumptionOverrides: {},
};

/**
 * Market-specific appreciation rate overrides
 */
export const MARKET_APPRECIATION_RATES: Record<string, number> = {
  bay_area_appreciation: 0.05, // 5% for Bay Area
  cash_flow_market: 0.02, // 2% for cash flow markets
};

/**
 * Expense growth rates (annual)
 */
export const EXPENSE_GROWTH_RATES = {
  propertyTax: 0.02, // 2% annual increase
  insurance: 0.03, // 3% annual increase
  hoa: 0.03, // 3% annual increase
};

/**
 * Sensitivity analysis deltas
 */
export const SENSITIVITY_DELTAS = {
  rent: [-0.10, -0.05, 0, 0.05, 0.10], // -10%, -5%, base, +5%, +10%
  appreciation: [-0.02, -0.01, 0, 0.01, 0.02], // -2%, -1%, base, +1%, +2%
  vacancy: [0.05, 0.03, 0, -0.02, -0.03], // +5%, +3%, base, -2%, -3% (note: positive = worse)
};

/**
 * Verdict thresholds
 */
export const VERDICT_THRESHOLDS = {
  // BUY if IRR > 12% AND multiple > 1.8x AND beats REIT by > 2%
  buy: {
    minIRR: 0.12,
    minMultiple: 1.8,
    minREITExcess: 0.02,
  },
  // WATCH if IRR between 8-12%
  watch: {
    minIRR: 0.08,
    maxIRR: 0.12,
  },
  // PASS if IRR < 8% or doesn't beat REIT
};

/**
 * Analysis horizons (years)
 */
export const ANALYSIS_HORIZONS = [5, 7, 10] as const;

/**
 * Get combined tax rate from assumptions
 */
export function getCombinedTaxRate(assumptions: GlobalAssumptions): number {
  return assumptions.federalTaxRate + assumptions.stateTaxRate;
}

/**
 * Merge deal overrides with global defaults
 */
export function getEffectiveAssumptions(
  overrides: Partial<GlobalAssumptions> = {}
): GlobalAssumptions {
  return {
    ...DEFAULT_ASSUMPTIONS,
    ...overrides,
  };
}
