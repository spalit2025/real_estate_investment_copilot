/**
 * Portfolio Summary API route
 * GET /api/deals/portfolio - Get portfolio summary by market tag
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server-client';
import { getPortfolioSummary } from '@/lib/db/deals';

export async function GET() {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const summary = await getPortfolioSummary(supabase, user.id);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error fetching portfolio summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio summary' },
      { status: 500 }
    );
  }
}
