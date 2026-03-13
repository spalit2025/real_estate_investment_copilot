import { describe, it, expect, vi } from 'vitest';
import {
  runSensitivityAnalysis,
  formatSensitivityDelta,
  getBaseCase,
  calculateIRRChange,
  findWorstCase,
  findBestCase,
  type ModelRunner,
} from '../sensitivity';
import type { Deal, GlobalAssumptions, SensitivityResult } from '@/types';
import { SENSITIVITY_DELTAS } from '@/config/defaults';

// Test fixtures
const createTestDeal = (): Deal => ({
  id: 'test-id',
  userId: 'test-user',
  createdAt: new Date(),
  updatedAt: new Date(),
  address: '123 Test St',
  city: 'Test City',
  state: 'CA',
  zip: '12345',
  marketTag: 'bay_area_appreciation',
  propertyType: 'sfh',
  beds: 3,
  baths: 2,
  sqft: 1500,
  yearBuilt: 1990,
  purchasePrice: 400000,
  closingCostsPct: 0.02,
  downPaymentPct: 0.25,
  interestRate: 0.06,
  loanTermYears: 30,
  isARM: false,
  monthlyRent: 2500,
  vacancyPct: 0.05,
  rentGrowthPct: 0.03,
  propertyTaxAnnual: 5000,
  insuranceAnnual: 1200,
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
  assumptionOverrides: {},
  status: 'draft',
});

const testAssumptions: GlobalAssumptions = {
  federalTaxRate: 0.30,
  stateTaxRate: 0.09,
  reitBaselineReturn: 0.06,
  depreciationYears: 27.5,
  landValuePct: 0.20,
  capitalGainsRate: 0.15,
  deprecationRecaptureRate: 0.25,
  passiveLossUsable: true,
};

describe('runSensitivityAnalysis', () => {
  it('should run all configured scenarios', () => {
    const mockRunner: ModelRunner = vi.fn(() => ({
      irr5: 0.10,
      irr7: 0.11,
      irr10: 0.12,
    }));

    const deal = createTestDeal();
    const results = runSensitivityAnalysis(deal, testAssumptions, mockRunner);

    // Should have results for all rent, appreciation, and vacancy deltas
    const expectedCount =
      SENSITIVITY_DELTAS.rent.length +
      SENSITIVITY_DELTAS.appreciation.length +
      SENSITIVITY_DELTAS.vacancy.length;

    expect(results.length).toBe(expectedCount);

    // Model runner should be called for each scenario
    expect(mockRunner).toHaveBeenCalledTimes(expectedCount);
  });

  it('should modify rent correctly', () => {
    const mockRunner: ModelRunner = vi.fn((deal) => ({
      irr5: deal.monthlyRent / 25000, // Simple test: IRR proportional to rent
      irr7: 0.11,
      irr10: 0.12,
    }));

    const deal = createTestDeal();
    deal.monthlyRent = 2500;

    const results = runSensitivityAnalysis(deal, testAssumptions, mockRunner);

    // Find rent scenarios
    const rentScenarios = results.filter((r) => r.variable === 'rent');

    // Base case rent should be unmodified
    const baseCase = rentScenarios.find((r) => r.delta === 0);
    expect(baseCase?.irr5).toBeCloseTo(0.10, 4); // 2500 / 25000 = 0.10

    // +10% rent should increase IRR
    const plus10 = rentScenarios.find((r) => r.delta === 0.10);
    expect(plus10?.irr5).toBeCloseTo(0.11, 4); // 2750 / 25000 = 0.11

    // -10% rent should decrease IRR
    const minus10 = rentScenarios.find((r) => r.delta === -0.10);
    expect(minus10?.irr5).toBeCloseTo(0.09, 4); // 2250 / 25000 = 0.09
  });

  it('should modify appreciation correctly', () => {
    const mockRunner: ModelRunner = vi.fn((deal) => ({
      irr5: deal.appreciationPct * 5, // Simple test: IRR proportional to appreciation
      irr7: 0.11,
      irr10: 0.12,
    }));

    const deal = createTestDeal();
    deal.appreciationPct = 0.03;

    const results = runSensitivityAnalysis(deal, testAssumptions, mockRunner);

    const appreciationScenarios = results.filter((r) => r.variable === 'appreciation');

    // Base case: 3%
    const baseCase = appreciationScenarios.find((r) => r.delta === 0);
    expect(baseCase?.irr5).toBeCloseTo(0.15, 4); // 0.03 * 5 = 0.15

    // +2%: 5%
    const plus2 = appreciationScenarios.find((r) => r.delta === 0.02);
    expect(plus2?.irr5).toBeCloseTo(0.25, 4); // 0.05 * 5 = 0.25

    // -2%: 1%
    const minus2 = appreciationScenarios.find((r) => r.delta === -0.02);
    expect(minus2?.irr5).toBeCloseTo(0.05, 4); // 0.01 * 5 = 0.05
  });

  it('should modify vacancy correctly', () => {
    const mockRunner: ModelRunner = vi.fn((deal) => ({
      irr5: 0.15 - deal.vacancyPct, // Simple test: IRR decreases with vacancy
      irr7: 0.11,
      irr10: 0.12,
    }));

    const deal = createTestDeal();
    deal.vacancyPct = 0.05;

    const results = runSensitivityAnalysis(deal, testAssumptions, mockRunner);

    const vacancyScenarios = results.filter((r) => r.variable === 'vacancy');

    // Base case: 5% vacancy
    const baseCase = vacancyScenarios.find((r) => r.delta === 0);
    expect(baseCase?.irr5).toBeCloseTo(0.10, 4); // 0.15 - 0.05 = 0.10

    // +5% vacancy (worse): 10% vacancy
    const plus5 = vacancyScenarios.find((r) => r.delta === 0.05);
    expect(plus5?.irr5).toBeCloseTo(0.05, 4); // 0.15 - 0.10 = 0.05

    // -3% vacancy (better): 2% vacancy
    const minus3 = vacancyScenarios.find((r) => r.delta === -0.03);
    expect(minus3?.irr5).toBeCloseTo(0.13, 4); // 0.15 - 0.02 = 0.13
  });

  it('should clamp vacancy to valid range', () => {
    const modifiedDeals: Deal[] = [];
    const mockRunner: ModelRunner = vi.fn((deal) => {
      modifiedDeals.push(deal);
      return { irr5: 0.10, irr7: 0.11, irr10: 0.12 };
    });

    const deal = createTestDeal();
    deal.vacancyPct = 0.02; // Low vacancy - some deltas would make it negative

    runSensitivityAnalysis(deal, testAssumptions, mockRunner);

    // Find the -3% vacancy scenario
    const vacancyDeals = modifiedDeals.filter((d) => d.vacancyPct < deal.vacancyPct);

    // All vacancy values should be >= 0
    vacancyDeals.forEach((d) => {
      expect(d.vacancyPct).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('formatSensitivityDelta', () => {
  it('should format rent deltas correctly', () => {
    expect(formatSensitivityDelta('rent', 0.10)).toBe('+10% rent');
    expect(formatSensitivityDelta('rent', -0.05)).toBe('-5% rent');
    expect(formatSensitivityDelta('rent', 0)).toBe('+0% rent');
  });

  it('should format appreciation deltas correctly', () => {
    expect(formatSensitivityDelta('appreciation', 0.02)).toBe('+2% appreciation');
    expect(formatSensitivityDelta('appreciation', -0.01)).toBe('-1% appreciation');
  });

  it('should format vacancy deltas with direction indicator', () => {
    expect(formatSensitivityDelta('vacancy', 0.05)).toBe('+5% vacancy (worse)');
    expect(formatSensitivityDelta('vacancy', -0.02)).toBe('-2% vacancy (better)');
    expect(formatSensitivityDelta('vacancy', 0)).toBe('base vacancy');
  });
});

describe('getBaseCase', () => {
  it('should find base case for a variable', () => {
    const results: SensitivityResult[] = [
      { variable: 'rent', delta: -0.10, irr5: 0.08, irr7: 0.09, irr10: 0.10 },
      { variable: 'rent', delta: 0, irr5: 0.10, irr7: 0.11, irr10: 0.12 },
      { variable: 'rent', delta: 0.10, irr5: 0.12, irr7: 0.13, irr10: 0.14 },
    ];

    const baseCase = getBaseCase(results, 'rent');
    expect(baseCase).toBeDefined();
    expect(baseCase?.delta).toBe(0);
    expect(baseCase?.irr5).toBe(0.10);
  });

  it('should return undefined if no base case found', () => {
    const results: SensitivityResult[] = [
      { variable: 'rent', delta: -0.10, irr5: 0.08, irr7: 0.09, irr10: 0.10 },
    ];

    const baseCase = getBaseCase(results, 'rent');
    expect(baseCase).toBeUndefined();
  });
});

describe('calculateIRRChange', () => {
  it('should calculate positive change', () => {
    const change = calculateIRRChange(0.10, 0.12);
    expect(change).toBeCloseTo(0.02, 4);
  });

  it('should calculate negative change', () => {
    const change = calculateIRRChange(0.10, 0.08);
    expect(change).toBeCloseTo(-0.02, 4);
  });

  it('should return zero for no change', () => {
    const change = calculateIRRChange(0.10, 0.10);
    expect(change).toBe(0);
  });
});

describe('findWorstCase', () => {
  it('should find scenario with lowest IRR', () => {
    const results: SensitivityResult[] = [
      { variable: 'rent', delta: -0.10, irr5: 0.05, irr7: 0.06, irr10: 0.07 },
      { variable: 'rent', delta: 0, irr5: 0.10, irr7: 0.11, irr10: 0.12 },
      { variable: 'vacancy', delta: 0.05, irr5: 0.03, irr7: 0.04, irr10: 0.05 },
    ];

    const worst5 = findWorstCase(results, 5);
    expect(worst5?.irr5).toBe(0.03);
    expect(worst5?.variable).toBe('vacancy');

    const worst10 = findWorstCase(results, 10);
    expect(worst10?.irr10).toBe(0.05);
  });

  it('should handle empty results', () => {
    const worst = findWorstCase([], 5);
    expect(worst).toBeUndefined();
  });
});

describe('findBestCase', () => {
  it('should find scenario with highest IRR', () => {
    const results: SensitivityResult[] = [
      { variable: 'rent', delta: 0.10, irr5: 0.15, irr7: 0.16, irr10: 0.17 },
      { variable: 'rent', delta: 0, irr5: 0.10, irr7: 0.11, irr10: 0.12 },
      { variable: 'appreciation', delta: 0.02, irr5: 0.18, irr7: 0.19, irr10: 0.20 },
    ];

    const best5 = findBestCase(results, 5);
    expect(best5?.irr5).toBe(0.18);
    expect(best5?.variable).toBe('appreciation');

    const best10 = findBestCase(results, 10);
    expect(best10?.irr10).toBe(0.20);
  });
});
