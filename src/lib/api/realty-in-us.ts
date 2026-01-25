/**
 * Realty in US API client for property data lookup
 * https://rapidapi.com/apidojo/api/realty-in-us
 */

export interface PropertySearchResult {
  property_id: string;
  listing_id?: string;

  // Location
  address: {
    line: string;
    city: string;
    state_code: string;
    postal_code: string;
    county?: string;
  };

  // Property details
  description?: {
    beds?: number;
    baths?: number;
    sqft?: number;
    lot_sqft?: number;
    year_built?: number;
    type?: string;
    sub_type?: string;
  };

  // Pricing
  list_price?: number;
  estimate?: {
    estimate?: number;
  };

  // Tax info
  tax_record?: {
    public_record_id?: string;
    assessed_value?: number;
    tax_amount?: number;
    tax_year?: number;
  };
}

export interface PropertyDetailResult {
  property_id: string;

  location: {
    address: {
      line: string;
      city: string;
      state_code: string;
      postal_code: string;
      county?: string;
    };
  };

  description?: {
    beds?: number;
    baths?: number;
    sqft?: number;
    lot_sqft?: number;
    year_built?: number;
    type?: string;
    sub_type?: string;
  };

  list_price?: number;

  estimates?: {
    estimate?: number;
    rent_estimate?: number;
    rent_estimate_low?: number;
    rent_estimate_high?: number;
  };

  tax_history?: Array<{
    year: number;
    tax: number;
    assessment?: {
      total?: number;
    };
  }>;

  last_sold_price?: number;
  last_sold_date?: string;
}

export interface PropertyDataResult {
  property: {
    address: string;
    city: string;
    state: string;
    zip: string;
    beds?: number;
    baths?: number;
    sqft?: number;
    yearBuilt?: number;
    propertyType?: string;
    listPrice?: number;
    estimatedValue?: number;
    rentEstimate?: number;
    rentEstimateLow?: number;
    rentEstimateHigh?: number;
    propertyTax?: number;
    lastSoldPrice?: number;
    lastSoldDate?: string;
  } | null;
  error?: string;
}

const RAPIDAPI_HOST = 'realty-in-us.p.rapidapi.com';

/**
 * Get RapidAPI key from environment
 */
function getRapidAPIKey(): string {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    throw new Error('RAPIDAPI_KEY environment variable is not set');
  }
  return key;
}

/**
 * Search for properties by address
 */
async function searchProperties(address: string): Promise<PropertySearchResult | null> {
  const apiKey = getRapidAPIKey();

  // First, search for the property
  const searchUrl = new URL(`https://${RAPIDAPI_HOST}/properties/v3/list`);

  const response = await fetch(searchUrl.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
    body: JSON.stringify({
      limit: 1,
      offset: 0,
      postal_code: extractZipCode(address),
      status: ['for_sale', 'ready_to_build', 'sold'],
      sort: {
        direction: 'desc',
        field: 'list_date',
      },
    }),
  });

  if (!response.ok) {
    console.error(`Property search failed: ${response.status}`);
    return null;
  }

  const data = await response.json();

  if (data?.data?.home_search?.results?.length > 0) {
    return data.data.home_search.results[0] as PropertySearchResult;
  }

  return null;
}

/**
 * Get detailed property info by property_id
 */
async function getPropertyDetail(propertyId: string): Promise<PropertyDetailResult | null> {
  const apiKey = getRapidAPIKey();

  const url = new URL(`https://${RAPIDAPI_HOST}/properties/v3/detail`);
  url.searchParams.set('property_id', propertyId);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    console.error(`Property detail failed: ${response.status}`);
    return null;
  }

  const data = await response.json();

  if (data?.data?.home) {
    return data.data.home as PropertyDetailResult;
  }

  return null;
}

/**
 * Auto-complete address search
 */
async function autoCompleteAddress(query: string): Promise<{ line: string; city: string; state_code: string; postal_code: string } | null> {
  const apiKey = getRapidAPIKey();

  const url = new URL(`https://${RAPIDAPI_HOST}/locations/v2/auto-complete`);
  url.searchParams.set('input', query);
  url.searchParams.set('limit', '1');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': RAPIDAPI_HOST,
    },
  });

  if (!response.ok) {
    console.error(`Auto-complete failed: ${response.status}`);
    return null;
  }

  const data = await response.json();

  // Look for address type results
  const addresses = data?.autocomplete?.filter((item: { area_type: string }) => item.area_type === 'address') || [];

  if (addresses.length > 0) {
    const addr = addresses[0];
    return {
      line: addr.line || '',
      city: addr.city || '',
      state_code: addr.state_code || '',
      postal_code: addr.postal_code || '',
    };
  }

  return null;
}

/**
 * Extract ZIP code from address string
 */
function extractZipCode(address: string): string | undefined {
  const match = address.match(/\b(\d{5})(?:-\d{4})?\b/);
  return match ? match[1] : undefined;
}

/**
 * Look up property data by address
 */
export async function lookupPropertyData(address: string): Promise<PropertyDataResult> {
  try {
    // Try auto-complete first to get a clean address
    const cleanAddress = await autoCompleteAddress(address);

    if (!cleanAddress) {
      return {
        property: null,
        error: 'Address not found. Please check the address and try again.',
      };
    }

    // Search for the property
    const searchResult = await searchProperties(address);

    if (!searchResult) {
      // Return what we have from auto-complete
      return {
        property: {
          address: cleanAddress.line,
          city: cleanAddress.city,
          state: cleanAddress.state_code,
          zip: cleanAddress.postal_code,
        },
        error: 'Property details not found, but address was validated.',
      };
    }

    // Get detailed info if we have a property_id
    let detail: PropertyDetailResult | null = null;
    if (searchResult.property_id) {
      detail = await getPropertyDetail(searchResult.property_id);
    }

    // Combine search and detail results
    const property = {
      address: searchResult.address?.line || cleanAddress.line,
      city: searchResult.address?.city || cleanAddress.city,
      state: searchResult.address?.state_code || cleanAddress.state_code,
      zip: searchResult.address?.postal_code || cleanAddress.postal_code,
      beds: detail?.description?.beds ?? searchResult.description?.beds,
      baths: detail?.description?.baths ?? searchResult.description?.baths,
      sqft: detail?.description?.sqft ?? searchResult.description?.sqft,
      yearBuilt: detail?.description?.year_built ?? searchResult.description?.year_built,
      propertyType: detail?.description?.type ?? searchResult.description?.type,
      listPrice: searchResult.list_price,
      estimatedValue: detail?.estimates?.estimate ?? searchResult.estimate?.estimate,
      rentEstimate: detail?.estimates?.rent_estimate,
      rentEstimateLow: detail?.estimates?.rent_estimate_low,
      rentEstimateHigh: detail?.estimates?.rent_estimate_high,
      propertyTax: detail?.tax_history?.[0]?.tax ?? searchResult.tax_record?.tax_amount,
      lastSoldPrice: detail?.last_sold_price,
      lastSoldDate: detail?.last_sold_date,
    };

    return { property };
  } catch (error) {
    console.error('Property lookup error:', error);
    return {
      property: null,
      error: error instanceof Error ? error.message : 'Failed to lookup property',
    };
  }
}

/**
 * Map Realty in US property type to our property type enum
 */
export function mapPropertyType(realtyType?: string): 'sfh' | 'condo' | 'townhouse' | 'multi_2_4' {
  if (!realtyType) return 'sfh';

  const type = realtyType.toLowerCase();

  if (type.includes('condo') || type.includes('condominium') || type.includes('apartment')) {
    return 'condo';
  }
  if (type.includes('townhouse') || type.includes('townhome') || type.includes('row')) {
    return 'townhouse';
  }
  if (type.includes('multi') || type.includes('duplex') || type.includes('triplex') || type.includes('fourplex')) {
    return 'multi_2_4';
  }

  // Default to SFH for single_family, house, residential, etc.
  return 'sfh';
}
