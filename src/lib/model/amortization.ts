import type { AmortizationEntry } from '@/types';

/**
 * Calculate monthly mortgage payment using standard amortization formula
 *
 * Formula: P = L * [c(1+c)^n] / [(1+c)^n - 1]
 * where:
 *   P = monthly payment
 *   L = loan amount (principal)
 *   c = monthly interest rate
 *   n = total number of payments
 *
 * @param principal - Loan amount in dollars
 * @param annualRate - Annual interest rate as decimal (e.g., 0.06 for 6%)
 * @param termYears - Loan term in years
 * @returns Monthly payment amount
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  if (principal <= 0) {
    throw new Error('Principal must be positive');
  }
  if (annualRate < 0) {
    throw new Error('Interest rate cannot be negative');
  }
  if (termYears <= 0) {
    throw new Error('Loan term must be positive');
  }

  // Handle zero interest rate (rare but possible)
  if (annualRate === 0) {
    return principal / (termYears * 12);
  }

  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;
  const compoundFactor = Math.pow(1 + monthlyRate, numPayments);

  const payment =
    principal * ((monthlyRate * compoundFactor) / (compoundFactor - 1));

  return payment;
}

/**
 * Generate complete monthly amortization schedule
 *
 * @param principal - Loan amount in dollars
 * @param annualRate - Annual interest rate as decimal
 * @param termYears - Loan term in years
 * @returns Array of monthly payment entries
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termYears: number
): AmortizationEntry[] {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termYears);
  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;

  const schedule: AmortizationEntry[] = [];
  let balance = principal;

  for (let month = 1; month <= numPayments; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    balance = balance - principalPayment;

    // Handle floating point precision for final payment
    if (month === numPayments) {
      balance = 0;
    }

    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, balance),
    });
  }

  return schedule;
}

/**
 * Get remaining loan balance at end of a specific year
 *
 * @param schedule - Amortization schedule
 * @param year - Year number (1-indexed)
 * @returns Remaining loan balance
 */
export function getLoanBalanceAtYear(
  schedule: AmortizationEntry[],
  year: number
): number {
  const monthIndex = year * 12 - 1; // Convert year to 0-indexed month

  if (monthIndex < 0) {
    throw new Error('Year must be positive');
  }

  if (monthIndex >= schedule.length) {
    return 0; // Loan is paid off
  }

  return schedule[monthIndex].balance;
}

/**
 * Get total interest paid during a specific year
 *
 * @param schedule - Amortization schedule
 * @param year - Year number (1-indexed)
 * @returns Total interest paid in that year
 */
export function getInterestForYear(
  schedule: AmortizationEntry[],
  year: number
): number {
  const startMonth = (year - 1) * 12;
  const endMonth = year * 12;

  if (startMonth >= schedule.length) {
    return 0; // Year is beyond loan term
  }

  let totalInterest = 0;
  for (let i = startMonth; i < Math.min(endMonth, schedule.length); i++) {
    totalInterest += schedule[i].interest;
  }

  return totalInterest;
}

/**
 * Get total principal paid during a specific year
 *
 * @param schedule - Amortization schedule
 * @param year - Year number (1-indexed)
 * @returns Total principal paid in that year
 */
export function getPrincipalForYear(
  schedule: AmortizationEntry[],
  year: number
): number {
  const startMonth = (year - 1) * 12;
  const endMonth = year * 12;

  if (startMonth >= schedule.length) {
    return 0; // Year is beyond loan term
  }

  let totalPrincipal = 0;
  for (let i = startMonth; i < Math.min(endMonth, schedule.length); i++) {
    totalPrincipal += schedule[i].principal;
  }

  return totalPrincipal;
}
