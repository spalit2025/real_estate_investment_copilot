/**
 * Portfolio Summary API route
 * GET /api/deals/portfolio - Get portfolio summary by market tag
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server-client';
import { getPortfolioSummary } from '@/lib/db/deals';
import { DEMO_USER_ID } from '@/config/defaults';

export async function GET() {
  try {
    const supabase = await createServerClient();

    const summary = await getPortfolioSummary(supabase, DEMO_USER_ID);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio summary' },
      { status: 500 }
    );
  }
}
