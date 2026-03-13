/**
 * Individual Profile API route
 * Get, update, delete a specific profile
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server-client';
import { getProfile, updateProfile, deleteProfile } from '@/lib/db/profiles';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Get a single profile
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const supabase = await createServerClient();

  try {
    const profile = await getProfile(supabase, id);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT - Update a profile
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const supabase = await createServerClient();

  try {
    // Check profile exists
    const existing = await getProfile(supabase, id);

    if (!existing) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, assumptions, isDefault } = body;

    const profile = await updateProfile(supabase, id, {
      name,
      assumptions,
      isDefault,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a profile
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const supabase = await createServerClient();

  try {
    // Check profile exists
    const existing = await getProfile(supabase, id);

    if (!existing) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    await deleteProfile(supabase, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile' },
      { status: 500 }
    );
  }
}
