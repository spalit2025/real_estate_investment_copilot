/**
 * Market Tags API route
 * GET /api/deals/tags - Get all unique market tags for current user
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server-client';
import { getMarketTags } from '@/lib/db/deals';

export async function GET() {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tags = await getMarketTags(supabase, user.id);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching market tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market tags' },
      { status: 500 }
    );
  }
}
