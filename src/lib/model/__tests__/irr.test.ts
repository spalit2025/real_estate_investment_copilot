import { describe, it, expect } from 'vitest';
import {
  calculateNPV,
  calculateIRR,
  calculateEquityMultiple,
  calculateREITComparison,
} from '../irr';

describe('calculateNPV', () => {
  it('should calculate NPV correctly at 10% discount rate', () => {
    // Initial investment -100, returns of 50 for 3 years
    const cashFlows = [-100, 50, 50, 50];
    const npv = calculateNPV(cashFlows, 0.1);

    // NPV = -100 + 50/1.1 + 50/1.21 + 50/1.331 = 24.34
    expect(npv).toBeCloseTo(24.34, 2);
  });

  it('should return initial investment when rate is 0', () => {
    const cashFlows = [-100, 50, 50, 50];
    const npv = calculateNPV(cashFlows, 0);

    // NPV at 0% = sum of all cash flows = -100 + 50 + 50 + 50 = 50
    expect(npv).toBe(50);
  });

  it('should handle single cash flow', () => {
    const cashFlows = [-100];
    const npv = calculateNPV(cashFlows, 0.1);
    expect(npv).toBe(-100);
  });

  it('should throw error for empty cash flows', () => {
    expect(() => calculateNPV([], 0.1)).toThrow('Cash flows array cannot be empty');
  });
});

describe('calculateIRR', () => {
  it('should calculate IRR for standard investment', () => {
    // Standard cash flows: -100000, then positive returns over 5 years
    const cashFlows = [-100000, 5000, 5200, 5400, 5600, 105800];
    const irr = calculateIRR(cashFlows);

    expect(irr).not.toBeNull();
    // Verify the IRR makes NPV ≈ 0
    const npv = calculateNPV(cashFlows, irr!);
    expect(Math.abs(npv)).toBeLessThan(1); // NPV should be near zero
  });

  it('should calculate correct IRR for simple doubling in 3 years', () => {
    // Invest 100, get 200 in year 3
    // IRR: (200/100)^(1/3) - 1 = 0.26 (26%)
    const cashFlows = [-100, 0, 0, 200];
    const irr = calculateIRR(cashFlows);

    expect(irr).not.toBeNull();
    // Should be close to cube root of 2 minus 1
    expect(irr).toBeCloseTo(Math.pow(2, 1/3) - 1, 2);
  });

  it('should handle negative IRR correctly', () => {
    // Invest 100, get only 80 back over 5 years
    const cashFlows = [-100, 10, 10, 10, 10, 40];
    const irr = calculateIRR(cashFlows);

    expect(irr).not.toBeNull();
    expect(irr!).toBeLessThan(0);
  });

  it('should calculate IRR for real estate style cash flows', () => {
    // More realistic: $100K equity, ~$5K/year cash flow, sell for $150K net in year 7
    const cashFlows = [-100000, 5000, 5150, 5305, 5464, 5628, 5797, 155970];
    const irr = calculateIRR(cashFlows);

    expect(irr).not.toBeNull();
    // Should be roughly 10-15% for typical RE investment
    expect(irr).toBeGreaterThan(0.08);
    expect(irr).toBeLessThan(0.20);
  });

  it('should calculate high IRR correctly', () => {
    // Great deal: 100K in, 300K out in 5 years
    const cashFlows = [-100000, 10000, 10000, 10000, 10000, 310000];
    const irr = calculateIRR(cashFlows);

    expect(irr).not.toBeNull();
    // This is a strong investment, should be 20%+
    expect(irr).toBeGreaterThan(0.20);
  });

  it('should handle break-even scenario', () => {
    // Get your money back in year 1 (no time value = 0% IRR)
    const cashFlows = [-100000, 100000];
    const irr = calculateIRR(cashFlows);

    expect(irr).not.toBeNull();
    expect(irr).toBeCloseTo(0, 1);
  });

  it('should throw error for less than 2 cash flows', () => {
    expect(() => calculateIRR([-100])).toThrow('Need at least 2 cash flows');
  });

  it('should throw error for positive initial investment', () => {
    expect(() => calculateIRR([100, 50, 50])).toThrow(
      'Initial investment (cash flow at year 0) must be negative'
    );
  });

  it('should return null when no positive cash flows', () => {
    const irr = calculateIRR([-100, -10, -10, -10]);
    expect(irr).toBeNull();
  });

  it('should handle small positive returns', () => {
    // Total return: 1000*4 + 101000 = 105000 on 100000 investment
    // Simple return: 5% total over 5 years, compound ~1%/year
    const cashFlows = [-100000, 1000, 1000, 1000, 1000, 101000];
    const irr = calculateIRR(cashFlows);

    expect(irr).not.toBeNull();
    // Verify the NPV is near zero
    const npv = calculateNPV(cashFlows, irr!);
    expect(Math.abs(npv)).toBeLessThan(1);
  });
});

describe('calculateEquityMultiple', () => {
  it('should calculate 2x multiple correctly', () => {
    // Invest 100, get 200 total back
    const cashFlows = [-100, 50, 50, 50, 50];
    const multiple = calculateEquityMultiple(cashFlows);
    expect(multiple).toBe(2);
  });

  it('should calculate 1.8x multiple for RE scenario', () => {
    // $100K invested, $180K total return
    const cashFlows = [-100000, 5000, 5000, 5000, 5000, 160000];
    const multiple = calculateEquityMultiple(cashFlows);
    expect(multiple).toBe(1.8);
  });

  it('should handle sub-1x multiple (loss)', () => {
    // Invest 100, get only 80 back
    const cashFlows = [-100, 30, 30, 20];
    const multiple = calculateEquityMultiple(cashFlows);
    expect(multiple).toBe(0.8);
  });

  it('should throw error for less than 2 cash flows', () => {
    expect(() => calculateEquityMultiple([-100])).toThrow('Need at least 2 cash flows');
  });
});

describe('calculateREITComparison', () => {
  it('should show positive excess when beating REIT', () => {
    // $100K equity, $180K total return in 7 years
    // REIT at 6% would give: 100K * (1.06)^7 = $150,363
    // Excess: (180K / 150.4K) - 1 = 19.7%
    const excess = calculateREITComparison(180000, 100000, 7, 0.06);

    expect(excess).toBeGreaterThan(0);
    expect(excess).toBeCloseTo(0.197, 2);
  });

  it('should show negative excess when REIT wins', () => {
    // $100K equity, $140K total return in 7 years
    // REIT would give $150,363
    const excess = calculateREITComparison(140000, 100000, 7, 0.06);

    expect(excess).toBeLessThan(0);
  });

  it('should show ~0 when matching REIT', () => {
    // Return exactly what REIT would give
    const reitValue = 100000 * Math.pow(1.06, 5);
    const excess = calculateREITComparison(reitValue, 100000, 5, 0.06);

    expect(excess).toBeCloseTo(0, 4);
  });
});
