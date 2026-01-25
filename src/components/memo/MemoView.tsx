'use client';

/**
 * Main memo display component
 * Renders all sections of the investment memo
 */

import type { ModelOutput } from '@/types/model';
import type { Deal } from '@/types/deal';
import type { MemoNarrative } from '@/lib/ai';
import { QuickVerdict } from './sections/QuickVerdict';
import { KeyAssumptions } from './sections/KeyAssumptions';
import { InvestmentReturns } from './sections/InvestmentReturns';
import { SensitivityAnalysis } from './sections/SensitivityAnalysis';
import { RiskNotes } from './sections/RiskNotes';
import { DataGaps } from './sections/DataGaps';
import { NextSteps } from './sections/NextSteps';
import { AIInsights } from './sections/AIInsights';
import { YearByYearTable } from './tables/YearByYearTable';

interface MemoViewProps {
  deal: Deal;
  modelOutput: ModelOutput;
  verdict: 'buy' | 'skip' | 'watch';
  verdictReason: string;
  narrative?: MemoNarrative;
}

export function MemoView({ deal, modelOutput, verdict, verdictReason, narrative }: MemoViewProps) {
  return (
    <div className="space-y-8">
      {/* 1. Quick Verdict */}
      <QuickVerdict
        verdict={verdict}
        verdictReason={verdictReason}
        horizons={modelOutput.resultsByHorizon}
      />

      {/* 2. AI Insights (if narrative is provided) */}
      {narrative && (
        <AIInsights narrative={narrative} />
      )}

      {/* 3. Key Assumptions */}
      <KeyAssumptions assumptions={modelOutput.assumptions} />

      {/* 4. Investment Returns (5/7/10 Year) */}
      <InvestmentReturns horizons={modelOutput.resultsByHorizon} />

      {/* 5. Year-by-Year Breakdown */}
      <YearByYearTable years={modelOutput.resultsByYear} />

      {/* 6. Sensitivity Analysis */}
      <SensitivityAnalysis sensitivity={modelOutput.sensitivityRuns} />

      {/* 7. Risk Notes */}
      <RiskNotes deal={deal} modelOutput={modelOutput} />

      {/* 8. Data Gaps */}
      <DataGaps gaps={modelOutput.dataGaps} />

      {/* 9. Next Steps */}
      <NextSteps deal={deal} verdict={verdict} />
    </div>
  );
}
