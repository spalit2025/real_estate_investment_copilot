import type { Deal } from '@/types';
import { EXPENSE_GROWTH_RATES } from '@/config/defaults';

/**
 * Annual income calculation result
 */
export interface AnnualIncome {
  grossRent: number;
  vacancyLoss: number;
  effectiveGrossIncome: number;
}

/**
 * Operating expenses breakdown
 */
export interface OperatingExpenses {
  propertyTax: number;
  insurance: number;
  hoa: number;
  management: number;
  repairs: number;
  capex: number;
  utilities: number;
  total: number;
}

/**
 * Calculate annual rental income for a given year
 *
 * Formula:
 *   grossRent = monthlyRent * 12 * (1 + rentGrowthPct)^(year - 1)
 *   vacancyLoss = grossRent * vacancyPct
 *   effectiveGrossIncome = grossRent - vacancyLoss
 *
 * @param deal - Deal with income parameters
 * @param year - Year number (1-indexed)
 * @returns Annual income breakdown
 */
export function calculateAnnualIncome(deal: Deal, year: number): AnnualIncome {
  if (year < 1) {
    throw new Error('Year must be positive');
  }

  // Apply rent growth: compounded annually from base rent
  const growthMultiplier = Math.pow(1 + deal.rentGrowthPct, year - 1);
  const grossRent = deal.monthlyRent * 12 * growthMultiplier;

  // Apply vacancy loss
  const vacancyLoss = grossRent * deal.vacancyPct;
  const effectiveGrossIncome = grossRent - vacancyLoss;

  return {
    grossRent,
    vacancyLoss,
    effectiveGrossIncome,
  };
}

/**
 * Calculate annual operating expenses for a given year
 *
 * Fixed expenses (tax, insurance, HOA) grow at their respective rates
 * Variable expenses (management, repairs, capex) are % of effective gross income
 *
 * @param deal - Deal with expense parameters
 * @param effectiveGrossIncome - EGI for the year (from calculateAnnualIncome)
 * @param year - Year number (1-indexed)
 * @returns Operating expenses breakdown
 */
export function calculateOperatingExpenses(
  deal: Deal,
  effectiveGrossIncome: number,
  year: number
): OperatingExpenses {
  if (year < 1) {
    throw new Error('Year must be positive');
  }

  // Fixed expenses with annual growth
  const yearMultiplier = year - 1;

  const propertyTax =
    deal.propertyTaxAnnual * Math.pow(1 + EXPENSE_GROWTH_RATES.propertyTax, yearMultiplier);

  const insurance =
    deal.insuranceAnnual * Math.pow(1 + EXPENSE_GROWTH_RATES.insurance, yearMultiplier);

  const hoa =
    deal.hoaMonthly * 12 * Math.pow(1 + EXPENSE_GROWTH_RATES.hoa, yearMultiplier);

  // Variable expenses as % of effective gross income
  const management = effectiveGrossIncome * deal.managementPct;
  const repairs = effectiveGrossIncome * deal.repairsPct;
  const capex = effectiveGrossIncome * deal.capexPct;

  // Utilities (assuming no growth, or can add growth if needed)
  const utilities = deal.utilitiesMonthly * 12;

  const total = propertyTax + insurance + hoa + management + repairs + capex + utilities;

  return {
    propertyTax,
    insurance,
    hoa,
    management,
    repairs,
    capex,
    utilities,
    total,
  };
}

/**
 * Calculate Net Operating Income (NOI)
 *
 * NOI = Effective Gross Income - Operating Expenses
 *
 * @param effectiveGrossIncome - Annual income after vacancy
 * @param operatingExpenses - Total operating expenses
 * @returns NOI
 */
export function calculateNOI(
  effectiveGrossIncome: number,
  operatingExpenses: number
): number {
  return effectiveGrossIncome - operatingExpenses;
}

/**
 * Calculate Cash Flow Before Tax
 *
 * CFBT = NOI - Annual Debt Service
 *
 * @param noi - Net Operating Income
 * @param annualDebtService - Annual mortgage payments (P&I)
 * @returns Cash flow before tax
 */
export function calculateCashFlowBeforeTax(
  noi: number,
  annualDebtService: number
): number {
  return noi - annualDebtService;
}

/**
 * Calculate initial equity (down payment + closing costs)
 *
 * @param purchasePrice - Property purchase price
 * @param downPaymentPct - Down payment percentage as decimal
 * @param closingCostsPct - Closing costs percentage as decimal
 * @returns Initial equity required
 */
export function calculateInitialEquity(
  purchasePrice: number,
  downPaymentPct: number,
  closingCostsPct: number
): number {
  const downPayment = purchasePrice * downPaymentPct;
  const closingCosts = purchasePrice * closingCostsPct;
  return downPayment + closingCosts;
}

/**
 * Calculate loan amount
 *
 * @param purchasePrice - Property purchase price
 * @param downPaymentPct - Down payment percentage as decimal
 * @returns Loan principal amount
 */
export function calculateLoanAmount(
  purchasePrice: number,
  downPaymentPct: number
): number {
  return purchasePrice * (1 - downPaymentPct);
}

/**
 * Calculate property value at a future year
 *
 * @param purchasePrice - Initial purchase price
 * @param appreciationPct - Annual appreciation rate as decimal
 * @param years - Number of years
 * @returns Future property value
 */
export function calculatePropertyValue(
  purchasePrice: number,
  appreciationPct: number,
  years: number
): number {
  return purchasePrice * Math.pow(1 + appreciationPct, years);
}

/**
 * Calculate equity in property (value - loan balance)
 *
 * @param propertyValue - Current property value
 * @param loanBalance - Remaining loan balance
 * @returns Equity
 */
export function calculateEquity(
  propertyValue: number,
  loanBalance: number
): number {
  return propertyValue - loanBalance;
}

/**
 * Calculate cap rate
 *
 * Cap Rate = NOI / Purchase Price
 *
 * @param noi - Year 1 NOI
 * @param purchasePrice - Purchase price
 * @returns Cap rate as decimal
 */
export function calculateCapRate(noi: number, purchasePrice: number): number {
  if (purchasePrice <= 0) {
    throw new Error('Purchase price must be positive');
  }
  return noi / purchasePrice;
}

/**
 * Calculate cash-on-cash return
 *
 * Cash-on-Cash = Annual Cash Flow / Initial Equity
 *
 * @param annualCashFlow - Year 1 cash flow before tax
 * @param initialEquity - Initial equity invested
 * @returns Cash-on-cash return as decimal
 */
export function calculateCashOnCash(
  annualCashFlow: number,
  initialEquity: number
): number {
  if (initialEquity <= 0) {
    throw new Error('Initial equity must be positive');
  }
  return annualCashFlow / initialEquity;
}

/**
 * Calculate gross rent multiplier
 *
 * GRM = Purchase Price / Annual Gross Rent
 *
 * @param purchasePrice - Purchase price
 * @param annualGrossRent - Annual gross rent
 * @returns GRM
 */
export function calculateGRM(
  purchasePrice: number,
  annualGrossRent: number
): number {
  if (annualGrossRent <= 0) {
    throw new Error('Annual gross rent must be positive');
  }
  return purchasePrice / annualGrossRent;
}
