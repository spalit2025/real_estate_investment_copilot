import { describe, it, expect } from 'vitest';
import { runModel, determineVerdict } from '../index';
import type { Deal, HorizonResult, DataGap } from '@/types';

// Create a realistic test deal
const createTestDeal = (overrides: Partial<Deal> = {}): Deal => ({
  id: 'test-deal-1',
  userId: 'test-user',
  createdAt: new Date(),
  updatedAt: new Date(),
  address: '123 Main St',
  city: 'San Francisco',
  state: 'CA',
  zip: '94102',
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
  monthlyRent: 2800,
  vacancyPct: 0.05,
  rentGrowthPct: 0.03,
  propertyTaxAnnual: 5000,
  insuranceAnnual: 1200,
  hoaMonthly: 0,
  managementPct: 0.08,
  repairsPct: 0.05,
  capexPct: 0.05,
  utilitiesMonthly: 0,
  appreciationPct: 0.04, // 4% for Bay Area
  sellingCostsPct: 0.07,
  isRentControlled: false,
  hasHOARentalLimit: false,
  knownCapex: 'Roof replaced 2020',
  assumptionOverrides: {},
  status: 'draft',
  ...overrides,
});

describe('runModel', () => {
  describe('Basic Model Output Structure', () => {
    it('should return complete model output', () => {
      const deal = createTestDeal();
      const output = runModel(deal);

      expect(output).toBeDefined();
      expect(output.deal).toBe(deal);
      expect(output.assumptions).toBeDefined();
      expect(output.resultsByYear).toHaveLength(10);
      expect(output.resultsByHorizon).toBeDefined();
      expect(output.resultsByHorizon.year5).toBeDefined();
      expect(output.resultsByHorizon.year7).toBeDefined();
      expect(output.resultsByHorizon.year10).toBeDefined();
      expect(output.sensitivityRuns).toBeDefined();
      expect(output.dataGaps).toBeDefined();
      expect(output.computedAt).toBeInstanceOf(Date);
    });

    it('should include all year result fields', () => {
      const deal = createTestDeal();
      const output = runModel(deal);
      const year1 = output.resultsByYear[0];

      expect(year1.year).toBe(1);
      expect(year1.grossRent).toBeGreaterThan(0);
      expect(year1.vacancy).toBeGreaterThanOrEqual(0);
      expect(year1.effectiveGrossIncome).toBeGreaterThan(0);
      expect(year1.operatingExpenses).toBeGreaterThan(0);
      expect(year1.noi).toBeDefined();
      expect(year1.debtService).toBeGreaterThan(0);
      expect(year1.cashFlowBeforeTax).toBeDefined();
      expect(year1.depreciation).toBeGreaterThan(0);
      expect(year1.interestPaid).toBeGreaterThan(0);
      expect(year1.taxableIncome).toBeDefined();
      expect(year1.incomeTax).toBeDefined();
      expect(year1.cashFlowAfterTax).toBeDefined();
      expect(year1.loanBalance).toBeGreaterThan(0);
      expect(year1.propertyValue).toBeGreaterThan(0);
      expect(year1.equity).toBeGreaterThan(0);
    });

    it('should include all horizon result fields', () => {
      const deal = createTestDeal();
      const output = runModel(deal);
      const horizon = output.resultsByHorizon.year7;

      expect(horizon.years).toBe(7);
      expect(horizon.initialEquity).toBeGreaterThan(0);
      expect(horizon.cumulativeCashFlow).toBeDefined();
      expect(horizon.remainingLoanBalance).toBeGreaterThan(0);
      expect(horizon.grossSalePrice).toBeGreaterThan(0);
      expect(horizon.sellingCosts).toBeGreaterThan(0);
      expect(horizon.totalTaxAtSale).toBeGreaterThanOrEqual(0);
      expect(horizon.netSaleProceeds).toBeGreaterThan(0);
      expect(horizon.totalReturn).toBeGreaterThan(0);
      expect(horizon.irr).toBeDefined();
      expect(horizon.equityMultiple).toBeGreaterThan(0);
      expect(horizon.reitComparison).toBeDefined();
    });
  });

  describe('Financial Calculations', () => {
    it('should calculate correct initial equity', () => {
      const deal = createTestDeal({ purchasePrice: 400000, downPaymentPct: 0.25, closingCostsPct: 0.02 });
      const output = runModel(deal);

      // Down payment: 400K * 25% = 100K
      // Closing costs: 400K * 2% = 8K
      // Total: 108K
      expect(output.resultsByHorizon.year7.initialEquity).toBe(108000);
    });

    it('should calculate correct year 1 gross rent', () => {
      const deal = createTestDeal({ monthlyRent: 2800 });
      const output = runModel(deal);

      // Year 1 gross rent: 2800 * 12 = 33600
      expect(output.resultsByYear[0].grossRent).toBe(33600);
    });

    it('should apply rent growth over years', () => {
      const deal = createTestDeal({ monthlyRent: 2500, rentGrowthPct: 0.03 });
      const output = runModel(deal);

      const year1Rent = output.resultsByYear[0].grossRent;
      const year5Rent = output.resultsByYear[4].grossRent;
      const year10Rent = output.resultsByYear[9].grossRent;

      // Year 1: 2500 * 12 = 30000
      expect(year1Rent).toBe(30000);

      // Year 5: 30000 * 1.03^4 = ~33765
      expect(year5Rent).toBeCloseTo(30000 * Math.pow(1.03, 4), 0);

      // Year 10: 30000 * 1.03^9 = ~39142
      expect(year10Rent).toBeCloseTo(30000 * Math.pow(1.03, 9), 0);

      expect(year10Rent).toBeGreaterThan(year5Rent);
      expect(year5Rent).toBeGreaterThan(year1Rent);
    });

    it('should calculate depreciation correctly', () => {
      const deal = createTestDeal({ purchasePrice: 400000 });
      const output = runModel(deal);

      // Building value: 400K * 80% = 320K
      // Depreciation: 320K / 27.5 = $11,636.36
      expect(output.resultsByYear[0].depreciation).toBeCloseTo(11636.36, 2);
    });

    it('should have decreasing loan balance over time', () => {
      const deal = createTestDeal();
      const output = runModel(deal);

      for (let i = 1; i < 10; i++) {
        expect(output.resultsByYear[i].loanBalance).toBeLessThan(
          output.resultsByYear[i - 1].loanBalance
        );
      }
    });

    it('should have increasing property value over time', () => {
      const deal = createTestDeal({ appreciationPct: 0.03 });
      const output = runModel(deal);

      for (let i = 1; i < 10; i++) {
        expect(output.resultsByYear[i].propertyValue).toBeGreaterThan(
          output.resultsByYear[i - 1].propertyValue
        );
      }
    });

    it('should calculate IRR within expected range for typical deal', () => {
      const deal = createTestDeal({
        purchasePrice: 400000,
        monthlyRent: 2800,
        appreciationPct: 0.04,
      });
      const output = runModel(deal);

      // Typical good RE deal should have 8-15% IRR
      expect(output.resultsByHorizon.year7.irr).toBeGreaterThan(0.05);
      expect(output.resultsByHorizon.year7.irr).toBeLessThan(0.25);
    });

    it('should have IRR increasing with longer hold periods', () => {
      const deal = createTestDeal({ appreciationPct: 0.04 });
      const output = runModel(deal);

      // Generally, IRR should improve with longer holds (more appreciation benefit)
      // This isn't always true but for typical deals it should be
      expect(output.resultsByHorizon.year10.irr).toBeGreaterThanOrEqual(
        output.resultsByHorizon.year5.irr - 0.02 // Allow small variance
      );
    });
  });

  describe('Sensitivity Analysis', () => {
    it('should include all sensitivity scenarios', () => {
      const deal = createTestDeal();
      const output = runModel(deal);

      const rentScenarios = output.sensitivityRuns.filter((s) => s.variable === 'rent');
      const appreciationScenarios = output.sensitivityRuns.filter((s) => s.variable === 'appreciation');
      const vacancyScenarios = output.sensitivityRuns.filter((s) => s.variable === 'vacancy');

      expect(rentScenarios.length).toBe(5);
      expect(appreciationScenarios.length).toBe(5);
      expect(vacancyScenarios.length).toBe(5);
    });

    it('should show higher IRR with higher rent', () => {
      const deal = createTestDeal();
      const output = runModel(deal);

      const rentScenarios = output.sensitivityRuns.filter((s) => s.variable === 'rent');
      const baseRent = rentScenarios.find((s) => s.delta === 0);
      const highRent = rentScenarios.find((s) => s.delta === 0.10);
      const lowRent = rentScenarios.find((s) => s.delta === -0.10);

      expect(highRent!.irr7).toBeGreaterThan(baseRent!.irr7);
      expect(lowRent!.irr7).toBeLessThan(baseRent!.irr7);
    });

    it('should show higher IRR with higher appreciation', () => {
      const deal = createTestDeal();
      const output = runModel(deal);

      const appreciationScenarios = output.sensitivityRuns.filter((s) => s.variable === 'appreciation');
      const base = appreciationScenarios.find((s) => s.delta === 0);
      const high = appreciationScenarios.find((s) => s.delta === 0.02);
      const low = appreciationScenarios.find((s) => s.delta === -0.02);

      expect(high!.irr7).toBeGreaterThan(base!.irr7);
      expect(low!.irr7).toBeLessThan(base!.irr7);
    });

    it('should show lower IRR with higher vacancy', () => {
      const deal = createTestDeal();
      const output = runModel(deal);

      const vacancyScenarios = output.sensitivityRuns.filter((s) => s.variable === 'vacancy');
      const base = vacancyScenarios.find((s) => s.delta === 0);
      const worse = vacancyScenarios.find((s) => s.delta === 0.05); // +5% vacancy is worse
      const better = vacancyScenarios.find((s) => s.delta === -0.03); // -3% vacancy is better

      expect(worse!.irr7).toBeLessThan(base!.irr7);
      expect(better!.irr7).toBeGreaterThan(base!.irr7);
    });
  });

  describe('Data Gaps', () => {
    it('should identify gaps for missing property tax', () => {
      const deal = createTestDeal({ propertyTaxAnnual: 0 });
      const output = runModel(deal);

      const taxGap = output.dataGaps.find((g) => g.field === 'propertyTaxAnnual');
      expect(taxGap).toBeDefined();
      expect(taxGap?.impact).toBe('high');
    });

    it('should identify gaps for default appreciation', () => {
      const deal = createTestDeal({ appreciationPct: 0.03 }); // Default value
      const output = runModel(deal);

      const gap = output.dataGaps.find((g) => g.field === 'appreciationPct');
      expect(gap).toBeDefined();
      expect(gap?.impact).toBe('high');
    });

    it('should not flag gaps for explicitly set values', () => {
      const deal = createTestDeal({
        propertyTaxAnnual: 5000,
        insuranceAnnual: 1200,
        vacancyPct: 0.08, // Non-default
        rentGrowthPct: 0.04, // Non-default
        appreciationPct: 0.05, // Non-default
        knownCapex: 'New HVAC 2023',
        isRentControlled: false,
      });
      const output = runModel(deal);

      // Should have fewer gaps
      const highGaps = output.dataGaps.filter((g) => g.impact === 'high');
      expect(highGaps.length).toBeLessThanOrEqual(1); // Maybe just rent control check
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero HOA', () => {
      const deal = createTestDeal({ hoaMonthly: 0 });
      const output = runModel(deal);

      expect(output.resultsByYear[0].operatingExpensesBreakdown.hoa).toBe(0);
    });

    it('should handle high appreciation market', () => {
      const deal = createTestDeal({ appreciationPct: 0.08 }); // 8% appreciation
      const output = runModel(deal);

      // High appreciation should lead to strong returns
      expect(output.resultsByHorizon.year7.irr).toBeGreaterThan(0.10);
    });

    it('should handle high vacancy scenario', () => {
      const deal = createTestDeal({ vacancyPct: 0.15 }); // 15% vacancy
      const output = runModel(deal);

      // Higher vacancy reduces income
      const normalDeal = createTestDeal({ vacancyPct: 0.05 });
      const normalOutput = runModel(normalDeal);

      expect(output.resultsByYear[0].effectiveGrossIncome).toBeLessThan(
        normalOutput.resultsByYear[0].effectiveGrossIncome
      );
    });
  });
});

describe('determineVerdict', () => {
  const createHorizonResult = (overrides: Partial<HorizonResult> = {}): HorizonResult => ({
    years: 7,
    initialEquity: 100000,
    cumulativeCashFlow: 35000,
    remainingLoanBalance: 250000,
    grossSalePrice: 500000,
    sellingCosts: 35000,
    capitalGainsTax: 15000,
    depreciationRecapture: 14545,
    totalTaxAtSale: 29545,
    netSaleProceeds: 185455,
    totalReturn: 220455,
    irr: 0.12,
    equityMultiple: 2.2,
    reitComparison: 0.05,
    ...overrides,
  });

  it('should return BUY for strong deal', () => {
    const result = createHorizonResult({
      irr: 0.15,
      equityMultiple: 2.0,
      reitComparison: 0.10,
    });
    const gaps: DataGap[] = [];

    const verdict = determineVerdict(result, gaps);
    expect(verdict.verdict).toBe('buy');
  });

  it('should return SKIP for weak IRR', () => {
    const result = createHorizonResult({
      irr: 0.05, // Below 8% threshold
      equityMultiple: 1.3,
      reitComparison: -0.05,
    });
    const gaps: DataGap[] = [];

    const verdict = determineVerdict(result, gaps);
    expect(verdict.verdict).toBe('skip');
    expect(verdict.driver).toContain('Low');
  });

  it('should return SKIP when underperforming REIT', () => {
    const result = createHorizonResult({
      irr: 0.09,
      equityMultiple: 1.5,
      reitComparison: -0.02, // Underperforms REIT
    });
    const gaps: DataGap[] = [];

    const verdict = determineVerdict(result, gaps);
    expect(verdict.verdict).toBe('skip');
    expect(verdict.driver).toContain('REIT');
  });

  it('should return WATCH for borderline deal', () => {
    const result = createHorizonResult({
      irr: 0.10, // Between 8-12%
      equityMultiple: 1.6,
      reitComparison: 0.01,
    });
    const gaps: DataGap[] = [];

    const verdict = determineVerdict(result, gaps);
    expect(verdict.verdict).toBe('watch');
  });

  it('should return WATCH when HIGH data gaps exist', () => {
    const result = createHorizonResult({
      irr: 0.14, // Would otherwise be BUY
      equityMultiple: 2.0,
      reitComparison: 0.05,
    });
    const gaps: DataGap[] = [
      {
        field: 'propertyTaxAnnual',
        impact: 'high',
        defaultUsed: '0',
        recommendation: 'Get exact property tax',
      },
    ];

    const verdict = determineVerdict(result, gaps);
    expect(verdict.verdict).toBe('watch');
    expect(verdict.driver).toContain('gaps');
  });
});
