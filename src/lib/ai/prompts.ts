/**
 * AI Prompt templates for narrative generation
 */

import type { Deal } from '@/types/deal';
import type { ModelOutput, YearResult, HorizonResult, SensitivityResult, DataGap } from '@/types/model';

/**
 * System prompt for memo generation
 */
export const MEMO_SYSTEM_PROMPT = `You are a real estate investment analyst generating professional investment memos.

CRITICAL RULES:
1. NEVER calculate or invent numbers - use ONLY the computed values provided
2. Your job is to EXPLAIN and INTERPRET, not compute
3. Be crisp, decision-oriented, use bullets and short paragraphs
4. Focus on what matters: the verdict and what drives it
5. Keep responses concise - aim for 400-600 words total

You will receive pre-computed financial analysis. Your role is to:
- Interpret what the numbers mean for the investor
- Highlight the most important findings
- Explain risks in plain language
- Provide actionable next steps

Never say "based on my calculations" - you don't calculate. Say "the analysis shows" or "the model indicates".`;

/**
 * Format currency for prompts
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format percentage for prompts
 */
function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Get sensitivity result for a specific variable and delta
 */
function getSensitivityIRR(
  sensitivity: SensitivityResult[],
  variable: string,
  delta: number
): string {
  const result = sensitivity.find(
    (s) => s.variable === variable && Math.abs(s.delta - delta) < 0.001
  );
  return result ? formatPercent(result.irr7) : 'N/A';
}

/**
 * Format data gaps for prompt
 */
function formatDataGaps(gaps: DataGap[]): string {
  if (gaps.length === 0) {
    return 'No significant data gaps identified.';
  }

  return gaps
    .map((gap) => `- ${gap.field} (${gap.impact} impact): ${gap.recommendation}`)
    .join('\n');
}

/**
 * Build user prompt for single deal memo generation
 */
export function buildMemoUserPrompt(
  deal: Deal,
  modelOutput: ModelOutput,
  verdict: 'buy' | 'skip' | 'watch',
  verdictReason: string
): string {
  const { resultsByYear, resultsByHorizon, sensitivityRuns, dataGaps } = modelOutput;

  // Get key year results
  const year1 = resultsByYear.find((y) => y.year === 1)!;
  const year5 = resultsByYear.find((y) => y.year === 5)!;
  const year10 = resultsByYear.find((y) => y.year === 10)!;

  // Get horizon results
  const h5 = resultsByHorizon.year5;
  const h7 = resultsByHorizon.year7;
  const h10 = resultsByHorizon.year10;

  return `Generate an investment memo narrative for this property analysis.

VERDICT: ${verdict.toUpperCase()}
REASON: ${verdictReason}

PROPERTY:
- Address: ${deal.address}, ${deal.city}, ${deal.state} ${deal.zip}
- Type: ${deal.propertyType} | ${deal.beds}bd/${deal.baths}ba | ${deal.sqft} sqft | Built ${deal.yearBuilt}
- Market: ${deal.marketTag === 'bay_area_appreciation' ? 'Bay Area (Appreciation Focus)' : 'Cash Flow Market'}

PURCHASE & FINANCING:
- Purchase Price: ${formatCurrency(deal.purchasePrice)}
- Down Payment: ${formatPercent(deal.downPaymentPct)} (${formatCurrency(deal.purchasePrice * deal.downPaymentPct)})
- Loan Amount: ${formatCurrency(deal.purchasePrice * (1 - deal.downPaymentPct))}
- Interest Rate: ${formatPercent(deal.interestRate)} for ${deal.loanTermYears} years
- Initial Equity Required: ${formatCurrency(h5.initialEquity)}

INCOME ASSUMPTIONS:
- Monthly Rent: ${formatCurrency(deal.monthlyRent)}
- Vacancy: ${formatPercent(deal.vacancyPct)}
- Rent Growth: ${formatPercent(deal.rentGrowthPct)}/year

COMPUTED CASH FLOW (use these exact numbers):
- Year 1: Cash Flow ${formatCurrency(year1.cashFlowAfterTax)}, NOI ${formatCurrency(year1.noi)}
- Year 5: Cash Flow ${formatCurrency(year5.cashFlowAfterTax)}, NOI ${formatCurrency(year5.noi)}
- Year 10: Cash Flow ${formatCurrency(year10.cashFlowAfterTax)}, NOI ${formatCurrency(year10.noi)}

HORIZON ANALYSIS (use these exact numbers):
| Horizon | IRR | Equity Multiple | Net Proceeds | vs REIT |
|---------|-----|-----------------|--------------|---------|
| 5-Year  | ${formatPercent(h5.irr)} | ${h5.equityMultiple.toFixed(2)}x | ${formatCurrency(h5.netSaleProceeds)} | ${h5.reitComparison > 0 ? '+' : ''}${formatPercent(h5.reitComparison)} |
| 7-Year  | ${formatPercent(h7.irr)} | ${h7.equityMultiple.toFixed(2)}x | ${formatCurrency(h7.netSaleProceeds)} | ${h7.reitComparison > 0 ? '+' : ''}${formatPercent(h7.reitComparison)} |
| 10-Year | ${formatPercent(h10.irr)} | ${h10.equityMultiple.toFixed(2)}x | ${formatCurrency(h10.netSaleProceeds)} | ${h10.reitComparison > 0 ? '+' : ''}${formatPercent(h10.reitComparison)} |

SENSITIVITY ANALYSIS (7-Year IRR under different scenarios):
- Rent -10%: ${getSensitivityIRR(sensitivityRuns, 'rent', -0.10)}
- Rent +10%: ${getSensitivityIRR(sensitivityRuns, 'rent', 0.10)}
- Appreciation -2%: ${getSensitivityIRR(sensitivityRuns, 'appreciation', -0.02)}
- Appreciation +2%: ${getSensitivityIRR(sensitivityRuns, 'appreciation', 0.02)}
- Vacancy +5%: ${getSensitivityIRR(sensitivityRuns, 'vacancy', 0.05)}

DATA GAPS:
${formatDataGaps(dataGaps)}

CONSTRAINTS:
- Rent Control: ${deal.isRentControlled ? 'YES - rent increases may be limited' : 'No'}
- HOA Rental Limit: ${deal.hasHOARentalLimit ? 'YES - verify rental cap' : 'No'}
- Known CapEx Issues: ${deal.knownCapex || 'None noted'}

Generate a concise narrative memo with these sections:
1. **Executive Summary** (2-3 sentences on the verdict and why)
2. **Investment Highlights** (3-4 bullet points of positives)
3. **Key Concerns** (2-3 bullet points of risks or negatives)
4. **Sensitivity Insights** (what affects returns most)
5. **Recommendation** (clear action items)

Be direct and actionable. This is for a sophisticated investor who wants clarity, not fluff.`;
}

/**
 * Build comparison prompt for multiple deals
 */
export function buildComparisonPrompt(
  deals: Array<{
    deal: Deal;
    modelOutput: ModelOutput;
    verdict: 'buy' | 'skip' | 'watch';
  }>
): string {
  const dealSummaries = deals
    .map((d, i) => {
      const h7 = d.modelOutput.resultsByHorizon.year7;
      return `Deal ${i + 1}: ${d.deal.address}, ${d.deal.city}
  - Price: ${formatCurrency(d.deal.purchasePrice)}
  - 7-Year IRR: ${formatPercent(h7.irr)}
  - Equity Multiple: ${h7.equityMultiple.toFixed(2)}x
  - vs REIT: ${h7.reitComparison > 0 ? '+' : ''}${formatPercent(h7.reitComparison)}
  - Market: ${d.deal.marketTag}
  - Verdict: ${d.verdict.toUpperCase()}`;
    })
    .join('\n\n');

  return `Compare these ${deals.length} investment opportunities.

${dealSummaries}

Provide:
1. Ranking by risk-adjusted return (best to worst)
2. Which is best for cash flow vs appreciation
3. Portfolio fit considerations
4. Clear recommendation on which to pursue first`;
}
