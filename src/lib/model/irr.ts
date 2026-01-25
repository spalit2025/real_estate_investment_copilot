/**
 * IRR (Internal Rate of Return) calculations using Newton-Raphson method
 *
 * IRR is the discount rate that makes NPV = 0
 */

const TOLERANCE = 0.0001; // 0.01% precision
const MAX_ITERATIONS = 100;
const INITIAL_GUESS = 0.10; // 10% starting guess

/**
 * Calculate Net Present Value of cash flows at a given discount rate
 *
 * Formula: NPV = sum(CF_t / (1 + r)^t) for t = 0 to n
 *
 * @param cashFlows - Array of cash flows where index is the year (0-indexed)
 * @param rate - Discount rate as decimal
 * @returns NPV value
 */
export function calculateNPV(cashFlows: number[], rate: number): number {
  if (cashFlows.length === 0) {
    throw new Error('Cash flows array cannot be empty');
  }

  let npv = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    npv += cashFlows[t] / Math.pow(1 + rate, t);
  }

  return npv;
}

/**
 * Calculate derivative of NPV with respect to rate (for Newton-Raphson)
 *
 * Formula: dNPV/dr = sum(-t * CF_t / (1 + r)^(t+1)) for t = 0 to n
 *
 * @param cashFlows - Array of cash flows
 * @param rate - Current rate estimate
 * @returns Derivative of NPV
 */
function calculateNPVDerivative(cashFlows: number[], rate: number): number {
  let derivative = 0;
  for (let t = 0; t < cashFlows.length; t++) {
    derivative += (-t * cashFlows[t]) / Math.pow(1 + rate, t + 1);
  }
  return derivative;
}

/**
 * Calculate IRR using Newton-Raphson iterative method
 *
 * Newton-Raphson formula: r_new = r_old - f(r_old) / f'(r_old)
 * where f(r) = NPV(r) and we're finding r such that NPV = 0
 *
 * @param cashFlows - Array of cash flows where index 0 is initial investment (should be negative)
 * @returns IRR as decimal (e.g., 0.12 for 12%), or null if no solution found
 */
export function calculateIRR(cashFlows: number[]): number | null {
  if (cashFlows.length < 2) {
    throw new Error('Need at least 2 cash flows for IRR calculation');
  }

  if (cashFlows[0] >= 0) {
    throw new Error('Initial investment (cash flow at year 0) must be negative');
  }

  // Check if there's any positive cash flow
  const hasPositive = cashFlows.slice(1).some((cf) => cf > 0);
  if (!hasPositive) {
    // All future cash flows non-positive means no positive IRR possible
    return null;
  }

  let rate = INITIAL_GUESS;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const npv = calculateNPV(cashFlows, rate);
    const derivative = calculateNPVDerivative(cashFlows, rate);

    // Check for convergence on NPV
    if (Math.abs(npv) < TOLERANCE) {
      return rate;
    }

    // Avoid division by zero or very small derivative
    if (Math.abs(derivative) < 1e-10) {
      // Try a slightly different rate
      rate = rate + 0.01;
      continue;
    }

    // Newton-Raphson step
    const newRate = rate - npv / derivative;

    // Check for rate convergence before bounding
    const rateChange = Math.abs(newRate - rate);

    // Bound the rate to reasonable values (-0.99 to 10)
    // to prevent divergence
    if (newRate < -0.99) {
      rate = -0.50;
    } else if (newRate > 10) {
      rate = 5;
    } else {
      rate = newRate;
    }

    // Check for very slow convergence (rate change is tiny)
    if (rateChange < TOLERANCE / 100) {
      return rate;
    }
  }

  // If Newton-Raphson didn't converge, try bisection as fallback
  return bisectionIRR(cashFlows);
}

/**
 * Fallback bisection method for IRR when Newton-Raphson fails to converge
 *
 * @param cashFlows - Array of cash flows
 * @returns IRR or null if no solution found
 */
function bisectionIRR(cashFlows: number[]): number | null {
  let lower = -0.99;
  let upper = 10;

  const npvLower = calculateNPV(cashFlows, lower);
  const npvUpper = calculateNPV(cashFlows, upper);

  // If NPVs have same sign, no root in this interval
  if (npvLower * npvUpper > 0) {
    return null;
  }

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const mid = (lower + upper) / 2;
    const npvMid = calculateNPV(cashFlows, mid);

    if (Math.abs(npvMid) < TOLERANCE) {
      return mid;
    }

    if (npvLower * npvMid < 0) {
      upper = mid;
    } else {
      lower = mid;
    }
  }

  // Return best estimate
  return (lower + upper) / 2;
}

/**
 * Calculate equity multiple (total return / initial investment)
 *
 * @param cashFlows - Array of cash flows where index 0 is initial investment
 * @returns Equity multiple (e.g., 1.8 for 1.8x)
 */
export function calculateEquityMultiple(cashFlows: number[]): number {
  if (cashFlows.length < 2) {
    throw new Error('Need at least 2 cash flows');
  }

  const initialInvestment = Math.abs(cashFlows[0]);

  if (initialInvestment === 0) {
    throw new Error('Initial investment cannot be zero');
  }

  // Total return is sum of all positive cash flows
  const totalReturn = cashFlows.slice(1).reduce((sum, cf) => sum + cf, 0);

  return totalReturn / initialInvestment;
}

/**
 * Calculate REIT comparison (excess return vs REIT baseline)
 *
 * @param totalReturn - Total return from investment
 * @param initialEquity - Initial equity invested
 * @param years - Holding period
 * @param reitReturn - Annual REIT return rate (e.g., 0.06 for 6%)
 * @returns Excess return as decimal (positive = beats REIT)
 */
export function calculateREITComparison(
  totalReturn: number,
  initialEquity: number,
  years: number,
  reitReturn: number
): number {
  // REIT future value: P * (1 + r)^n
  const reitFutureValue = initialEquity * Math.pow(1 + reitReturn, years);

  // Excess return percentage
  const excessReturn = totalReturn / reitFutureValue - 1;

  return excessReturn;
}
