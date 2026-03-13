/**
 * Market Tags API route
 * GET /api/deals/tags - Get all unique market tags for current user
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server-client';
import { getMarketTags } from '@/lib/db/deals';
import { DEMO_USER_ID } from '@/config/defaults';

export async function GET() {
  try {
    const supabase = await createServerClient();

    const tags = await getMarketTags(supabase, DEMO_USER_ID);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error('Error fetching market tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market tags' },
      { status: 500 }
    );
  }
}
