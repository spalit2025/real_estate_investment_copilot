import type {
  Deal,
  GlobalAssumptions,
  ModelOutput,
  YearResult,
  HorizonResult,
  DataGap,
  DataGapImpact,
} from '@/types';
import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  getLoanBalanceAtYear,
  getInterestForYear,
  getPrincipalForYear,
} from './amortization';
import { calculateIRR, calculateEquityMultiple, calculateREITComparison } from './irr';
import {
  calculateAnnualIncome,
  calculateOperatingExpenses,
  calculateNOI,
  calculateCashFlowBeforeTax,
  calculateInitialEquity,
  calculateLoanAmount,
  calculatePropertyValue,
  calculateEquity,
} from './cashflow';
import {
  calculateAnnualDepreciation,
  calculateTaxableIncome,
  calculateIncomeTax,
  calculateCashFlowAfterTax,
  calculateExitTaxes,
  calculateSellingCosts,
  calculateNetSaleProceeds,
  getCombinedTaxRate,
} from './taxes';
import { runSensitivityAnalysis } from './sensitivity';
import {
  getEffectiveAssumptions,
  DEFAULT_DEAL_VALUES,
  ANALYSIS_HORIZONS,
} from '@/config/defaults';

// Re-export individual modules for convenience
export * from './amortization';
export * from './irr';
export * from './cashflow';
export * from './taxes';
export * from './sensitivity';

/**
 * Run complete financial model for a deal
 *
 * This is the main orchestration function that:
 * 1. Computes year-by-year cash flows for years 1-10
 * 2. Calculates horizon summaries for 5, 7, and 10 year holding periods
 * 3. Runs sensitivity analysis
 * 4. Identifies data gaps
 *
 * @param deal - Property deal to analyze
 * @param assumptionOverrides - Optional overrides for global assumptions
 * @returns Complete model output
 */
export function runModel(
  deal: Deal,
  assumptionOverrides?: Partial<GlobalAssumptions>
): ModelOutput {
  // Merge assumptions
  const assumptions = getEffectiveAssumptions({
    ...deal.assumptionOverrides,
    ...assumptionOverrides,
  });

  // Calculate initial values
  const initialEquity = calculateInitialEquity(
    deal.purchasePrice,
    deal.downPaymentPct,
    deal.closingCostsPct
  );
  const loanAmount = calculateLoanAmount(deal.purchasePrice, deal.downPaymentPct);
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    deal.interestRate,
    deal.loanTermYears
  );
  const annualDebtService = monthlyPayment * 12;

  // Generate amortization schedule
  const amortizationSchedule = generateAmortizationSchedule(
    loanAmount,
    deal.interestRate,
    deal.loanTermYears
  );

  // Calculate depreciation
  const annualDepreciation = calculateAnnualDepreciation(
    deal.purchasePrice,
    assumptions.landValuePct,
    assumptions.depreciationYears
  );

  // Combined tax rate
  const combinedTaxRate = getCombinedTaxRate(assumptions);

  // Calculate year-by-year results (years 1-10)
  const resultsByYear: YearResult[] = [];

  for (let year = 1; year <= 10; year++) {
    // Income
    const income = calculateAnnualIncome(deal, year);

    // Expenses
    const expenses = calculateOperatingExpenses(
      deal,
      income.effectiveGrossIncome,
      year
    );

    // NOI and Cash Flow
    const noi = calculateNOI(income.effectiveGrossIncome, expenses.total);
    const cashFlowBeforeTax = calculateCashFlowBeforeTax(noi, annualDebtService);

    // Tax calculations
    const interestPaid = getInterestForYear(amortizationSchedule, year);
    const principalPaid = getPrincipalForYear(amortizationSchedule, year);
    const taxableIncome = calculateTaxableIncome(noi, annualDepreciation, interestPaid);
    const incomeTax = calculateIncomeTax(taxableIncome, combinedTaxRate);
    const cashFlowAfterTax = calculateCashFlowAfterTax(cashFlowBeforeTax, incomeTax);

    // Balance sheet
    const loanBalance = getLoanBalanceAtYear(amortizationSchedule, year);
    const propertyValue = calculatePropertyValue(
      deal.purchasePrice,
      deal.appreciationPct,
      year
    );
    const equity = calculateEquity(propertyValue, loanBalance);

    resultsByYear.push({
      year,
      grossRent: income.grossRent,
      vacancy: income.vacancyLoss,
      effectiveGrossIncome: income.effectiveGrossIncome,
      operatingExpenses: expenses.total,
      operatingExpensesBreakdown: {
        propertyTax: expenses.propertyTax,
        insurance: expenses.insurance,
        hoa: expenses.hoa,
        management: expenses.management,
        repairs: expenses.repairs,
        capex: expenses.capex,
        utilities: expenses.utilities,
      },
      noi,
      debtService: annualDebtService,
      cashFlowBeforeTax,
      depreciation: annualDepreciation,
      interestPaid,
      principalPaid,
      taxableIncome,
      incomeTax,
      cashFlowAfterTax,
      loanBalance,
      propertyValue,
      equity,
    });
  }

  // Calculate horizon results
  const resultsByHorizon = {
    year5: calculateHorizonResult(deal, assumptions, resultsByYear, initialEquity, 5),
    year7: calculateHorizonResult(deal, assumptions, resultsByYear, initialEquity, 7),
    year10: calculateHorizonResult(deal, assumptions, resultsByYear, initialEquity, 10),
  };

  // Run sensitivity analysis using a model runner callback
  const modelRunner = (modifiedDeal: Deal, modifiedAssumptions: GlobalAssumptions) => {
    // Run a simplified model for IRR only
    const result = runModelForIRR(modifiedDeal, modifiedAssumptions);
    return {
      irr5: result.irr5,
      irr7: result.irr7,
      irr10: result.irr10,
    };
  };

  const sensitivityRuns = runSensitivityAnalysis(deal, assumptions, modelRunner);

  // Identify data gaps
  const dataGaps = identifyDataGaps(deal);

  return {
    deal,
    assumptions,
    resultsByYear,
    resultsByHorizon,
    sensitivityRuns,
    dataGaps,
    computedAt: new Date(),
  };
}

/**
 * Calculate results for a specific holding period (horizon)
 */
function calculateHorizonResult(
  deal: Deal,
  assumptions: GlobalAssumptions,
  yearResults: YearResult[],
  initialEquity: number,
  years: number
): HorizonResult {
  // Cumulative cash flow (after-tax)
  const cumulativeCashFlow = yearResults
    .slice(0, years)
    .reduce((sum, yr) => sum + yr.cashFlowAfterTax, 0);

  // Exit values
  const finalYear = yearResults[years - 1];
  const remainingLoanBalance = finalYear.loanBalance;
  const grossSalePrice = finalYear.propertyValue;
  const sellingCosts = calculateSellingCosts(grossSalePrice, deal.sellingCostsPct);

  // Exit taxes
  const totalDepreciation = finalYear.depreciation * years;
  const exitTaxes = calculateExitTaxes({
    purchasePrice: deal.purchasePrice,
    salePrice: grossSalePrice,
    totalDepreciation,
    capitalGainsRate: assumptions.capitalGainsRate,
    recaptureRate: assumptions.deprecationRecaptureRate,
    stateTaxRate: assumptions.stateTaxRate,
  });

  // Net sale proceeds
  const netSaleProceeds = calculateNetSaleProceeds(
    grossSalePrice,
    sellingCosts,
    exitTaxes.totalTax,
    remainingLoanBalance
  );

  // Total return
  const totalReturn = cumulativeCashFlow + netSaleProceeds;

  // Build cash flows for IRR calculation
  const cashFlows = [-initialEquity];
  for (let i = 0; i < years - 1; i++) {
    cashFlows.push(yearResults[i].cashFlowAfterTax);
  }
  // Last year includes sale proceeds
  cashFlows.push(yearResults[years - 1].cashFlowAfterTax + netSaleProceeds);

  // Calculate IRR
  const irr = calculateIRR(cashFlows) ?? 0;

  // Calculate equity multiple
  const equityMultiple = calculateEquityMultiple(cashFlows);

  // REIT comparison
  const reitComparison = calculateREITComparison(
    totalReturn,
    initialEquity,
    years,
    assumptions.reitBaselineReturn
  );

  return {
    years,
    initialEquity,
    cumulativeCashFlow,
    remainingLoanBalance,
    grossSalePrice,
    sellingCosts,
    capitalGainsTax: exitTaxes.capitalGainsTax,
    depreciationRecapture: exitTaxes.recaptureTax,
    totalTaxAtSale: exitTaxes.totalTax,
    netSaleProceeds,
    totalReturn,
    irr,
    equityMultiple,
    reitComparison,
  };
}

/**
 * Simplified model runner for sensitivity analysis
 * Returns only IRR values at 5/7/10 years
 */
function runModelForIRR(
  deal: Deal,
  assumptions: GlobalAssumptions
): { irr5: number; irr7: number; irr10: number } {
  // Initial values
  const initialEquity = calculateInitialEquity(
    deal.purchasePrice,
    deal.downPaymentPct,
    deal.closingCostsPct
  );
  const loanAmount = calculateLoanAmount(deal.purchasePrice, deal.downPaymentPct);
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    deal.interestRate,
    deal.loanTermYears
  );
  const annualDebtService = monthlyPayment * 12;

  const amortizationSchedule = generateAmortizationSchedule(
    loanAmount,
    deal.interestRate,
    deal.loanTermYears
  );

  const annualDepreciation = calculateAnnualDepreciation(
    deal.purchasePrice,
    assumptions.landValuePct,
    assumptions.depreciationYears
  );

  const combinedTaxRate = getCombinedTaxRate(assumptions);

  // Calculate cash flows for each year
  const annualCashFlows: number[] = [];

  for (let year = 1; year <= 10; year++) {
    const income = calculateAnnualIncome(deal, year);
    const expenses = calculateOperatingExpenses(deal, income.effectiveGrossIncome, year);
    const noi = calculateNOI(income.effectiveGrossIncome, expenses.total);
    const cfbt = calculateCashFlowBeforeTax(noi, annualDebtService);
    const interestPaid = getInterestForYear(amortizationSchedule, year);
    const taxableIncome = calculateTaxableIncome(noi, annualDepreciation, interestPaid);
    const incomeTax = calculateIncomeTax(taxableIncome, combinedTaxRate);
    const cfat = calculateCashFlowAfterTax(cfbt, incomeTax);
    annualCashFlows.push(cfat);
  }

  // Helper to calculate IRR for a given horizon
  const getIRR = (years: number): number => {
    const loanBalance = getLoanBalanceAtYear(amortizationSchedule, years);
    const propertyValue = calculatePropertyValue(
      deal.purchasePrice,
      deal.appreciationPct,
      years
    );
    const sellingCosts = calculateSellingCosts(propertyValue, deal.sellingCostsPct);
    const totalDepreciation = annualDepreciation * years;

    const exitTaxes = calculateExitTaxes({
      purchasePrice: deal.purchasePrice,
      salePrice: propertyValue,
      totalDepreciation,
      capitalGainsRate: assumptions.capitalGainsRate,
      recaptureRate: assumptions.deprecationRecaptureRate,
      stateTaxRate: assumptions.stateTaxRate,
    });

    const netProceeds = calculateNetSaleProceeds(
      propertyValue,
      sellingCosts,
      exitTaxes.totalTax,
      loanBalance
    );

    const cashFlows = [-initialEquity];
    for (let i = 0; i < years - 1; i++) {
      cashFlows.push(annualCashFlows[i]);
    }
    cashFlows.push(annualCashFlows[years - 1] + netProceeds);

    return calculateIRR(cashFlows) ?? 0;
  };

  return {
    irr5: getIRR(5),
    irr7: getIRR(7),
    irr10: getIRR(10),
  };
}

/**
 * Identify data gaps in deal inputs
 *
 * Checks for missing or default values that could significantly impact analysis
 */
function identifyDataGaps(deal: Deal): DataGap[] {
  const gaps: DataGap[] = [];

  // Property tax - HIGH impact if missing/default
  if (!deal.propertyTaxAnnual || deal.propertyTaxAnnual === 0) {
    gaps.push({
      field: 'propertyTaxAnnual',
      impact: 'high',
      defaultUsed: 'Not provided',
      recommendation: 'Get exact property tax from county records or listing',
    });
  }

  // Insurance - MEDIUM impact
  if (!deal.insuranceAnnual || deal.insuranceAnnual === 0) {
    gaps.push({
      field: 'insuranceAnnual',
      impact: 'medium',
      defaultUsed: 'Not provided',
      recommendation: 'Get insurance quotes for accurate estimate',
    });
  }

  // Vacancy - MEDIUM impact if using default
  if (deal.vacancyPct === DEFAULT_DEAL_VALUES.vacancyPct) {
    gaps.push({
      field: 'vacancyPct',
      impact: 'medium',
      defaultUsed: `${(DEFAULT_DEAL_VALUES.vacancyPct! * 100).toFixed(0)}%`,
      recommendation: 'Research local vacancy rates for this market',
    });
  }

  // Rent growth - MEDIUM impact
  if (deal.rentGrowthPct === DEFAULT_DEAL_VALUES.rentGrowthPct) {
    gaps.push({
      field: 'rentGrowthPct',
      impact: 'medium',
      defaultUsed: `${(DEFAULT_DEAL_VALUES.rentGrowthPct! * 100).toFixed(0)}%`,
      recommendation: 'Research historical rent growth for this market',
    });
  }

  // Appreciation - HIGH impact
  if (deal.appreciationPct === DEFAULT_DEAL_VALUES.appreciationPct) {
    gaps.push({
      field: 'appreciationPct',
      impact: 'high',
      defaultUsed: `${(DEFAULT_DEAL_VALUES.appreciationPct! * 100).toFixed(0)}%`,
      recommendation: 'Research historical appreciation for this specific market',
    });
  }

  // Known CapEx - LOW impact if empty but user should be aware
  if (!deal.knownCapex || deal.knownCapex.trim() === '') {
    gaps.push({
      field: 'knownCapex',
      impact: 'low',
      defaultUsed: 'None noted',
      recommendation: 'Document any known upcoming repairs or replacements',
    });
  }

  // Rent controlled flag - HIGH impact if not explicitly set
  if (deal.isRentControlled === undefined) {
    gaps.push({
      field: 'isRentControlled',
      impact: 'high',
      defaultUsed: 'false',
      recommendation: 'Verify rent control status with local regulations',
    });
  }

  return gaps;
}

/**
 * Determine investment verdict based on metrics
 *
 * @param horizonResult - Results for the evaluation horizon (typically 7-year)
 * @param dataGaps - Identified data gaps
 * @returns Verdict and primary driver
 */
export function determineVerdict(
  horizonResult: HorizonResult,
  dataGaps: DataGap[]
): { verdict: 'buy' | 'skip' | 'watch'; driver: string } {
  const hasHighGaps = dataGaps.some((g) => g.impact === 'high');

  // BUY criteria: IRR > 12%, Multiple > 1.8x, beats REIT by > 2%, no HIGH gaps
  if (
    horizonResult.irr > 0.12 &&
    horizonResult.equityMultiple > 1.8 &&
    horizonResult.reitComparison > 0.02 &&
    !hasHighGaps
  ) {
    const driver =
      horizonResult.irr > 0.15
        ? `Strong ${(horizonResult.irr * 100).toFixed(1)}% IRR`
        : `Solid ${(horizonResult.equityMultiple.toFixed(1))}x equity multiple`;

    return { verdict: 'buy', driver };
  }

  // SKIP criteria: IRR < 8% or doesn't beat REIT
  // Show both reasons when both conditions are true
  const lowIRR = horizonResult.irr < 0.08;
  const underperformsREIT = horizonResult.reitComparison < 0;

  if (lowIRR || underperformsREIT) {
    const reasons: string[] = [];

    if (lowIRR) {
      reasons.push(`Low ${(horizonResult.irr * 100).toFixed(1)}% IRR`);
    }
    if (underperformsREIT) {
      reasons.push(`Underperforms REIT by ${Math.abs(horizonResult.reitComparison * 100).toFixed(1)}%`);
    }

    return { verdict: 'skip', driver: reasons.join(' • ') };
  }

  // WATCH: everything else
  const driver = hasHighGaps
    ? 'High-impact data gaps need resolution'
    : `Moderate ${(horizonResult.irr * 100).toFixed(1)}% IRR - borderline deal`;

  return { verdict: 'watch', driver };
}
