import type { GlobalAssumptions } from '@/types';

/**
 * Tax calculation result for property sale
 */
export interface ExitTaxResult {
  capitalGain: number;
  ordinaryGain: number; // Depreciation recapture portion
  longTermGain: number; // Standard capital gains portion
  recaptureTax: number;
  capitalGainsTax: number;
  stateTax: number;
  totalTax: number;
}

/**
 * Input parameters for exit tax calculation
 */
export interface ExitTaxParams {
  purchasePrice: number;
  salePrice: number;
  totalDepreciation: number;
  capitalImprovements?: number;
  capitalGainsRate: number;
  recaptureRate: number;
  stateTaxRate: number;
}

/**
 * Calculate annual depreciation using straight-line method
 *
 * For residential rental property:
 * - Only the building (not land) can be depreciated
 * - Standard depreciation period is 27.5 years
 *
 * Formula: Annual Depreciation = (Purchase Price * (1 - Land%)) / 27.5
 *
 * @param purchasePrice - Total property purchase price
 * @param landValuePct - Percentage of value attributed to land (e.g., 0.20 for 20%)
 * @param depreciationYears - Depreciation period (27.5 for residential)
 * @returns Annual depreciation amount
 */
export function calculateAnnualDepreciation(
  purchasePrice: number,
  landValuePct: number,
  depreciationYears: number
): number {
  if (purchasePrice <= 0) {
    throw new Error('Purchase price must be positive');
  }
  if (landValuePct < 0 || landValuePct >= 1) {
    throw new Error('Land value percentage must be between 0 and 1');
  }
  if (depreciationYears <= 0) {
    throw new Error('Depreciation years must be positive');
  }

  const buildingValue = purchasePrice * (1 - landValuePct);
  return buildingValue / depreciationYears;
}

/**
 * Calculate taxable income from rental property
 *
 * Taxable Income = NOI - Depreciation - Mortgage Interest
 *
 * Note: Taxable income can be negative (paper loss) even when cash flow is positive.
 * This creates a tax benefit that reduces tax on other income.
 *
 * @param noi - Net Operating Income for the year
 * @param depreciation - Annual depreciation deduction
 * @param mortgageInterest - Interest portion of mortgage payments for the year
 * @returns Taxable income (can be negative)
 */
export function calculateTaxableIncome(
  noi: number,
  depreciation: number,
  mortgageInterest: number
): number {
  return noi - depreciation - mortgageInterest;
}

/**
 * Calculate income tax on rental property income
 *
 * When taxable income is negative, the result is a tax benefit (credit).
 * This assumes passive loss limitations don't apply (income under threshold).
 *
 * @param taxableIncome - Taxable income from rental (can be negative)
 * @param combinedTaxRate - Combined federal + state marginal rate
 * @returns Income tax amount (negative = tax benefit)
 */
export function calculateIncomeTax(
  taxableIncome: number,
  combinedTaxRate: number
): number {
  if (combinedTaxRate < 0 || combinedTaxRate > 1) {
    throw new Error('Tax rate must be between 0 and 1');
  }

  return taxableIncome * combinedTaxRate;
}

/**
 * Calculate after-tax cash flow
 *
 * After-Tax Cash Flow = Cash Flow Before Tax - Income Tax
 * Note: When income tax is negative (tax benefit), this adds to cash flow
 *
 * @param cashFlowBeforeTax - Pre-tax cash flow
 * @param incomeTax - Income tax (negative = benefit)
 * @returns After-tax cash flow
 */
export function calculateCashFlowAfterTax(
  cashFlowBeforeTax: number,
  incomeTax: number
): number {
  return cashFlowBeforeTax - incomeTax;
}

/**
 * Calculate taxes owed at property sale
 *
 * Tax at sale has two components:
 * 1. Depreciation Recapture: Taxed at 25% (recapture rate) on the lesser of:
 *    - Total depreciation taken, or
 *    - Total gain
 * 2. Capital Gains: Taxed at capital gains rate on remaining gain
 *
 * Adjusted Basis = Purchase Price - Total Depreciation + Capital Improvements
 * Capital Gain = Sale Price - Adjusted Basis
 *
 * @param params - Exit tax calculation parameters
 * @returns Detailed exit tax breakdown
 */
export function calculateExitTaxes(params: ExitTaxParams): ExitTaxResult {
  const {
    purchasePrice,
    salePrice,
    totalDepreciation,
    capitalImprovements = 0,
    capitalGainsRate,
    recaptureRate,
    stateTaxRate,
  } = params;

  // Calculate adjusted basis
  const adjustedBasis = purchasePrice - totalDepreciation + capitalImprovements;

  // Calculate total capital gain
  const capitalGain = salePrice - adjustedBasis;

  // If no gain or loss, no tax
  if (capitalGain <= 0) {
    return {
      capitalGain,
      ordinaryGain: 0,
      longTermGain: 0,
      recaptureTax: 0,
      capitalGainsTax: 0,
      stateTax: 0,
      totalTax: 0,
    };
  }

  // Depreciation recapture (ordinary gain)
  // Taxed at 25% federal rate, limited to the lesser of total depreciation or gain
  const ordinaryGain = Math.min(capitalGain, totalDepreciation);

  // Remaining gain taxed at long-term capital gains rate
  const longTermGain = Math.max(0, capitalGain - ordinaryGain);

  // Calculate federal taxes
  const recaptureTax = ordinaryGain * recaptureRate;
  const capitalGainsTax = longTermGain * capitalGainsRate;

  // State tax on total gain (most states don't differentiate)
  const stateTax = capitalGain * stateTaxRate;

  const totalTax = recaptureTax + capitalGainsTax + stateTax;

  return {
    capitalGain,
    ordinaryGain,
    longTermGain,
    recaptureTax,
    capitalGainsTax,
    stateTax,
    totalTax,
  };
}

/**
 * Calculate selling costs
 *
 * Typical selling costs include:
 * - Real estate agent commission: 5-6%
 * - Transfer taxes: ~1%
 * - Closing costs: ~1%
 *
 * @param salePrice - Gross sale price
 * @param sellingCostsPct - Total selling costs as percentage
 * @returns Total selling costs
 */
export function calculateSellingCosts(
  salePrice: number,
  sellingCostsPct: number
): number {
  return salePrice * sellingCostsPct;
}

/**
 * Calculate net sale proceeds after all costs and taxes
 *
 * Net Proceeds = Sale Price - Selling Costs - Taxes at Sale - Remaining Loan
 *
 * @param salePrice - Gross sale price
 * @param sellingCosts - Total selling costs
 * @param taxAtSale - Total tax owed at sale
 * @param loanBalance - Remaining mortgage balance
 * @returns Net proceeds from sale
 */
export function calculateNetSaleProceeds(
  salePrice: number,
  sellingCosts: number,
  taxAtSale: number,
  loanBalance: number
): number {
  return salePrice - sellingCosts - taxAtSale - loanBalance;
}

/**
 * Get combined (federal + state) tax rate
 *
 * @param assumptions - Global assumptions containing tax rates
 * @returns Combined tax rate as decimal
 */
export function getCombinedTaxRate(assumptions: GlobalAssumptions): number {
  return assumptions.federalTaxRate + assumptions.stateTaxRate;
}
