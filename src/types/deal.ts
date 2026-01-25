/**
 * Deal - Property input data for investment analysis
 * All financial values are in USD
 */
export interface Deal {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  // Property Details
  address: string;
  city: string;
  state: string;
  zip: string;
  marketTag: MarketTag;
  propertyType: PropertyType;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;

  // Purchase
  purchasePrice: number;
  closingCostsPct: number; // e.g., 0.02 for 2%

  // Financing
  downPaymentPct: number; // e.g., 0.25 for 25%
  interestRate: number; // e.g., 0.06 for 6%
  loanTermYears: number;
  isARM: boolean;
  armAdjustYear?: number;
  armAdjustRate?: number;

  // Income
  monthlyRent: number;
  vacancyPct: number; // e.g., 0.05 for 5%
  rentGrowthPct: number; // e.g., 0.03 for 3%

  // Expenses (stored as annual values)
  propertyTaxAnnual: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  managementPct: number; // % of gross rent
  repairsPct: number; // % of gross rent
  capexPct: number; // % of gross rent
  utilitiesMonthly: number;

  // Exit
  appreciationPct: number; // e.g., 0.03 for 3%
  sellingCostsPct: number; // e.g., 0.07 for 7%

  // Constraints
  isRentControlled: boolean;
  hasHOARentalLimit: boolean;
  knownCapex: string; // Description of known issues

  // Overrides for global assumptions
  assumptionOverrides: Partial<GlobalAssumptions>;

  // Status
  status: DealStatus;
  verdict?: Verdict;
}

// Preset market tags - users can also use custom tags
export const PRESET_MARKET_TAGS = [
  'bay_area_appreciation',
  'cash_flow_market',
  'midwest_value',
  'sunbelt_growth',
  'coastal_premium',
  'college_town',
  'vacation_rental',
] as const;

export type PresetMarketTag = typeof PRESET_MARKET_TAGS[number];

// MarketTag can be a preset or any custom string
export type MarketTag = PresetMarketTag | string;

export type PropertyType = 'sfh' | 'condo' | 'townhouse' | 'multi_2_4';

export type DealStatus = 'draft' | 'analyzed' | 'archived';

export type Verdict = 'buy' | 'skip' | 'watch';

/**
 * Global assumptions that can be overridden per deal
 */
export interface GlobalAssumptions {
  federalTaxRate: number; // e.g., 0.30 for 30%
  stateTaxRate: number; // e.g., 0.09 for 9%
  reitBaselineReturn: number; // e.g., 0.06 for 6%
  depreciationYears: number; // 27.5 for residential
  landValuePct: number; // e.g., 0.20 for 20%
  capitalGainsRate: number; // e.g., 0.15 for 15%
  deprecationRecaptureRate: number; // e.g., 0.25 for 25%
}

/**
 * Input type for creating a new deal (without system-generated fields)
 */
export type CreateDealInput = Omit<Deal, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'status' | 'verdict'>;

/**
 * Input type for updating an existing deal
 */
export type UpdateDealInput = Partial<Omit<Deal, 'id' | 'userId' | 'createdAt'>>;
