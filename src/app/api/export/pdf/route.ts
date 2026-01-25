/**
 * PDF Export API route
 * Generates a PDF investment memo for download
 */

import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { createServerClient } from '@/lib/db/server-client';
import { getDeal } from '@/lib/db/deals';
import { getMemoByDealId } from '@/lib/db/memos';
import { runModel, determineVerdict } from '@/lib/model';
import { MemoPDF } from '@/components/memo/MemoPDF';
import type { MemoNarrative } from '@/lib/ai';

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

  // Check authentication
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Fetch deal
    const deal = await getDeal(supabase, dealId);

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (deal.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
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

    // Generate PDF
    const pdfBuffer = await renderToBuffer(
      MemoPDF({
        deal,
        modelOutput,
        verdict,
        verdictReason: driver,
        narrative,
      })
    );

    // Create filename
    const sanitizedAddress = deal.address
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 30);
    const filename = `investment_memo_${sanitizedAddress}_${new Date().toISOString().split('T')[0]}.pdf`;

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
