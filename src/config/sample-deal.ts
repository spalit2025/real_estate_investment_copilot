/**
 * Pre-loaded sample deal for the portfolio demo
 * Bay Area condo — realistic inputs that produce a meaningful analysis
 */

import type { Deal } from '@/types/deal';

export const SAMPLE_DEAL: Deal = {
  id: 'sample',
  userId: 'demo-user-00000000',
  createdAt: new Date('2025-01-15'),
  updatedAt: new Date('2025-01-15'),

  // Property Details
  address: '1247 Valencia St',
  city: 'San Francisco',
  state: 'CA',
  zip: '94110',
  marketTag: 'bay_area_appreciation',
  propertyType: 'condo',
  beds: 2,
  baths: 1,
  sqft: 1050,
  yearBuilt: 1924,

  // Purchase
  purchasePrice: 850000,
  closingCostsPct: 0.02,

  // Financing
  downPaymentPct: 0.25,
  interestRate: 0.065,
  loanTermYears: 30,
  isARM: false,

  // Income
  monthlyRent: 3200,
  vacancyPct: 0.04,
  rentGrowthPct: 0.035,

  // Expenses
  propertyTaxAnnual: 8500,
  insuranceAnnual: 1800,
  hoaMonthly: 450,
  managementPct: 0.08,
  repairsPct: 0.05,
  capexPct: 0.03,
  utilitiesMonthly: 0,

  // Exit
  appreciationPct: 0.04,
  sellingCostsPct: 0.07,

  // Constraints
  isRentControlled: true,
  hasHOARentalLimit: false,
  knownCapex: 'Building seismic retrofit assessment pending. Roof replaced 2019.',

  // Overrides
  assumptionOverrides: {},

  // Status
  status: 'analyzed',
  verdict: 'watch',
};
