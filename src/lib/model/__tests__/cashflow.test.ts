import { describe, it, expect } from 'vitest';
import {
  calculateAnnualIncome,
  calculateOperatingExpenses,
  calculateNOI,
  calculateCashFlowBeforeTax,
  calculateInitialEquity,
  calculateLoanAmount,
  calculatePropertyValue,
  calculateEquity,
  calculateCapRate,
  calculateCashOnCash,
  calculateGRM,
} from '../cashflow';
import type { Deal } from '@/types';

// Helper to create a test deal with typical values
const createTestDeal = (overrides: Partial<Deal> = {}): Deal => ({
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
  ...overrides,
});

describe('calculateAnnualIncome', () => {
  it('should calculate year 1 income correctly', () => {
    const deal = createTestDeal({ monthlyRent: 2500, vacancyPct: 0.05 });
    const income = calculateAnnualIncome(deal, 1);

    // Year 1: no growth applied
    expect(income.grossRent).toBe(30000); // 2500 * 12
    expect(income.vacancyLoss).toBe(1500); // 30000 * 0.05
    expect(income.effectiveGrossIncome).toBe(28500); // 30000 - 1500
  });

  it('should apply rent growth for year 2+', () => {
    const deal = createTestDeal({ monthlyRent: 2500, rentGrowthPct: 0.03 });
    const year1 = calculateAnnualIncome(deal, 1);
    const year2 = calculateAnnualIncome(deal, 2);
    const year5 = calculateAnnualIncome(deal, 5);

    expect(year2.grossRent).toBeCloseTo(30900, 0); // 30000 * 1.03
    expect(year5.grossRent).toBeCloseTo(30000 * Math.pow(1.03, 4), 0);
    expect(year5.grossRent).toBeGreaterThan(year1.grossRent);
  });

  it('should handle zero vacancy', () => {
    const deal = createTestDeal({ monthlyRent: 2000, vacancyPct: 0 });
    const income = calculateAnnualIncome(deal, 1);

    expect(income.vacancyLoss).toBe(0);
    expect(income.effectiveGrossIncome).toBe(24000);
  });

  it('should throw error for invalid year', () => {
    const deal = createTestDeal();
    expect(() => calculateAnnualIncome(deal, 0)).toThrow('Year must be positive');
    expect(() => calculateAnnualIncome(deal, -1)).toThrow('Year must be positive');
  });
});

describe('calculateOperatingExpenses', () => {
  it('should calculate year 1 expenses correctly', () => {
    const deal = createTestDeal({
      propertyTaxAnnual: 5000,
      insuranceAnnual: 1200,
      hoaMonthly: 200,
      managementPct: 0.08,
      repairsPct: 0.05,
      capexPct: 0.05,
      utilitiesMonthly: 100,
    });
    const egi = 28500;
    const expenses = calculateOperatingExpenses(deal, egi, 1);

    expect(expenses.propertyTax).toBe(5000);
    expect(expenses.insurance).toBe(1200);
    expect(expenses.hoa).toBe(2400); // 200 * 12
    expect(expenses.management).toBe(2280); // 28500 * 0.08
    expect(expenses.repairs).toBe(1425); // 28500 * 0.05
    expect(expenses.capex).toBe(1425); // 28500 * 0.05
    expect(expenses.utilities).toBe(1200); // 100 * 12
    expect(expenses.total).toBe(14930);
  });

  it('should apply expense growth for year 2+', () => {
    const deal = createTestDeal({ propertyTaxAnnual: 5000, insuranceAnnual: 1200 });
    const expenses1 = calculateOperatingExpenses(deal, 28500, 1);
    const expenses2 = calculateOperatingExpenses(deal, 28500, 2);
    const expenses5 = calculateOperatingExpenses(deal, 28500, 5);

    // Property tax grows at 2%
    expect(expenses2.propertyTax).toBeCloseTo(5100, 0); // 5000 * 1.02
    expect(expenses5.propertyTax).toBeCloseTo(5000 * Math.pow(1.02, 4), 0);

    // Insurance grows at 3%
    expect(expenses2.insurance).toBeCloseTo(1236, 0); // 1200 * 1.03
    expect(expenses5.insurance).toBeCloseTo(1200 * Math.pow(1.03, 4), 0);
  });

  it('should calculate variable expenses based on EGI', () => {
    const deal = createTestDeal({ managementPct: 0.10, repairsPct: 0.05, capexPct: 0.05 });

    const expenses1 = calculateOperatingExpenses(deal, 30000, 1);
    const expenses2 = calculateOperatingExpenses(deal, 40000, 1);

    expect(expenses1.management).toBe(3000); // 30000 * 0.10
    expect(expenses2.management).toBe(4000); // 40000 * 0.10
  });
});

describe('calculateNOI', () => {
  it('should calculate NOI correctly', () => {
    const noi = calculateNOI(30000, 12000);
    expect(noi).toBe(18000);
  });

  it('should handle negative NOI', () => {
    const noi = calculateNOI(10000, 15000);
    expect(noi).toBe(-5000);
  });
});

describe('calculateCashFlowBeforeTax', () => {
  it('should calculate CFBT correctly', () => {
    const cfbt = calculateCashFlowBeforeTax(18000, 15000);
    expect(cfbt).toBe(3000);
  });

  it('should handle negative cash flow', () => {
    const cfbt = calculateCashFlowBeforeTax(12000, 15000);
    expect(cfbt).toBe(-3000);
  });
});

describe('calculateInitialEquity', () => {
  it('should include down payment and closing costs', () => {
    const equity = calculateInitialEquity(400000, 0.25, 0.02);
    // Down payment: 400000 * 0.25 = 100000
    // Closing costs: 400000 * 0.02 = 8000
    // Total: 108000
    expect(equity).toBe(108000);
  });

  it('should handle zero closing costs', () => {
    const equity = calculateInitialEquity(400000, 0.25, 0);
    expect(equity).toBe(100000);
  });
});

describe('calculateLoanAmount', () => {
  it('should calculate loan amount correctly', () => {
    const loan = calculateLoanAmount(400000, 0.25);
    expect(loan).toBe(300000);
  });

  it('should handle different down payments', () => {
    expect(calculateLoanAmount(500000, 0.20)).toBe(400000);
    expect(calculateLoanAmount(500000, 0.30)).toBe(350000);
  });
});

describe('calculatePropertyValue', () => {
  it('should apply compound appreciation', () => {
    const value5 = calculatePropertyValue(400000, 0.03, 5);
    const value10 = calculatePropertyValue(400000, 0.03, 10);

    expect(value5).toBeCloseTo(400000 * Math.pow(1.03, 5), 0);
    expect(value10).toBeCloseTo(400000 * Math.pow(1.03, 10), 0);
    expect(value10).toBeGreaterThan(value5);
  });

  it('should handle zero appreciation', () => {
    const value = calculatePropertyValue(400000, 0, 10);
    expect(value).toBe(400000);
  });

  it('should handle negative appreciation', () => {
    const value = calculatePropertyValue(400000, -0.02, 5);
    expect(value).toBeLessThan(400000);
  });
});

describe('calculateEquity', () => {
  it('should calculate equity correctly', () => {
    const equity = calculateEquity(450000, 280000);
    expect(equity).toBe(170000);
  });
});

describe('calculateCapRate', () => {
  it('should calculate cap rate correctly', () => {
    const capRate = calculateCapRate(20000, 400000);
    expect(capRate).toBe(0.05); // 5%
  });

  it('should throw for zero/negative purchase price', () => {
    expect(() => calculateCapRate(20000, 0)).toThrow('Purchase price must be positive');
    expect(() => calculateCapRate(20000, -100000)).toThrow('Purchase price must be positive');
  });
});

describe('calculateCashOnCash', () => {
  it('should calculate cash-on-cash return correctly', () => {
    const coc = calculateCashOnCash(5000, 100000);
    expect(coc).toBe(0.05); // 5%
  });

  it('should handle negative cash flow', () => {
    const coc = calculateCashOnCash(-2000, 100000);
    expect(coc).toBe(-0.02); // -2%
  });

  it('should throw for invalid equity', () => {
    expect(() => calculateCashOnCash(5000, 0)).toThrow('Initial equity must be positive');
  });
});

describe('calculateGRM', () => {
  it('should calculate GRM correctly', () => {
    const grm = calculateGRM(400000, 30000);
    expect(grm).toBeCloseTo(13.33, 2);
  });

  it('should throw for zero rent', () => {
    expect(() => calculateGRM(400000, 0)).toThrow('Annual gross rent must be positive');
  });
});
