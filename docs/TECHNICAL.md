# Technical Specification
RE Investment Copilot - Financial Model

## 1. Calculation Formulas

### 1.1 Initial Investment

```
initialEquity = purchasePrice * downPaymentPct + closingCosts
closingCosts = purchasePrice * closingCostsPct
loanAmount = purchasePrice - (purchasePrice * downPaymentPct)
```

### 1.2 Monthly Mortgage Payment

Standard amortization formula:
```
monthlyRate = annualRate / 12
numPayments = loanTermYears * 12
monthlyPayment = loanAmount * (monthlyRate * (1 + monthlyRate)^numPayments) / ((1 + monthlyRate)^numPayments - 1)
```

### 1.3 Amortization Schedule

For each month:
```
interestPayment = remainingBalance * monthlyRate
principalPayment = monthlyPayment - interestPayment
remainingBalance = remainingBalance - principalPayment
```

### 1.4 Annual Cash Flow (Year N)

```
// Income
grossRent = monthlyRent * 12 * (1 + rentGrowthPct)^(N-1)
vacancyLoss = grossRent * vacancyPct
effectiveGrossIncome = grossRent - vacancyLoss

// Operating Expenses
propertyTax = propertyTaxAnnual * (1 + 0.02)^(N-1)  // Assume 2% annual increase
insurance = insuranceAnnual * (1 + 0.03)^(N-1)      // Assume 3% annual increase
hoa = hoaMonthly * 12 * (1 + 0.03)^(N-1)
management = effectiveGrossIncome * managementPct
repairs = effectiveGrossIncome * repairsPct
capex = effectiveGrossIncome * capexPct
utilities = utilitiesMonthly * 12

totalOpEx = propertyTax + insurance + hoa + management + repairs + capex + utilities

// NOI and Cash Flow
noi = effectiveGrossIncome - totalOpEx
annualDebtService = monthlyPayment * 12
cashFlowBeforeTax = noi - annualDebtService
```

### 1.5 Tax Calculations

```
// Depreciation (straight-line, residential)
buildingValue = purchasePrice * (1 - landValuePct)
annualDepreciation = buildingValue / depreciationYears  // 27.5 years

// Annual interest (sum from amortization schedule for that year)
annualInterest = sum(interestPayments for months in year N)

// Taxable Income
taxableIncome = noi - annualDepreciation - annualInterest

// Income Tax (can be negative = tax benefit)
incomeTax = taxableIncome * combinedTaxRate
combinedTaxRate = federalTaxRate + stateTaxRate

// After-Tax Cash Flow
cashFlowAfterTax = cashFlowBeforeTax - incomeTax
```

### 1.6 Property Value at Exit

```
propertyValueAtExit = purchasePrice * (1 + appreciationPct)^years
```

### 1.7 Sale Proceeds

```
// Selling Costs
grossSalePrice = propertyValueAtExit
totalSellingCosts = grossSalePrice * sellingCostsPct  // Agent + transfer + closing

// Capital Gains
totalDepreciation = annualDepreciation * yearsHeld
adjustedBasis = purchasePrice - totalDepreciation + capitalImprovements
capitalGain = grossSalePrice - adjustedBasis

// Taxes at Sale
ordinaryGain = min(capitalGain, totalDepreciation)  // Depreciation recapture
longTermGain = max(0, capitalGain - ordinaryGain)

depreciationRecaptureTax = ordinaryGain * deprecationRecaptureRate  // 25% federal
capitalGainsTax = longTermGain * capitalGainsRate  // 15-20% federal + state
totalTaxAtSale = depreciationRecaptureTax + capitalGainsTax

// Net Proceeds
remainingLoanBalance = (from amortization schedule at exit year)
netSaleProceeds = grossSalePrice - totalSellingCosts - totalTaxAtSale - remainingLoanBalance
```

### 1.8 IRR Calculation

Internal Rate of Return using Newton-Raphson method:
```
Cash flows:
  Year 0: -initialEquity
  Year 1 to N-1: cashFlowAfterTax[year]
  Year N: cashFlowAfterTax[N] + netSaleProceeds

IRR is the rate r where:
  NPV = sum(cashFlow[t] / (1 + r)^t) = 0

Implementation: Use iterative solver (Newton-Raphson) with initial guess of 10%
Tolerance: 0.0001 (0.01%)
Max iterations: 100
```

### 1.9 Equity Multiple

```
equityMultiple = totalReturn / initialEquity
totalReturn = cumulativeCashFlows + netSaleProceeds
```

### 1.10 REIT Comparison

```
reitFutureValue = initialEquity * (1 + reitBaselineReturn)^years
excessReturn = totalReturn - reitFutureValue
excessReturnPct = (totalReturn / reitFutureValue - 1) * 100
```

---

## 2. Sensitivity Analysis

Run model with modified inputs:

### Rent Sensitivity
```
rentDeltas = [-0.10, -0.05, 0, +0.05, +0.10]
for each delta:
  modifiedRent = monthlyRent * (1 + delta)
  run model
  record IRR at 5/7/10 years
```

### Appreciation Sensitivity
```
appreciationDeltas = [-0.02, -0.01, 0, +0.01, +0.02]
for each delta:
  modifiedAppreciation = appreciationPct + delta
  run model
  record IRR at 5/7/10 years
```

### Vacancy Sensitivity
```
vacancyDeltas = [+0.05, +0.03, 0, -0.02, -0.03]  // Note: positive = worse
for each delta:
  modifiedVacancy = vacancyPct + delta
  run model
  record IRR at 5/7/10 years
```

---

## 3. Database Schema (Supabase)

### Tables

```sql
-- Users (managed by Supabase Auth)

-- Deals
create table deals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Property
  address text not null,
  city text not null,
  state text not null,
  zip text not null,
  market_tag text check (market_tag in ('bay_area_appreciation', 'cash_flow_market')),
  property_type text check (property_type in ('sfh', 'condo', 'townhouse', 'multi_2_4')),
  beds integer,
  baths numeric(3,1),
  sqft integer,
  year_built integer,
  
  -- Purchase
  purchase_price numeric(12,2) not null,
  closing_costs_pct numeric(5,4) default 0.02,
  
  -- Financing
  down_payment_pct numeric(5,4) default 0.25,
  interest_rate numeric(6,5) default 0.06,
  loan_term_years integer default 30,
  is_arm boolean default false,
  arm_adjust_year integer,
  arm_adjust_rate numeric(6,5),
  
  -- Income
  monthly_rent numeric(10,2) not null,
  vacancy_pct numeric(5,4) default 0.05,
  rent_growth_pct numeric(5,4) default 0.03,
  
  -- Expenses
  property_tax_annual numeric(10,2),
  insurance_annual numeric(10,2),
  hoa_monthly numeric(10,2) default 0,
  management_pct numeric(5,4) default 0.08,
  repairs_pct numeric(5,4) default 0.05,
  capex_pct numeric(5,4) default 0.05,
  utilities_monthly numeric(10,2) default 0,
  
  -- Exit
  appreciation_pct numeric(5,4) default 0.03,
  selling_costs_pct numeric(5,4) default 0.07,
  
  -- Constraints
  is_rent_controlled boolean default false,
  has_hoa_rental_limit boolean default false,
  known_capex text,
  
  -- Overrides (JSON)
  assumption_overrides jsonb default '{}',
  
  -- Status
  status text default 'draft' check (status in ('draft', 'analyzed', 'archived')),
  verdict text check (verdict in ('buy', 'pass', 'watch'))
);

-- Memos (generated analysis)
create table memos (
  id uuid primary key default gen_random_uuid(),
  deal_id uuid references deals(id) on delete cascade,
  created_at timestamptz default now(),
  
  -- Computed results (JSON)
  model_output jsonb not null,
  
  -- AI narrative (JSON with sections)
  narrative jsonb,
  
  -- Metadata
  assumptions_snapshot jsonb not null,
  version integer default 1
);

-- Assumption Profiles
create table assumption_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  assumptions jsonb not null,
  is_default boolean default false,
  created_at timestamptz default now()
);

-- Indexes
create index deals_user_id_idx on deals(user_id);
create index deals_status_idx on deals(status);
create index memos_deal_id_idx on memos(deal_id);
create index assumption_profiles_user_id_idx on assumption_profiles(user_id);

-- RLS Policies
alter table deals enable row level security;
alter table memos enable row level security;
alter table assumption_profiles enable row level security;

create policy "Users can CRUD own deals"
  on deals for all
  using (auth.uid() = user_id);

create policy "Users can CRUD own memos"
  on memos for all
  using (deal_id in (select id from deals where user_id = auth.uid()));

create policy "Users can CRUD own profiles"
  on assumption_profiles for all
  using (auth.uid() = user_id);
```

---

## 4. AI Prompt Template

Used to generate narrative from model output:

```typescript
const MEMO_SYSTEM_PROMPT = `You are a real estate investment analyst. Generate a professional investment memo from the computed model outputs provided. 

CRITICAL RULES:
1. NEVER invent or calculate numbers - use ONLY the numbers from the model output
2. Explain what the numbers mean, don't recalculate them
3. Be crisp and decision-oriented
4. Use bullets and short paragraphs
5. Highlight the single biggest driver of the investment decision

You must produce these sections in order:
1. Quick Verdict (Buy/Pass/Watch + primary driver)
2. Key Assumptions Used
3. 5/7/10-Year Results Summary
4. Sensitivity Analysis Interpretation
5. Risk Notes
6. Data Gaps
7. Next Steps + Top 3 Diligence Questions`;

const MEMO_USER_PROMPT = (modelOutput: ModelOutput) => `
Generate an investment memo for this property:

ADDRESS: ${modelOutput.deal.address}, ${modelOutput.deal.city}, ${modelOutput.deal.state}
MARKET TAG: ${modelOutput.deal.marketTag}
PURCHASE PRICE: $${modelOutput.deal.purchasePrice.toLocaleString()}

COMPUTED RESULTS (use these numbers exactly):

5-Year Horizon:
- Initial Equity: $${modelOutput.resultsByHorizon.year5.initialEquity.toLocaleString()}
- IRR: ${(modelOutput.resultsByHorizon.year5.irr * 100).toFixed(2)}%
- Equity Multiple: ${modelOutput.resultsByHorizon.year5.equityMultiple.toFixed(2)}x
- vs REIT: ${modelOutput.resultsByHorizon.year5.reitComparison > 0 ? '+' : ''}${(modelOutput.resultsByHorizon.year5.reitComparison * 100).toFixed(1)}%

7-Year Horizon:
- IRR: ${(modelOutput.resultsByHorizon.year7.irr * 100).toFixed(2)}%
- Equity Multiple: ${modelOutput.resultsByHorizon.year7.equityMultiple.toFixed(2)}x

10-Year Horizon:
- IRR: ${(modelOutput.resultsByHorizon.year10.irr * 100).toFixed(2)}%
- Equity Multiple: ${modelOutput.resultsByHorizon.year10.equityMultiple.toFixed(2)}x

SENSITIVITY (IRR at 7-year horizon):
${modelOutput.sensitivityRuns.map(s => 
  `${s.variable} ${s.delta > 0 ? '+' : ''}${(s.delta * 100).toFixed(0)}%: ${(s.irr7 * 100).toFixed(2)}%`
).join('\n')}

DATA GAPS:
${modelOutput.dataGaps.map(g => `- ${g.field}: ${g.impact} impact, used default ${g.defaultUsed}`).join('\n')}

CONSTRAINTS:
- Rent Controlled: ${modelOutput.deal.isRentControlled ? 'Yes' : 'No'}
- HOA Rental Limit: ${modelOutput.deal.hasHOARentalLimit ? 'Yes' : 'No'}
- Known CapEx: ${modelOutput.deal.knownCapex || 'None noted'}

Generate the memo now.`;
```

---

## 5. Testing Requirements

### Unit Tests (Critical)

```typescript
// tests/model/irr.test.ts
describe('IRR Calculation', () => {
  it('should match Excel XIRR within 0.01%', () => {
    const cashFlows = [-100000, 5000, 5200, 5400, 5600, 105800];
    const result = calculateIRR(cashFlows);
    expect(result).toBeCloseTo(0.0762, 4); // 7.62%
  });
  
  it('should handle negative IRR', () => {
    const cashFlows = [-100000, 2000, 2000, 2000, 2000, 80000];
    const result = calculateIRR(cashFlows);
    expect(result).toBeLessThan(0);
  });
});

// tests/model/amortization.test.ts
describe('Amortization', () => {
  it('should calculate correct monthly payment', () => {
    const payment = calculateMonthlyPayment(300000, 0.06, 30);
    expect(payment).toBeCloseTo(1798.65, 2);
  });
  
  it('should sum to original loan amount', () => {
    const schedule = generateAmortizationSchedule(300000, 0.06, 30);
    const totalPrincipal = schedule.reduce((sum, m) => sum + m.principal, 0);
    expect(totalPrincipal).toBeCloseTo(300000, 0);
  });
});

// tests/model/taxes.test.ts
describe('Tax Calculations', () => {
  it('should calculate depreciation correctly', () => {
    const dep = calculateAnnualDepreciation(400000, 0.20, 27.5);
    expect(dep).toBeCloseTo(11636.36, 2); // (400000 * 0.80) / 27.5
  });
  
  it('should calculate capital gains tax at exit', () => {
    const result = calculateExitTaxes({
      purchasePrice: 400000,
      salePrice: 500000,
      totalDepreciation: 58182,
      capitalGainsRate: 0.15,
      recaptureRate: 0.25
    });
    expect(result.recaptureTax).toBeCloseTo(14545.50, 2);
    expect(result.capitalGainsTax).toBeCloseTo(6272.70, 2);
  });
});
```

---

## 6. Error Handling

### Input Validation
```typescript
const dealSchema = z.object({
  purchasePrice: z.number().min(10000).max(100000000),
  monthlyRent: z.number().min(100).max(1000000),
  downPaymentPct: z.number().min(0).max(1),
  interestRate: z.number().min(0).max(0.30),
  vacancyPct: z.number().min(0).max(0.50),
  // ... etc
});

// Flag unusual values (warnings, not errors)
const warnings: string[] = [];
if (monthlyRent / purchasePrice > 0.015) {
  warnings.push('Rent yield >18% annually - verify rent is accurate');
}
if (appreciationPct > 0.08) {
  warnings.push('Appreciation >8%/year is historically unusual');
}
```

### Calculation Guards
```typescript
// Prevent division by zero
const calculateIRR = (cashFlows: number[]): number => {
  if (cashFlows.length < 2) throw new Error('Need at least 2 cash flows');
  if (cashFlows[0] >= 0) throw new Error('Initial investment must be negative');
  // ... calculation
};
```
