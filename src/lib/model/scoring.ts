import type { ModelOutput } from '@/types';

/**
 * Score result for a single deal
 */
export interface DealScore {
  dealId: string;
  appreciationScore: number; // 1-10, from 10-year IRR percentile
  incomeScore: number; // 1-10, from average annual after-tax CF percentile
  compositeScore: number; // Weighted: 50% appreciation + 30% income + 20% risk
  riskScore?: number; // 1-10, user-provided (optional)
}

/**
 * Scoring weights for composite score calculation
 */
export const SCORING_WEIGHTS = {
  appreciation: 0.5,
  income: 0.3,
  risk: 0.2,
} as const;

/**
 * Calculate percentile rank of a value within a sorted array.
 * Returns 0-100 where 100 means the value is higher than all others.
 */
function percentileRank(values: number[], target: number): number {
  if (values.length <= 1) return 50;

  const below = values.filter((v) => v < target).length;
  const equal = values.filter((v) => v === target).length;
  const percentile = ((below + 0.5 * equal) / values.length) * 100;

  return percentile;
}

/**
 * Map a percentile (0-100) to a score (1-10)
 */
function percentileToScore(percentile: number): number {
  return 1 + (percentile / 100) * 9;
}

/**
 * Calculate scores for a set of analyzed deals.
 *
 * Scores are relative -- each deal is ranked against all others using
 * percentile ranking. This mirrors how investors compare properties:
 * a "good" IRR depends on what else is available.
 *
 * @param outputs - Model outputs from runModel() for each deal
 * @param riskScores - Optional map of dealId -> user-assigned risk score (1-10)
 * @returns Scored deals sorted by composite score (descending)
 */
export function calculateDealScores(
  outputs: ModelOutput[],
  riskScores: Record<string, number> = {}
): DealScore[] {
  if (outputs.length === 0) return [];

  // Extract metrics for percentile ranking
  const irrs = outputs.map((o) => o.resultsByHorizon.year10.irr);
  const cashFlows = outputs.map((o) => {
    const totalCF = o.resultsByYear.reduce((sum, yr) => sum + yr.cashFlowAfterTax, 0);
    return totalCF / o.resultsByYear.length;
  });

  const scores: DealScore[] = outputs.map((output, i) => {
    const irrPercentile = percentileRank(irrs, irrs[i]);
    const cfPercentile = percentileRank(cashFlows, cashFlows[i]);

    const appreciationScore = percentileToScore(irrPercentile);
    const incomeScore = percentileToScore(cfPercentile);
    const riskScore = riskScores[output.deal.id];

    const compositeScore = calculateCompositeScore(
      appreciationScore,
      incomeScore,
      riskScore
    );

    return {
      dealId: output.deal.id,
      appreciationScore: round2(appreciationScore),
      incomeScore: round2(incomeScore),
      compositeScore: round2(compositeScore),
      riskScore,
    };
  });

  return scores.sort((a, b) => b.compositeScore - a.compositeScore);
}

/**
 * Calculate composite score from component scores.
 * If risk score is not provided, reweights appreciation and income
 * proportionally (62.5% / 37.5%).
 */
function calculateCompositeScore(
  appreciationScore: number,
  incomeScore: number,
  riskScore?: number
): number {
  if (riskScore !== undefined) {
    return (
      SCORING_WEIGHTS.appreciation * appreciationScore +
      SCORING_WEIGHTS.income * incomeScore +
      SCORING_WEIGHTS.risk * riskScore
    );
  }

  // Without risk score, reweight the other two proportionally
  const totalWeight = SCORING_WEIGHTS.appreciation + SCORING_WEIGHTS.income;
  return (
    (SCORING_WEIGHTS.appreciation / totalWeight) * appreciationScore +
    (SCORING_WEIGHTS.income / totalWeight) * incomeScore
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
