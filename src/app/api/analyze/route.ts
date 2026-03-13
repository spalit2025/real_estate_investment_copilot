/**
 * Analyze API route
 * Runs the financial model on a deal and returns results
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server-client';
import { getDeal, updateDeal } from '@/lib/db/deals';
import { runModel, determineVerdict } from '@/lib/model';
import type { Deal } from '@/types/deal';
import type { ModelOutput } from '@/types/model';

export interface AnalyzeResponse {
  success: boolean;
  data?: {
    deal: Deal;
    modelOutput: ModelOutput;
    verdict: 'buy' | 'skip' | 'watch';
    verdictReason: string;
  };
  error?: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  // Get deal ID from request body
  let dealId: string;
  try {
    const body = await request.json();
    dealId = body.dealId;
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

    // Run the financial model
    const modelOutput = runModel(deal);

    // Determine verdict based on 7-year horizon
    const { verdict, driver } = determineVerdict(
      modelOutput.resultsByHorizon.year7,
      modelOutput.dataGaps
    );

    // Update deal status to analyzed and set verdict
    await updateDeal(supabase, dealId, {
      status: 'analyzed',
      verdict,
    });

    // Fetch updated deal
    const updatedDeal = await getDeal(supabase, dealId);

    const response: AnalyzeResponse = {
      success: true,
      data: {
        deal: updatedDeal!,
        modelOutput,
        verdict,
        verdictReason: driver,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Analyze error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze deal' },
      { status: 500 }
    );
  }
}
