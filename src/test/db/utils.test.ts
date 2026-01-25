/**
 * Database utilities unit tests
 * Tests for case conversion and error handling
 */

import { describe, it, expect } from 'vitest';
import { dealToRow, rowToDeal, DatabaseError } from '@/lib/db/utils';
import type { Deal } from '@/types/deal';
import type { DealRow } from '@/lib/db/types';

describe('Database Utilities', () => {
  describe('rowToDeal', () => {
    it('should convert a DealRow to Deal with correct case conversion', () => {
      const row: DealRow = {
        id: 'test-id-123',
        user_id: 'user-456',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T12:00:00Z',
        address: '123 Main St',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        market_tag: 'bay_area_appreciation',
        property_type: 'sfh',
        beds: 3,
        baths: 2,
        sqft: 1500,
        year_built: 1990,
        purchase_price: 800000,
        closing_costs_pct: 0.02,
        down_payment_pct: 0.25,
        interest_rate: 0.065,
        loan_term_years: 30,
        is_arm: false,
        arm_adjust_year: null,
        arm_adjust_rate: null,
        monthly_rent: 4000,
        vacancy_pct: 0.05,
        rent_growth_pct: 0.03,
        property_tax_annual: 10000,
        insurance_annual: 2000,
        hoa_monthly: 300,
        management_pct: 0.08,
        repairs_pct: 0.05,
        capex_pct: 0.05,
        utilities_monthly: 0,
        appreciation_pct: 0.03,
        selling_costs_pct: 0.07,
        is_rent_controlled: false,
        has_hoa_rental_limit: false,
        known_capex: 'New roof needed in 5 years',
        assumption_overrides: { federalTaxRate: 0.32 },
        status: 'draft',
        verdict: null,
      };

      const deal = rowToDeal(row);

      // Check camelCase conversion
      expect(deal.id).toBe('test-id-123');
      expect(deal.userId).toBe('user-456');
      expect(deal.createdAt).toBeInstanceOf(Date);
      expect(deal.updatedAt).toBeInstanceOf(Date);

      // Check property details
      expect(deal.marketTag).toBe('bay_area_appreciation');
      expect(deal.propertyType).toBe('sfh');
      expect(deal.yearBuilt).toBe(1990);

      // Check financial fields
      expect(deal.purchasePrice).toBe(800000);
      expect(deal.closingCostsPct).toBe(0.02);
      expect(deal.downPaymentPct).toBe(0.25);
      expect(deal.interestRate).toBe(0.065);
      expect(deal.loanTermYears).toBe(30);
      expect(deal.isARM).toBe(false);

      // Check income/expense fields
      expect(deal.monthlyRent).toBe(4000);
      expect(deal.vacancyPct).toBe(0.05);
      expect(deal.rentGrowthPct).toBe(0.03);
      expect(deal.propertyTaxAnnual).toBe(10000);
      expect(deal.insuranceAnnual).toBe(2000);
      expect(deal.hoaMonthly).toBe(300);
      expect(deal.managementPct).toBe(0.08);
      expect(deal.repairsPct).toBe(0.05);
      expect(deal.capexPct).toBe(0.05);

      // Check exit fields
      expect(deal.appreciationPct).toBe(0.03);
      expect(deal.sellingCostsPct).toBe(0.07);

      // Check constraints
      expect(deal.isRentControlled).toBe(false);
      expect(deal.hasHOARentalLimit).toBe(false);
      expect(deal.knownCapex).toBe('New roof needed in 5 years');

      // Check overrides and status
      expect(deal.assumptionOverrides).toEqual({ federalTaxRate: 0.32 });
      expect(deal.status).toBe('draft');
      expect(deal.verdict).toBeUndefined();
    });

    it('should handle null values with defaults', () => {
      const row: DealRow = {
        id: 'test-id',
        user_id: 'user-id',
        created_at: '2024-01-15T10:00:00Z',
        updated_at: '2024-01-15T10:00:00Z',
        address: '123 Main St',
        city: 'Denver',
        state: 'CO',
        zip: '80202',
        market_tag: null,
        property_type: null,
        beds: null,
        baths: null,
        sqft: null,
        year_built: null,
        purchase_price: 500000,
        closing_costs_pct: 0.02,
        down_payment_pct: 0.25,
        interest_rate: 0.06,
        loan_term_years: 30,
        is_arm: false,
        arm_adjust_year: null,
        arm_adjust_rate: null,
        monthly_rent: 2500,
        vacancy_pct: 0.05,
        rent_growth_pct: 0.03,
        property_tax_annual: null,
        insurance_annual: null,
        hoa_monthly: 0,
        management_pct: 0.08,
        repairs_pct: 0.05,
        capex_pct: 0.05,
        utilities_monthly: 0,
        appreciation_pct: 0.03,
        selling_costs_pct: 0.07,
        is_rent_controlled: false,
        has_hoa_rental_limit: false,
        known_capex: null,
        assumption_overrides: {},
        status: 'draft',
        verdict: null,
      };

      const deal = rowToDeal(row);

      // Check defaults for null values
      expect(deal.marketTag).toBe('cash_flow_market');
      expect(deal.propertyType).toBe('sfh');
      expect(deal.beds).toBe(0);
      expect(deal.baths).toBe(0);
      expect(deal.sqft).toBe(0);
      expect(deal.yearBuilt).toBe(0);
      expect(deal.propertyTaxAnnual).toBe(0);
      expect(deal.insuranceAnnual).toBe(0);
      expect(deal.knownCapex).toBe('');
    });
  });

  describe('dealToRow', () => {
    it('should convert Deal fields to snake_case row', () => {
      const deal: Partial<Deal> = {
        address: '456 Oak Ave',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        marketTag: 'cash_flow_market',
        propertyType: 'multi_2_4',
        purchasePrice: 600000,
        closingCostsPct: 0.025,
        downPaymentPct: 0.20,
        interestRate: 0.055,
        loanTermYears: 30,
        isARM: true,
        armAdjustYear: 5,
        armAdjustRate: 0.07,
        monthlyRent: 5000,
        vacancyPct: 0.08,
        rentGrowthPct: 0.025,
        isRentControlled: true,
        hasHOARentalLimit: true,
      };

      const row = dealToRow(deal, 'user-123');

      expect(row.user_id).toBe('user-123');
      expect(row.address).toBe('456 Oak Ave');
      expect(row.market_tag).toBe('cash_flow_market');
      expect(row.property_type).toBe('multi_2_4');
      expect(row.purchase_price).toBe(600000);
      expect(row.closing_costs_pct).toBe(0.025);
      expect(row.down_payment_pct).toBe(0.20);
      expect(row.interest_rate).toBe(0.055);
      expect(row.loan_term_years).toBe(30);
      expect(row.is_arm).toBe(true);
      expect(row.arm_adjust_year).toBe(5);
      expect(row.arm_adjust_rate).toBe(0.07);
      expect(row.monthly_rent).toBe(5000);
      expect(row.vacancy_pct).toBe(0.08);
      expect(row.rent_growth_pct).toBe(0.025);
      expect(row.is_rent_controlled).toBe(true);
      expect(row.has_hoa_rental_limit).toBe(true);
    });

    it('should only include defined fields', () => {
      const deal: Partial<Deal> = {
        address: '789 Pine Rd',
        purchasePrice: 400000,
        monthlyRent: 2000,
      };

      const row = dealToRow(deal);

      expect(row.address).toBe('789 Pine Rd');
      expect(row.purchase_price).toBe(400000);
      expect(row.monthly_rent).toBe(2000);
      expect(row.user_id).toBeUndefined();
      expect(row.city).toBeUndefined();
      expect(row.down_payment_pct).toBeUndefined();
    });
  });

  describe('DatabaseError', () => {
    it('should create error with message', () => {
      const error = new DatabaseError('Something went wrong');

      expect(error.message).toBe('Something went wrong');
      expect(error.name).toBe('DatabaseError');
      expect(error.code).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it('should create error with code and details', () => {
      const error = new DatabaseError(
        'Constraint violation',
        'UNIQUE_VIOLATION',
        'duplicate key value violates unique constraint'
      );

      expect(error.message).toBe('Constraint violation');
      expect(error.code).toBe('UNIQUE_VIOLATION');
      expect(error.details).toBe('duplicate key value violates unique constraint');
    });

    it('should be instanceof Error', () => {
      const error = new DatabaseError('Test error');

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DatabaseError);
    });
  });
});
