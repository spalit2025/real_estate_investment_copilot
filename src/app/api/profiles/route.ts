/**
 * Profiles API route
 * List and create assumption profiles
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/server-client';
import { getProfiles, createProfile, PRESET_PROFILES } from '@/lib/db/profiles';
import type { GlobalAssumptions } from '@/types/deal';

// GET - List all profiles for current user
export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const profiles = await getProfiles(supabase, user.id);

    return NextResponse.json({
      profiles,
      presets: PRESET_PROFILES,
    });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profiles' },
      { status: 500 }
    );
  }
}

// POST - Create a new profile
export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { name, assumptions, isDefault, preset } = body;

    // If using a preset, get its values
    let profileAssumptions: Partial<GlobalAssumptions>;
    let profileName: string;

    if (preset && PRESET_PROFILES[preset as keyof typeof PRESET_PROFILES]) {
      const presetData = PRESET_PROFILES[preset as keyof typeof PRESET_PROFILES];
      profileAssumptions = presetData.assumptions;
      profileName = name || presetData.name;
    } else {
      if (!name || !assumptions) {
        return NextResponse.json(
          { error: 'Name and assumptions are required' },
          { status: 400 }
        );
      }
      profileAssumptions = assumptions;
      profileName = name;
    }

    const profile = await createProfile(
      supabase,
      user.id,
      profileName,
      profileAssumptions,
      isDefault ?? false
    );

    return NextResponse.json({ profile }, { status: 201 });
  } catch (error) {
    console.error('Error creating profile:', error);
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}
