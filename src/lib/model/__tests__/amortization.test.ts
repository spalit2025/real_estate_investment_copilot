import { describe, it, expect } from 'vitest';
import {
  calculateMonthlyPayment,
  generateAmortizationSchedule,
  getLoanBalanceAtYear,
  getInterestForYear,
  getPrincipalForYear,
} from '../amortization';

describe('calculateMonthlyPayment', () => {
  it('should calculate correct monthly payment for $300K @ 6% / 30yr', () => {
    const payment = calculateMonthlyPayment(300000, 0.06, 30);
    expect(payment).toBeCloseTo(1798.65, 2);
  });

  it('should calculate correct monthly payment for $200K @ 5% / 15yr', () => {
    const payment = calculateMonthlyPayment(200000, 0.05, 15);
    expect(payment).toBeCloseTo(1581.59, 2);
  });

  it('should calculate correct monthly payment for $500K @ 7% / 30yr', () => {
    const payment = calculateMonthlyPayment(500000, 0.07, 30);
    expect(payment).toBeCloseTo(3326.51, 2);
  });

  it('should handle zero interest rate', () => {
    const payment = calculateMonthlyPayment(120000, 0, 10);
    expect(payment).toBe(1000); // 120000 / 120 months
  });

  it('should throw error for negative principal', () => {
    expect(() => calculateMonthlyPayment(-100000, 0.06, 30)).toThrow(
      'Principal must be positive'
    );
  });

  it('should throw error for negative interest rate', () => {
    expect(() => calculateMonthlyPayment(100000, -0.01, 30)).toThrow(
      'Interest rate cannot be negative'
    );
  });

  it('should throw error for non-positive term', () => {
    expect(() => calculateMonthlyPayment(100000, 0.06, 0)).toThrow(
      'Loan term must be positive'
    );
  });
});

describe('generateAmortizationSchedule', () => {
  it('should generate correct number of entries', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    expect(schedule.length).toBe(360); // 30 years * 12 months
  });

  it('should have principal payments sum to original loan amount', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    const totalPrincipal = schedule.reduce((sum, entry) => sum + entry.principal, 0);
    expect(totalPrincipal).toBeCloseTo(300000, 0);
  });

  it('should have zero balance at end of schedule', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    expect(schedule[schedule.length - 1].balance).toBe(0);
  });

  it('should have decreasing balance over time', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i].balance).toBeLessThan(schedule[i - 1].balance);
    }
  });

  it('should have increasing principal payments over time', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    for (let i = 1; i < schedule.length; i++) {
      expect(schedule[i].principal).toBeGreaterThan(schedule[i - 1].principal);
    }
  });

  it('should have correct first month breakdown', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    const firstMonth = schedule[0];

    // Interest for first month: 300000 * 0.06 / 12 = 1500
    expect(firstMonth.interest).toBeCloseTo(1500, 2);

    // Principal for first month: payment - interest = 1798.65 - 1500 = 298.65
    expect(firstMonth.principal).toBeCloseTo(298.65, 2);

    expect(firstMonth.payment).toBeCloseTo(1798.65, 2);
  });
});

describe('getLoanBalanceAtYear', () => {
  it('should return correct balance at year 5', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    const balanceYear5 = getLoanBalanceAtYear(schedule, 5);

    // After 5 years of $300K @ 6%, balance should be around $279K
    expect(balanceYear5).toBeGreaterThan(275000);
    expect(balanceYear5).toBeLessThan(285000);
  });

  it('should return correct balance at year 15', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    const balanceYear15 = getLoanBalanceAtYear(schedule, 15);

    // After 15 years (halfway through 30-year loan)
    // Due to amortization, more than half the principal remains at midpoint
    // Balance should be around $213K for 300K loan at 6%
    expect(balanceYear15).toBeGreaterThan(200000);
    expect(balanceYear15).toBeLessThan(220000);
  });

  it('should return 0 after loan term ends', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    const balanceYear35 = getLoanBalanceAtYear(schedule, 35);
    expect(balanceYear35).toBe(0);
  });

  it('should throw error for year 0 or negative', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    expect(() => getLoanBalanceAtYear(schedule, 0)).toThrow('Year must be positive');
  });
});

describe('getInterestForYear', () => {
  it('should return correct total interest for year 1', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    const interestYear1 = getInterestForYear(schedule, 1);

    // First year interest should be close to but less than 300000 * 0.06 = 18000
    // (because principal is paid down each month)
    expect(interestYear1).toBeGreaterThan(17500);
    expect(interestYear1).toBeLessThan(18000);
  });

  it('should have decreasing interest over years', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    const interestYear1 = getInterestForYear(schedule, 1);
    const interestYear5 = getInterestForYear(schedule, 5);
    const interestYear10 = getInterestForYear(schedule, 10);

    expect(interestYear5).toBeLessThan(interestYear1);
    expect(interestYear10).toBeLessThan(interestYear5);
  });

  it('should return 0 for year beyond loan term', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    const interestYear35 = getInterestForYear(schedule, 35);
    expect(interestYear35).toBe(0);
  });
});

describe('getPrincipalForYear', () => {
  it('should have increasing principal payments over years', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    const principalYear1 = getPrincipalForYear(schedule, 1);
    const principalYear5 = getPrincipalForYear(schedule, 5);
    const principalYear10 = getPrincipalForYear(schedule, 10);

    expect(principalYear5).toBeGreaterThan(principalYear1);
    expect(principalYear10).toBeGreaterThan(principalYear5);
  });

  it('should have interest + principal equal to total payments', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);

    for (let year = 1; year <= 5; year++) {
      const interest = getInterestForYear(schedule, year);
      const principal = getPrincipalForYear(schedule, year);
      const expectedTotal = calculateMonthlyPayment(300000, 0.06, 30) * 12;

      expect(interest + principal).toBeCloseTo(expectedTotal, 2);
    }
  });
});
