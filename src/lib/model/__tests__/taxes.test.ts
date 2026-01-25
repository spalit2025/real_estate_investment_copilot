import { describe, it, expect } from 'vitest';
import {
  calculateAnnualDepreciation,
  calculateTaxableIncome,
  calculateIncomeTax,
  calculateCashFlowAfterTax,
  calculateExitTaxes,
  calculateSellingCosts,
  calculateNetSaleProceeds,
  getCombinedTaxRate,
} from '../taxes';
import type { GlobalAssumptions } from '@/types';

describe('calculateAnnualDepreciation', () => {
  it('should calculate depreciation correctly for standard residential', () => {
    // $400K purchase, 20% land, 27.5 year depreciation
    // Building value: 400000 * 0.80 = 320000
    // Annual depreciation: 320000 / 27.5 = 11636.36
    const depreciation = calculateAnnualDepreciation(400000, 0.20, 27.5);
    expect(depreciation).toBeCloseTo(11636.36, 2);
  });

  it('should handle different land values', () => {
    // 10% land value
    const dep10 = calculateAnnualDepreciation(400000, 0.10, 27.5);
    expect(dep10).toBeCloseTo(13090.91, 2); // (400000 * 0.90) / 27.5

    // 30% land value
    const dep30 = calculateAnnualDepreciation(400000, 0.30, 27.5);
    expect(dep30).toBeCloseTo(10181.82, 2); // (400000 * 0.70) / 27.5
  });

  it('should throw error for invalid inputs', () => {
    expect(() => calculateAnnualDepreciation(-100000, 0.20, 27.5)).toThrow(
      'Purchase price must be positive'
    );
    expect(() => calculateAnnualDepreciation(400000, -0.10, 27.5)).toThrow(
      'Land value percentage must be between 0 and 1'
    );
    expect(() => calculateAnnualDepreciation(400000, 1.0, 27.5)).toThrow(
      'Land value percentage must be between 0 and 1'
    );
    expect(() => calculateAnnualDepreciation(400000, 0.20, 0)).toThrow(
      'Depreciation years must be positive'
    );
  });
});

describe('calculateTaxableIncome', () => {
  it('should calculate positive taxable income', () => {
    // NOI: 20000, Depreciation: 11636, Interest: 5000
    const taxable = calculateTaxableIncome(20000, 11636, 5000);
    expect(taxable).toBe(3364);
  });

  it('should calculate negative taxable income (paper loss)', () => {
    // NOI: 18000, Depreciation: 11636, Interest: 17000
    const taxable = calculateTaxableIncome(18000, 11636, 17000);
    expect(taxable).toBe(-10636); // Paper loss despite positive cash flow
  });

  it('should handle zero depreciation', () => {
    const taxable = calculateTaxableIncome(20000, 0, 5000);
    expect(taxable).toBe(15000);
  });
});

describe('calculateIncomeTax', () => {
  it('should calculate tax on positive income', () => {
    // Taxable income: 5000, Combined rate: 39% (30% fed + 9% state)
    const tax = calculateIncomeTax(5000, 0.39);
    expect(tax).toBe(1950);
  });

  it('should calculate tax benefit on negative income', () => {
    // Taxable income: -10000 (paper loss)
    const tax = calculateIncomeTax(-10000, 0.39);
    expect(tax).toBe(-3900); // Tax benefit
  });

  it('should throw for invalid tax rate', () => {
    expect(() => calculateIncomeTax(5000, -0.10)).toThrow(
      'Tax rate must be between 0 and 1'
    );
    expect(() => calculateIncomeTax(5000, 1.5)).toThrow(
      'Tax rate must be between 0 and 1'
    );
  });
});

describe('calculateCashFlowAfterTax', () => {
  it('should reduce cash flow for positive tax', () => {
    const cfat = calculateCashFlowAfterTax(8000, 2000);
    expect(cfat).toBe(6000);
  });

  it('should increase cash flow for negative tax (benefit)', () => {
    const cfat = calculateCashFlowAfterTax(8000, -3000);
    expect(cfat).toBe(11000); // Tax benefit adds to cash flow
  });
});

describe('calculateExitTaxes', () => {
  it('should calculate exit taxes correctly', () => {
    // From TECHNICAL.md test case:
    // Purchase: 400000, Sale: 500000, Total Depreciation: 58182
    // Cap gains rate: 15%, Recapture rate: 25%, State: 9%
    const result = calculateExitTaxes({
      purchasePrice: 400000,
      salePrice: 500000,
      totalDepreciation: 58182,
      capitalGainsRate: 0.15,
      recaptureRate: 0.25,
      stateTaxRate: 0.09,
    });

    // Adjusted basis = 400000 - 58182 = 341818
    // Capital gain = 500000 - 341818 = 158182
    expect(result.capitalGain).toBeCloseTo(158182, 0);

    // Ordinary gain (recapture) = min(158182, 58182) = 58182
    expect(result.ordinaryGain).toBeCloseTo(58182, 0);

    // Long term gain = 158182 - 58182 = 100000
    expect(result.longTermGain).toBeCloseTo(100000, 0);

    // Recapture tax = 58182 * 0.25 = 14545.50
    expect(result.recaptureTax).toBeCloseTo(14545.50, 2);

    // Capital gains tax = 100000 * 0.15 = 15000
    expect(result.capitalGainsTax).toBeCloseTo(15000, 0);

    // State tax = 158182 * 0.09 = 14236.38
    expect(result.stateTax).toBeCloseTo(14236.38, 2);
  });

  it('should handle capital improvements', () => {
    const result = calculateExitTaxes({
      purchasePrice: 400000,
      salePrice: 500000,
      totalDepreciation: 58182,
      capitalImprovements: 20000, // Added improvements
      capitalGainsRate: 0.15,
      recaptureRate: 0.25,
      stateTaxRate: 0.09,
    });

    // Adjusted basis = 400000 - 58182 + 20000 = 361818
    // Capital gain = 500000 - 361818 = 138182
    expect(result.capitalGain).toBeCloseTo(138182, 0);
  });

  it('should return zero taxes when no gain', () => {
    const result = calculateExitTaxes({
      purchasePrice: 400000,
      salePrice: 350000, // Sold at a loss
      totalDepreciation: 30000,
      capitalGainsRate: 0.15,
      recaptureRate: 0.25,
      stateTaxRate: 0.09,
    });

    // Loss scenario: no taxes
    expect(result.capitalGain).toBeLessThan(0);
    expect(result.totalTax).toBe(0);
  });

  it('should cap recapture at total gain', () => {
    // Small gain, large depreciation
    const result = calculateExitTaxes({
      purchasePrice: 400000,
      salePrice: 420000, // Only 20K gain after adjustments
      totalDepreciation: 100000, // Large depreciation
      capitalGainsRate: 0.15,
      recaptureRate: 0.25,
      stateTaxRate: 0.09,
    });

    // Adjusted basis = 400000 - 100000 = 300000
    // Capital gain = 420000 - 300000 = 120000
    // Ordinary gain = min(120000, 100000) = 100000
    // Long term gain = 120000 - 100000 = 20000

    expect(result.capitalGain).toBe(120000);
    expect(result.ordinaryGain).toBe(100000);
    expect(result.longTermGain).toBe(20000);
  });
});

describe('calculateSellingCosts', () => {
  it('should calculate selling costs correctly', () => {
    const costs = calculateSellingCosts(500000, 0.07);
    expect(costs).toBe(35000); // 7% of 500K
  });
});

describe('calculateNetSaleProceeds', () => {
  it('should calculate net proceeds correctly', () => {
    // Sale: 500K, Selling costs: 35K, Taxes: 40K, Loan: 200K
    const proceeds = calculateNetSaleProceeds(500000, 35000, 40000, 200000);
    expect(proceeds).toBe(225000);
  });

  it('should handle zero loan balance', () => {
    const proceeds = calculateNetSaleProceeds(500000, 35000, 40000, 0);
    expect(proceeds).toBe(425000);
  });
});

describe('getCombinedTaxRate', () => {
  it('should sum federal and state rates', () => {
    const assumptions: GlobalAssumptions = {
      federalTaxRate: 0.30,
      stateTaxRate: 0.09,
      reitBaselineReturn: 0.06,
      depreciationYears: 27.5,
      landValuePct: 0.20,
      capitalGainsRate: 0.15,
      deprecationRecaptureRate: 0.25,
    };

    const rate = getCombinedTaxRate(assumptions);
    expect(rate).toBe(0.39);
  });
});
