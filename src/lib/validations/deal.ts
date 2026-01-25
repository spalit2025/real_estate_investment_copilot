/**
 * Deal validation schema using Zod
 */

import { z } from 'zod';

/**
 * Deal form validation schema
 */
export const dealFormSchema = z.object({
  // Property Details
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required').max(2, 'Use state abbreviation'),
  zip: z.string().min(5, 'ZIP code is required').max(10),
  marketTag: z.string().min(1, 'Market tag is required').max(50),
  propertyType: z.enum(['sfh', 'condo', 'townhouse', 'multi_2_4']),
  beds: z.coerce.number().int().min(0).max(20).default(0),
  baths: z.coerce.number().min(0).max(20).default(0),
  sqft: z.coerce.number().int().min(0).max(100000).default(0),
  yearBuilt: z.coerce.number().int().min(1800).max(new Date().getFullYear()).default(0),

  // Purchase
  purchasePrice: z.coerce.number().min(10000, 'Minimum $10,000').max(100000000, 'Maximum $100M'),
  closingCostsPct: z.coerce.number().min(0).max(0.10).default(0.02),

  // Financing
  downPaymentPct: z.coerce.number().min(0).max(1).default(0.25),
  interestRate: z.coerce.number().min(0).max(0.30).default(0.06),
  loanTermYears: z.coerce.number().int().min(1).max(40).default(30),
  isARM: z.boolean().default(false),
  armAdjustYear: z.coerce.number().int().min(1).max(10).optional(),
  armAdjustRate: z.coerce.number().min(0).max(0.30).optional(),

  // Income
  monthlyRent: z.coerce.number().min(100, 'Minimum $100').max(1000000),
  vacancyPct: z.coerce.number().min(0).max(0.50).default(0.05),
  rentGrowthPct: z.coerce.number().min(-0.10).max(0.20).default(0.03),

  // Expenses
  propertyTaxAnnual: z.coerce.number().min(0).max(1000000).default(0),
  insuranceAnnual: z.coerce.number().min(0).max(100000).default(0),
  hoaMonthly: z.coerce.number().min(0).max(10000).default(0),
  managementPct: z.coerce.number().min(0).max(0.20).default(0.08),
  repairsPct: z.coerce.number().min(0).max(0.20).default(0.05),
  capexPct: z.coerce.number().min(0).max(0.20).default(0.05),
  utilitiesMonthly: z.coerce.number().min(0).max(5000).default(0),

  // Exit
  appreciationPct: z.coerce.number().min(-0.10).max(0.20).default(0.03),
  sellingCostsPct: z.coerce.number().min(0).max(0.15).default(0.07),

  // Constraints
  isRentControlled: z.boolean().default(false),
  hasHOARentalLimit: z.boolean().default(false),
  knownCapex: z.string().max(1000).default(''),
});

export type DealFormValues = z.infer<typeof dealFormSchema>;

/**
 * Default values for the deal form
 */
export const defaultDealValues: Partial<DealFormValues> = {
  marketTag: 'cash_flow_market',
  propertyType: 'sfh',
  beds: 0,
  baths: 0,
  sqft: 0,
  yearBuilt: 0,
  closingCostsPct: 0.02,
  downPaymentPct: 0.25,
  interestRate: 0.06,
  loanTermYears: 30,
  isARM: false,
  vacancyPct: 0.05,
  rentGrowthPct: 0.03,
  propertyTaxAnnual: 0,
  insuranceAnnual: 0,
  hoaMonthly: 0,
  managementPct: 0.08,
  repairsPct: 0.05,
  capexPct: 0.05,
  utilitiesMonthly: 0,
  appreciationPct: 0.03,
  sellingCostsPct: 0.07,
  isRentControlled: false,
  hasHOARentalLimit: false,
  knownCapex: '',
};

/**
 * Validation warnings for unusual values (not errors, just warnings)
 */
export function getDealWarnings(values: Partial<DealFormValues>): string[] {
  const warnings: string[] = [];

  if (values.purchasePrice && values.monthlyRent) {
    const annualRentYield = (values.monthlyRent * 12) / values.purchasePrice;
    if (annualRentYield > 0.18) {
      warnings.push('Rent yield >18% annually - verify rent is accurate');
    }
    if (annualRentYield < 0.04) {
      warnings.push('Rent yield <4% annually - cash flow may be negative');
    }
  }

  if (values.appreciationPct && values.appreciationPct > 0.08) {
    warnings.push('Appreciation >8%/year is historically unusual');
  }

  if (values.vacancyPct !== undefined && values.vacancyPct < 0.03) {
    warnings.push('Vacancy <3% is optimistic for most markets');
  }

  if (values.interestRate && values.interestRate > 0.10) {
    warnings.push('Interest rate >10% is unusually high');
  }

  if (values.downPaymentPct !== undefined && values.downPaymentPct < 0.10) {
    warnings.push('Down payment <10% may require PMI');
  }

  return warnings;
}

/**
 * Format percentage for display (0.05 -> "5")
 */
export function pctToDisplay(value: number | undefined): string {
  if (value === undefined || value === null) return '';
  return (value * 100).toString();
}

/**
 * Parse percentage from display ("5" -> 0.05)
 */
export function displayToPct(value: string): number {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  return num / 100;
}
