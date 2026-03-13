/**
 * Compare API route
 * Analyzes multiple deals for comparison
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server-client';
import { getDeal } from '@/lib/db/deals';
import { runModel, determineVerdict } from '@/lib/model';
import type { Deal } from '@/types/deal';
import type { ModelOutput, HorizonResult } from '@/types/model';

export interface CompareResult {
  deal: Deal;
  modelOutput: ModelOutput;
  verdict: 'buy' | 'skip' | 'watch';
  verdictReason: string;
}

export interface CompareResponse {
  success: boolean;
  data?: CompareResult[];
  error?: string;
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  // Get deal IDs from request body
  let dealIds: string[];
  try {
    const body = await request.json();
    dealIds = body.dealIds;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }

  if (!dealIds || !Array.isArray(dealIds) || dealIds.length < 2) {
    return NextResponse.json(
      { success: false, error: 'At least 2 deal IDs are required' },
      { status: 400 }
    );
  }

  if (dealIds.length > 4) {
    return NextResponse.json(
      { success: false, error: 'Maximum 4 deals can be compared' },
      { status: 400 }
    );
  }

  try {
    const results: CompareResult[] = [];

    for (const dealId of dealIds) {
      // Fetch deal
      const deal = await getDeal(supabase, dealId);

      if (!deal) {
        return NextResponse.json(
          { success: false, error: `Deal ${dealId} not found` },
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

      results.push({
        deal,
        modelOutput,
        verdict,
        verdictReason: driver,
      });
    }

    const response: CompareResponse = {
      success: true,
      data: results,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Compare error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to compare deals' },
      { status: 500 }
    );
  }
}
