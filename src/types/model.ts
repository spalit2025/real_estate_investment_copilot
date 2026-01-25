import type { Deal, GlobalAssumptions } from './deal';

/**
 * Complete model output from running financial analysis
 */
export interface ModelOutput {
  deal: Deal;
  assumptions: GlobalAssumptions;

  // Year-by-year results
  resultsByYear: YearResult[];

  // Summary results for key holding periods
  resultsByHorizon: {
    year5: HorizonResult;
    year7: HorizonResult;
    year10: HorizonResult;
  };

  // Sensitivity analysis results
  sensitivityRuns: SensitivityResult[];

  // Identified data gaps
  dataGaps: DataGap[];

  // Metadata
  computedAt: Date;
}

/**
 * Financial results for a single year
 */
export interface YearResult {
  year: number;

  // Income
  grossRent: number;
  vacancy: number;
  effectiveGrossIncome: number;

  // Expenses
  operatingExpenses: number;
  operatingExpensesBreakdown: {
    propertyTax: number;
    insurance: number;
    hoa: number;
    management: number;
    repairs: number;
    capex: number;
    utilities: number;
  };

  // Cash Flow
  noi: number; // Net Operating Income
  debtService: number;
  cashFlowBeforeTax: number;

  // Tax
  depreciation: number;
  interestPaid: number;
  principalPaid: number;
  taxableIncome: number;
  incomeTax: number; // Can be negative (tax benefit)
  cashFlowAfterTax: number;

  // Balance Sheet
  loanBalance: number;
  propertyValue: number;
  equity: number;
}

/**
 * Summary results for a specific holding period (exit horizon)
 */
export interface HorizonResult {
  years: number;

  // Initial Investment
  initialEquity: number;

  // Cumulative Cash Flow
  cumulativeCashFlow: number;

  // Exit Values
  remainingLoanBalance: number;
  grossSalePrice: number;
  sellingCosts: number;

  // Exit Taxes
  capitalGainsTax: number;
  depreciationRecapture: number;
  totalTaxAtSale: number;

  // Net Proceeds
  netSaleProceeds: number;

  // Returns
  totalReturn: number;
  irr: number; // As decimal, e.g., 0.12 for 12%
  equityMultiple: number; // e.g., 1.8 for 1.8x

  // Comparison
  reitComparison: number; // Excess return vs REIT baseline (as decimal)
}

/**
 * Sensitivity analysis result for a single scenario
 */
export interface SensitivityResult {
  variable: SensitivityVariable;
  delta: number; // e.g., -0.10 for -10%
  irr5: number;
  irr7: number;
  irr10: number;
}

export type SensitivityVariable = 'rent' | 'appreciation' | 'vacancy';

/**
 * Identified data gap in the analysis
 */
export interface DataGap {
  field: string;
  impact: DataGapImpact;
  defaultUsed: string | number;
  recommendation: string;
}

export type DataGapImpact = 'high' | 'medium' | 'low';

/**
 * Amortization schedule entry for a single month
 */
export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

/**
 * Cash flow entry for IRR calculation
 */
export interface CashFlowEntry {
  year: number;
  amount: number;
}
