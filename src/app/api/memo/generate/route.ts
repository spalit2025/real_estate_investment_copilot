/**
 * Memo Generation API route
 * Generates AI narrative from model output
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server-client';
import { getDeal } from '@/lib/db/deals';
import { saveMemo, getMemoByDealId } from '@/lib/db/memos';
import { runModel, determineVerdict } from '@/lib/model';
import { generateMemoNarrative, isAnthropicConfigured } from '@/lib/ai';
import type { MemoNarrative } from '@/lib/ai';
import type { Deal } from '@/types/deal';
import type { ModelOutput } from '@/types/model';

export interface GenerateMemoResponse {
  success: boolean;
  data?: {
    deal: Deal;
    modelOutput: ModelOutput;
    verdict: 'buy' | 'skip' | 'watch';
    verdictReason: string;
    narrative: MemoNarrative;
    memoId: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  // Check if AI is configured
  if (!isAnthropicConfigured()) {
    return NextResponse.json(
      { success: false, error: 'AI service not configured. Set ANTHROPIC_API_KEY environment variable.' },
      { status: 503 }
    );
  }

  // Get deal ID from request body
  let dealId: string;
  let regenerate = false;

  try {
    const body = await request.json();
    dealId = body.dealId;
    regenerate = body.regenerate === true;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }

  if (!dealId) {
    return NextResponse.json(
      { success: false, error: 'Deal ID is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch deal
    const deal = await getDeal(supabase, dealId);

    if (!deal) {
      return NextResponse.json(
        { success: false, error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Check for existing memo (unless regenerating)
    if (!regenerate) {
      const existingMemo = await getMemoByDealId(supabase, dealId);
      if (existingMemo && existingMemo.narrative) {
        // Return existing memo
        const modelOutput = existingMemo.modelOutput as ModelOutput;
        const { verdict, driver } = determineVerdict(
          modelOutput.resultsByHorizon.year7,
          modelOutput.dataGaps
        );

        return NextResponse.json({
          success: true,
          data: {
            deal,
            modelOutput,
            verdict,
            verdictReason: driver,
            narrative: existingMemo.narrative as unknown as MemoNarrative,
            memoId: existingMemo.id,
          },
        });
      }
    }

    // Run the financial model
    const modelOutput = runModel(deal);

    // Determine verdict
    const { verdict, driver } = determineVerdict(
      modelOutput.resultsByHorizon.year7,
      modelOutput.dataGaps
    );

    // Generate AI narrative
    const narrative = await generateMemoNarrative(
      deal,
      modelOutput,
      verdict,
      driver
    );

    // Save memo to database (convert assumptions to plain object for storage)
    const assumptionsForStorage = { ...modelOutput.assumptions } as Record<string, unknown>;
    const memo = await saveMemo(
      supabase,
      dealId,
      modelOutput,
      assumptionsForStorage,
      narrative as unknown as Record<string, unknown>
    );

    const response: GenerateMemoResponse = {
      success: true,
      data: {
        deal,
        modelOutput,
        verdict,
        verdictReason: driver,
        narrative,
        memoId: memo.id,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Memo generation error:', error);

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes('Anthropic')) {
        return NextResponse.json(
          { success: false, error: 'AI service error. Please try again.' },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate memo' },
      { status: 500 }
    );
  }
}
