import type { Verdict } from './deal';
import type { ModelOutput } from './model';

/**
 * Complete investment memo content
 */
export interface MemoContent {
  id: string;
  dealId: string;
  createdAt: Date;

  // Computed results (deterministic)
  modelOutput: ModelOutput;

  // AI-generated narrative sections
  narrative: MemoNarrative;

  // Snapshot of assumptions used
  assumptionsSnapshot: Record<string, unknown>;

  // Version for tracking regenerations
  version: number;
}

/**
 * AI-generated narrative sections
 */
export interface MemoNarrative {
  quickVerdict: QuickVerdictSection;
  keyAssumptions: string;
  investmentReturns: string;
  sensitivityAnalysis: string;
  riskNotes: string;
  dataGaps: string;
  nextSteps: NextStepsSection;
}

/**
 * Quick verdict section with structured data
 */
export interface QuickVerdictSection {
  verdict: Verdict;
  primaryDriver: string;
  confidence: VerdictConfidence;
  summary: string;
}

export type VerdictConfidence = 'high' | 'medium' | 'low';

/**
 * Next steps section with structured data
 */
export interface NextStepsSection {
  summary: string;
  diligenceQuestions: [string, string, string]; // Exactly 3 questions
}

/**
 * Input for memo generation (what gets sent to AI)
 */
export interface MemoGenerationInput {
  modelOutput: ModelOutput;
}

/**
 * Database row for memos table
 */
export interface MemoRow {
  id: string;
  deal_id: string;
  created_at: string;
  model_output: string; // JSON
  narrative: string | null; // JSON
  assumptions_snapshot: string; // JSON
  version: number;
}
