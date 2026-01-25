/**
 * Deal API routes
 * POST /api/deals - Create a new deal
 * GET /api/deals - List user's deals
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server-client';
import { createDeal, getDeals } from '@/lib/db';
import { dealFormSchema } from '@/lib/validations/deal';
import type { CreateDealInput } from '@/types/deal';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const parsed = dealFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Convert form values to deal input
    const dealInput: CreateDealInput = {
      ...parsed.data,
      assumptionOverrides: {},
    };

    // Create deal
    const deal = await createDeal(supabase, user.id, dealInput);

    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const marketTag = searchParams.get('marketTag');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get deals
    const result = await getDeals(supabase, user.id, {
      status: status ? (status as 'draft' | 'analyzed' | 'archived') : undefined,
      marketTag: marketTag || undefined,
      limit,
      offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}
