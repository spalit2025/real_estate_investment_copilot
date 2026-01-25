/**
 * Property lookup API route
 * Fetches property data from Realty in US API (RapidAPI)
 */

import { NextRequest, NextResponse } from 'next/server';
import { lookupPropertyData, mapPropertyType } from '@/lib/api/realty-in-us';
import { createServerClient } from '@/lib/db/server-client';

export interface PropertyLookupResponse {
  success: boolean;
  data?: {
    // Property details
    address: string;
    city: string;
    state: string;
    zip: string;
    propertyType: 'sfh' | 'condo' | 'townhouse' | 'multi_2_4';
    beds: number;
    baths: number;
    sqft: number;
    yearBuilt: number;

    // Financial data
    purchasePrice?: number;
    monthlyRent?: number;
    rentRangeLow?: number;
    rentRangeHigh?: number;
    propertyTaxAnnual?: number;

    // Metadata
    lastSalePrice?: number;
    lastSaleDate?: string;
    estimatedValue?: number;
    source: string;
  };
  error?: string;
}

export async function GET(request: NextRequest) {
  // Check authentication
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // Get address from query params
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { success: false, error: 'Address is required' },
      { status: 400 }
    );
  }

  // Check if API key is configured
  if (!process.env.RAPIDAPI_KEY) {
    return NextResponse.json(
      { success: false, error: 'Property lookup service not configured. Add RAPIDAPI_KEY to environment.' },
      { status: 503 }
    );
  }

  try {
    const result = await lookupPropertyData(address);

    if (!result.property) {
      return NextResponse.json(
        { success: false, error: result.error || 'Property not found' },
        { status: 404 }
      );
    }

    const property = result.property;

    // Map to our deal form fields
    const response: PropertyLookupResponse = {
      success: true,
      data: {
        address: property.address,
        city: property.city,
        state: property.state,
        zip: property.zip,
        propertyType: mapPropertyType(property.propertyType),
        beds: property.beds ?? 0,
        baths: property.baths ?? 0,
        sqft: property.sqft ?? 0,
        yearBuilt: property.yearBuilt ?? 0,

        // Use list price or estimated value as purchase price suggestion
        purchasePrice: property.listPrice || property.estimatedValue,
        monthlyRent: property.rentEstimate,
        rentRangeLow: property.rentEstimateLow,
        rentRangeHigh: property.rentEstimateHigh,
        propertyTaxAnnual: property.propertyTax,

        lastSalePrice: property.lastSoldPrice,
        lastSaleDate: property.lastSoldDate,
        estimatedValue: property.estimatedValue,
        source: 'Realty in US',
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Property lookup error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to lookup property' },
      { status: 500 }
    );
  }
}
