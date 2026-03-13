/**
 * Markdown Export API route
 * Generates a markdown investment memo for download
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server-client';
import { getDeal } from '@/lib/db/deals';
import { getMemoByDealId } from '@/lib/db/memos';
import { runModel, determineVerdict } from '@/lib/model';
import type { Deal } from '@/types/deal';
import type { ModelOutput } from '@/types/model';
import type { MemoNarrative } from '@/lib/ai';

// Helper functions
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value: number): string =>
  `${(value * 100).toFixed(1)}%`;

function generateMarkdown(
  deal: Deal,
  modelOutput: ModelOutput,
  verdict: 'buy' | 'skip' | 'watch',
  verdictReason: string,
  narrative?: MemoNarrative
): string {
  const { resultsByYear, resultsByHorizon, sensitivityRuns, dataGaps, assumptions } = modelOutput;
  const h5 = resultsByHorizon.year5;
  const h7 = resultsByHorizon.year7;
  const h10 = resultsByHorizon.year10;

  const verdictEmoji = verdict === 'buy' ? '✅' : verdict === 'skip' ? '❌' : '⚠️';

  let md = `# Investment Memo

**Property:** ${deal.address}, ${deal.city}, ${deal.state} ${deal.zip}
**Type:** ${deal.propertyType.toUpperCase()} | ${deal.beds}bd/${deal.baths}ba | ${deal.sqft} sqft | Built ${deal.yearBuilt}
**Generated:** ${new Date().toLocaleDateString()}

---

## ${verdictEmoji} Verdict: ${verdict.toUpperCase()}

**${verdictReason}**

| Metric | Value |
|--------|-------|
| Purchase Price | ${formatCurrency(deal.purchasePrice)} |
| 7-Year IRR | ${formatPercent(h7.irr)} |
| Equity Multiple | ${h7.equityMultiple.toFixed(2)}x |
| vs REIT Baseline | ${h7.reitComparison > 0 ? '+' : ''}${formatPercent(h7.reitComparison)} |

`;

  // AI Executive Summary
  if (narrative?.executiveSummary) {
    md += `---

## Executive Summary

${narrative.executiveSummary}

`;
  }

  // AI Highlights and Concerns
  if (narrative && (narrative.investmentHighlights.length > 0 || narrative.keyConcerns.length > 0)) {
    if (narrative.investmentHighlights.length > 0) {
      md += `### Investment Highlights

${narrative.investmentHighlights.map(h => `- ${h}`).join('\n')}

`;
    }

    if (narrative.keyConcerns.length > 0) {
      md += `### Key Concerns

${narrative.keyConcerns.map(c => `- ${c}`).join('\n')}

`;
    }
  }

  // Investment Returns
  md += `---

## Investment Returns

| Horizon | IRR | Equity Multiple | Total Return | Net Proceeds | vs REIT |
|---------|-----|-----------------|--------------|--------------|---------|
| 5-Year | ${formatPercent(h5.irr)} | ${h5.equityMultiple.toFixed(2)}x | ${formatCurrency(h5.totalReturn)} | ${formatCurrency(h5.netSaleProceeds)} | ${h5.reitComparison > 0 ? '+' : ''}${formatPercent(h5.reitComparison)} |
| 7-Year | ${formatPercent(h7.irr)} | ${h7.equityMultiple.toFixed(2)}x | ${formatCurrency(h7.totalReturn)} | ${formatCurrency(h7.netSaleProceeds)} | ${h7.reitComparison > 0 ? '+' : ''}${formatPercent(h7.reitComparison)} |
| 10-Year | ${formatPercent(h10.irr)} | ${h10.equityMultiple.toFixed(2)}x | ${formatCurrency(h10.totalReturn)} | ${formatCurrency(h10.netSaleProceeds)} | ${h10.reitComparison > 0 ? '+' : ''}${formatPercent(h10.reitComparison)} |

`;

  // Key Assumptions
  md += `---

## Key Assumptions

### Financing
- **Down Payment:** ${formatPercent(deal.downPaymentPct)} (${formatCurrency(deal.purchasePrice * deal.downPaymentPct)})
- **Loan Amount:** ${formatCurrency(deal.purchasePrice * (1 - deal.downPaymentPct))}
- **Interest Rate:** ${formatPercent(deal.interestRate)}
- **Loan Term:** ${deal.loanTermYears} years
- **ARM:** ${deal.isARM ? 'Yes' : 'No'}

### Income
- **Monthly Rent:** ${formatCurrency(deal.monthlyRent)}
- **Annual Rent:** ${formatCurrency(deal.monthlyRent * 12)}
- **Vacancy:** ${formatPercent(deal.vacancyPct)}
- **Rent Growth:** ${formatPercent(deal.rentGrowthPct)}/year

### Expenses
- **Property Tax:** ${formatCurrency(deal.propertyTaxAnnual)}/year
- **Insurance:** ${formatCurrency(deal.insuranceAnnual)}/year
- **HOA:** ${formatCurrency(deal.hoaMonthly * 12)}/year
- **Management:** ${formatPercent(deal.managementPct)} of gross rent
- **Repairs:** ${formatPercent(deal.repairsPct)} of gross rent
- **CapEx Reserve:** ${formatPercent(deal.capexPct)} of gross rent

### Exit
- **Appreciation:** ${formatPercent(deal.appreciationPct)}/year
- **Selling Costs:** ${formatPercent(deal.sellingCostsPct)}

### Tax Assumptions
- **Federal Tax Rate:** ${formatPercent(assumptions.federalTaxRate)}
- **State Tax Rate:** ${formatPercent(assumptions.stateTaxRate)}
- **Capital Gains Rate:** ${formatPercent(assumptions.capitalGainsRate)}
- **Depreciation:** ${assumptions.depreciationYears} years (residential)

`;

  // Year-by-Year Cash Flow
  md += `---

## Year-by-Year Cash Flow

| Year | Gross Rent | Vacancy | NOI | Debt Service | CF After Tax | Property Value |
|------|------------|---------|-----|--------------|--------------|----------------|
`;

  resultsByYear.forEach(year => {
    md += `| ${year.year} | ${formatCurrency(year.grossRent)} | (${formatCurrency(year.vacancy)}) | ${formatCurrency(year.noi)} | (${formatCurrency(year.debtService)}) | ${formatCurrency(year.cashFlowAfterTax)} | ${formatCurrency(year.propertyValue)} |\n`;
  });

  // Sensitivity Analysis
  md += `
---

## Sensitivity Analysis (7-Year IRR)

### Rent Sensitivity
| Change | IRR |
|--------|-----|
`;

  sensitivityRuns
    .filter(s => s.variable === 'rent')
    .sort((a, b) => a.delta - b.delta)
    .forEach(s => {
      md += `| ${s.delta === 0 ? 'Base' : `${s.delta > 0 ? '+' : ''}${formatPercent(s.delta)}`} | ${formatPercent(s.irr7)} |\n`;
    });

  md += `
### Appreciation Sensitivity
| Change | IRR |
|--------|-----|
`;

  sensitivityRuns
    .filter(s => s.variable === 'appreciation')
    .sort((a, b) => a.delta - b.delta)
    .forEach(s => {
      md += `| ${s.delta === 0 ? 'Base' : `${s.delta > 0 ? '+' : ''}${formatPercent(s.delta)}`} | ${formatPercent(s.irr7)} |\n`;
    });

  md += `
### Vacancy Sensitivity
| Change | IRR |
|--------|-----|
`;

  sensitivityRuns
    .filter(s => s.variable === 'vacancy')
    .sort((a, b) => a.delta - b.delta)
    .forEach(s => {
      md += `| ${s.delta === 0 ? 'Base' : `${s.delta > 0 ? '+' : ''}${formatPercent(s.delta)}`} | ${formatPercent(s.irr7)} |\n`;
    });

  // Data Gaps
  if (dataGaps.length > 0) {
    md += `
---

## Data Gaps & Risks

`;

    dataGaps.forEach(gap => {
      const emoji = gap.impact === 'high' ? '🔴' : gap.impact === 'medium' ? '🟡' : '🔵';
      md += `${emoji} **${gap.impact.toUpperCase()}** - ${gap.field}: ${gap.recommendation}\n\n`;
    });
  }

  // Constraints
  md += `---

## Property Constraints

- **Rent Controlled:** ${deal.isRentControlled ? 'Yes ⚠️' : 'No'}
- **HOA Rental Limit:** ${deal.hasHOARentalLimit ? 'Yes ⚠️' : 'No'}
- **Known CapEx Issues:** ${deal.knownCapex || 'None noted'}

`;

  // Recommendation
  if (narrative?.recommendation) {
    md += `---

## Recommendation

${narrative.recommendation}

`;
  }

  // Footer
  md += `---

*Generated by RE Investment Copilot | For informational purposes only*
`;

  return md;
}

export async function GET(request: NextRequest) {
  // Get deal ID from query params
  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get('dealId');

  if (!dealId) {
    return NextResponse.json(
      { error: 'Deal ID is required' },
      { status: 400 }
    );
  }

  const supabase = await createServerClient();

  try {
    // Fetch deal
    const deal = await getDeal(supabase, dealId);

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Run the financial model
    const modelOutput = runModel(deal);

    // Determine verdict
    const { verdict, driver } = determineVerdict(
      modelOutput.resultsByHorizon.year7,
      modelOutput.dataGaps
    );

    // Try to get existing narrative
    let narrative: MemoNarrative | undefined;
    const existingMemo = await getMemoByDealId(supabase, dealId);
    if (existingMemo?.narrative) {
      narrative = existingMemo.narrative as unknown as MemoNarrative;
    }

    // Generate Markdown
    const markdown = generateMarkdown(deal, modelOutput, verdict, driver, narrative);

    // Create filename
    const sanitizedAddress = deal.address
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    const filename = `investment_memo_${sanitizedAddress}_${new Date().toISOString().split('T')[0]}.md`;

    // Return Markdown
    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Markdown export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate Markdown' },
      { status: 500 }
    );
  }
}
