import { describe, it, expect } from 'vitest';
import { calculateDealScores, SCORING_WEIGHTS } from '../scoring';
import type { ModelOutput, YearResult, HorizonResult } from '@/types';

function makeMinimalYearResult(cashFlowAfterTax: number): YearResult {
  return {
    year: 1,
    grossRent: 0,
    vacancy: 0,
    effectiveGrossIncome: 0,
    operatingExpenses: 0,
    operatingExpensesBreakdown: {
      propertyTax: 0,
      insurance: 0,
      hoa: 0,
      management: 0,
      repairs: 0,
      capex: 0,
      utilities: 0,
    },
    noi: 0,
    debtService: 0,
    cashFlowBeforeTax: 0,
    depreciation: 0,
    interestPaid: 0,
    principalPaid: 0,
    taxableIncome: 0,
    incomeTax: 0,
    cashFlowAfterTax,
    loanBalance: 0,
    propertyValue: 0,
    equity: 0,
  };
}

function makeMinimalHorizon(irr: number): HorizonResult {
  return {
    years: 10,
    initialEquity: 100000,
    cumulativeCashFlow: 0,
    remainingLoanBalance: 0,
    grossSalePrice: 0,
    sellingCosts: 0,
    capitalGainsTax: 0,
    depreciationRecapture: 0,
    totalTaxAtSale: 0,
    netSaleProceeds: 0,
    totalReturn: 0,
    irr,
    equityMultiple: 1,
    reitComparison: 0,
  };
}

function makeMockOutput(dealId: string, irr10: number, avgCashFlow: number): ModelOutput {
  return {
    deal: { id: dealId } as any,
    assumptions: {} as any,
    resultsByYear: Array.from({ length: 10 }, () => makeMinimalYearResult(avgCashFlow)),
    resultsByHorizon: {
      year5: makeMinimalHorizon(irr10 * 0.8),
      year7: makeMinimalHorizon(irr10 * 0.9),
      year10: makeMinimalHorizon(irr10),
    },
    sensitivityRuns: [],
    dataGaps: [],
    computedAt: new Date(),
  };
}

describe('calculateDealScores', () => {
  it('should return empty array for empty input', () => {
    expect(calculateDealScores([])).toEqual([]);
  });

  it('should score a single deal at midpoint', () => {
    const outputs = [makeMockOutput('deal-1', 0.12, 5000)];
    const scores = calculateDealScores(outputs);

    expect(scores).toHaveLength(1);
    expect(scores[0].dealId).toBe('deal-1');
    // Single deal gets percentile 50 -> score ~5.5
    expect(scores[0].appreciationScore).toBeCloseTo(5.5, 1);
    expect(scores[0].incomeScore).toBeCloseTo(5.5, 1);
  });

  it('should rank deals by composite score descending', () => {
    const outputs = [
      makeMockOutput('low', 0.05, 2000),
      makeMockOutput('high', 0.15, 8000),
      makeMockOutput('mid', 0.10, 5000),
    ];

    const scores = calculateDealScores(outputs);

    expect(scores[0].dealId).toBe('high');
    expect(scores[1].dealId).toBe('mid');
    expect(scores[2].dealId).toBe('low');
  });

  it('should give highest IRR deal the highest appreciation score', () => {
    const outputs = [
      makeMockOutput('a', 0.05, 5000),
      makeMockOutput('b', 0.15, 5000),
      makeMockOutput('c', 0.10, 5000),
    ];

    const scores = calculateDealScores(outputs);
    const scoreMap = Object.fromEntries(scores.map((s) => [s.dealId, s]));

    expect(scoreMap['b'].appreciationScore).toBeGreaterThan(scoreMap['c'].appreciationScore);
    expect(scoreMap['c'].appreciationScore).toBeGreaterThan(scoreMap['a'].appreciationScore);
  });

  it('should incorporate risk scores into composite when provided', () => {
    const outputs = [
      makeMockOutput('risky', 0.15, 8000),
      makeMockOutput('safe', 0.10, 5000),
    ];

    // "risky" has better financials but worse risk score
    const riskScores = { risky: 3, safe: 9 };
    const scores = calculateDealScores(outputs, riskScores);

    // Both should have risk scores set
    const riskyScore = scores.find((s) => s.dealId === 'risky')!;
    const safeScore = scores.find((s) => s.dealId === 'safe')!;

    expect(riskyScore.riskScore).toBe(3);
    expect(safeScore.riskScore).toBe(9);
  });

  it('should use correct weighting (50/30/20)', () => {
    expect(SCORING_WEIGHTS.appreciation).toBe(0.5);
    expect(SCORING_WEIGHTS.income).toBe(0.3);
    expect(SCORING_WEIGHTS.risk).toBe(0.2);
  });

  it('should handle deals with identical metrics', () => {
    const outputs = [
      makeMockOutput('a', 0.10, 5000),
      makeMockOutput('b', 0.10, 5000),
    ];

    const scores = calculateDealScores(outputs);
    expect(scores[0].appreciationScore).toBe(scores[1].appreciationScore);
    expect(scores[0].incomeScore).toBe(scores[1].incomeScore);
  });
});
