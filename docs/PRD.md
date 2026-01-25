# Real Estate Investment Copilot - PRD
Version 1.1 | Updated with technical specifications

## 1. Product Summary

### One Line
Decision-ready underwriting for residential rentals with financing and tax effects across 5/7/10-year horizons, plus sensitivity, risks, and diligence guidance.

### Primary User
Finance-savvy operator investor who wants fast, consistent, defensible Buy/Pass/Watch decisions across multiple properties, with repeatable modeling and clear next steps.

### Core Promise
Given a property and assumptions, produce an investment memo with:
1. After-tax cash flows year by year
2. Exit proceeds net of selling costs and taxes
3. IRR and equity multiple for 5/7/10-year horizons
4. Sensitivity to rent, appreciation, vacancy
5. Risks, data gaps, and diligence questions

---

## 2. V1 Scope

### In Scope
1. Long-term rentals (no STR unless explicitly enabled)
2. Full financing model: amortization, equity build
3. Tax effects: depreciation, capital gains at exit (simplified but transparent)
4. Selling costs and buyer closing costs
5. Baseline comparison to low-fee REIT fund
6. Portfolio strategy: 1-2 cash flow properties + 1 Bay Area appreciation property
7. Exportable memo: Markdown and PDF

### Out of Scope for V1
1. Short-term rental modeling
2. Legal advice (user must consult professionals)
3. Full passive activity loss optimization
4. Market data API integrations (user provides inputs)
5. Mobile app

---

## 3. Default Assumptions

Use unless user overrides:

| Assumption | Default | Notes |
|------------|---------|-------|
| Federal marginal tax rate | 30% | User can override |
| State marginal tax rate | 9% | California default |
| Combined marginal rate | 39% | For operating income |
| REIT baseline return | 6% | VNQ long-term average |
| Mortgage rate | 6.0% | 10-year ARM |
| Loan term | 30 years | Standard amortization |
| Down payment | 25% | Investor loan typical |
| Buyer closing costs | 2% | Of purchase price |
| Selling costs - Agent | 5% | Of sale price |
| Selling costs - Transfer tax | 1% | Varies by county |
| Selling costs - Closing | 1% | Of sale price |
| Vacancy rate | 5% | Annual |
| Property management | 8% | Of gross rent |
| Repairs/maintenance | 5% | Of gross rent |
| CapEx reserve | 5% | Of gross rent |
| Rent growth | 3% | Annual |
| Appreciation | 3% | Annual (varies by market tag) |
| Depreciation period | 27.5 years | Residential standard |
| Land value | 20% | Of purchase price (not depreciable) |

---

## 4. Output Contract

Every memo MUST include these sections in this order:

### Section 1: Quick Verdict
- **Decision**: Buy | Pass | Watch
- **Primary Driver**: Single most important factor
- **Confidence**: High | Medium | Low (based on data gaps)

### Section 2: Key Assumptions
- List all assumptions used (defaults + overrides)
- Flag any unusual values

### Section 3: Investment Returns (5/7/10 Year)

| Metric | Year 5 | Year 7 | Year 10 |
|--------|--------|--------|---------|
| Initial Equity | $ | $ | $ |
| Cumulative After-Tax Cash Flow | $ | $ | $ |
| Remaining Loan Balance | $ | $ | $ |
| Gross Sale Price | $ | $ | $ |
| Net Sale Proceeds (after costs/taxes) | $ | $ | $ |
| Total Return | $ | $ | $ |
| IRR | % | % | % |
| Equity Multiple | x | x | x |
| vs. REIT Baseline | +/-% | +/-% | +/-% |

### Section 4: Sensitivity Analysis

Show IRR impact for:
- Rent: -10%, -5%, Base, +5%, +10%
- Appreciation: -2%, -1%, Base, +1%, +2%
- Vacancy: +5%, +3%, Base, -2%, -3%

### Section 5: Risk Notes
- HOA/special assessments
- Insurance constraints
- Rent control exposure
- Tenant demand factors
- Major CapEx risk
- Permitting/regulatory
- Neighborhood trends

### Section 6: Data Gaps
- What's unknown
- Impact if wrong (quantified where possible)
- Suggested defaults used

### Section 7: Next Steps
- What to verify before proceeding
- What would change the decision
- Top 3 diligence questions

---

## 5. User Flows

### Flow 1: Single Deal Analysis
1. User clicks "New Deal"
2. Enters property basics (address, beds/baths, sqft, year built)
3. Enters financials (price, rent, expenses)
4. Reviews/adjusts assumptions
5. Clicks "Generate Memo"
6. Views memo with all sections
7. Exports to PDF or Markdown

### Flow 2: Portfolio Compare
1. User has 2+ saved deals
2. Clicks "Compare Deals"
3. Selects deals to compare
4. Views side-by-side: IRR, cash flow, equity multiple
5. Tags deals as "Cash Flow" or "Appreciation"

### Flow 3: Assumption Profile
1. User creates "Bay Area Defaults" profile
2. Sets appreciation 5%, state tax 13%, etc.
3. Applies profile to new deals automatically

---

## 6. Data Model

### Deal (Property Input)
```typescript
interface Deal {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Property
  address: string;
  city: string;
  state: string;
  zip: string;
  marketTag: 'bay_area_appreciation' | 'cash_flow_market';
  propertyType: 'sfh' | 'condo' | 'townhouse' | 'multi_2_4';
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  
  // Purchase
  purchasePrice: number;
  closingCostsPct: number;
  
  // Financing
  downPaymentPct: number;
  interestRate: number;
  loanTermYears: number;
  isARM: boolean;
  armAdjustYear?: number;
  armAdjustRate?: number;
  
  // Income
  monthlyRent: number;
  vacancyPct: number;
  rentGrowthPct: number;
  
  // Expenses (monthly or annual, stored as annual)
  propertyTaxAnnual: number;
  insuranceAnnual: number;
  hoaMonthly: number;
  managementPct: number;
  repairsPct: number;
  capexPct: number;
  utilitiesMonthly: number;
  
  // Exit
  appreciationPct: number;
  sellingCostsPct: number;
  
  // Constraints
  isRentControlled: boolean;
  hasHOARentalLimit: boolean;
  knownCapex: string; // Description of known issues
  
  // Overrides
  assumptionOverrides: Partial<GlobalAssumptions>;
}
```

### Global Assumptions (Config)
```typescript
interface GlobalAssumptions {
  federalTaxRate: number;
  stateTaxRate: number;
  reitBaselineReturn: number;
  depreciationYears: number;
  landValuePct: number;
  capitalGainsRate: number;
  deprecationRecaptureRate: number;
}
```

### Model Output
```typescript
interface ModelOutput {
  deal: Deal;
  assumptions: GlobalAssumptions;
  
  resultsByYear: YearResult[];
  resultsByHorizon: {
    year5: HorizonResult;
    year7: HorizonResult;
    year10: HorizonResult;
  };
  sensitivityRuns: SensitivityResult[];
  dataGaps: DataGap[];
  
  computedAt: Date;
}

interface YearResult {
  year: number;
  grossRent: number;
  vacancy: number;
  effectiveGrossIncome: number;
  operatingExpenses: number;
  noi: number;
  debtService: number;
  cashFlowBeforeTax: number;
  depreciation: number;
  interestPaid: number;
  taxableIncome: number;
  incomeTax: number;
  cashFlowAfterTax: number;
  loanBalance: number;
  propertyValue: number;
  equity: number;
}

interface HorizonResult {
  years: number;
  initialEquity: number;
  cumulativeCashFlow: number;
  remainingLoanBalance: number;
  grossSalePrice: number;
  sellingCosts: number;
  capitalGainsTax: number;
  depreciationRecapture: number;
  netSaleProceeds: number;
  totalReturn: number;
  irr: number;
  equityMultiple: number;
  reitComparison: number;
}

interface SensitivityResult {
  variable: 'rent' | 'appreciation' | 'vacancy';
  delta: number; // e.g., -0.10 for -10%
  irr5: number;
  irr7: number;
  irr10: number;
}

interface DataGap {
  field: string;
  impact: 'high' | 'medium' | 'low';
  defaultUsed: any;
  recommendation: string;
}
```

---

## 7. API Routes

### POST /api/deals
Create a new deal
- Body: `Deal` (without id, timestamps)
- Returns: `Deal` with id

### GET /api/deals
List user's deals
- Returns: `Deal[]`

### GET /api/deals/[id]
Get single deal
- Returns: `Deal`

### PUT /api/deals/[id]
Update deal
- Body: Partial `Deal`
- Returns: `Deal`

### DELETE /api/deals/[id]
Delete deal
- Returns: `{ success: true }`

### POST /api/analyze
Run model and generate memo
- Body: `{ dealId: string }` or `{ deal: Deal }`
- Returns: `ModelOutput`

### POST /api/memo/generate
Generate AI narrative from model output
- Body: `{ modelOutput: ModelOutput }`
- Returns: `{ memo: MemoContent }`

### POST /api/export/pdf
Export memo to PDF
- Body: `{ dealId: string }`
- Returns: PDF file

### POST /api/export/markdown
Export memo to Markdown
- Body: `{ dealId: string }`
- Returns: Markdown text

---

## 8. Non-Functional Requirements

1. **Deterministic Model**: AI writes narrative from computed outputs, never generates numbers
2. **Assumption Traceability**: Every number traces to input or default
3. **Reproducibility**: Same inputs = same results
4. **Performance**: Memo generation < 5 seconds
5. **Mobile Responsive**: Web app works on tablet/phone

---

## 9. Success Metrics

| Metric | Target |
|--------|--------|
| Time to first memo | < 5 minutes |
| Calculation accuracy | Within 0.01% of Excel |
| User retention | 10+ deals/month |
| NPS | > 40 |

---

## 10. Pricing Model (V1)

### Option A: Per-Memo
- Free: 3 memos total
- $29/memo after that

### Option B: Subscription
- $79/month unlimited memos
- $599/year (save 37%)

### Option C: Freemium
- Free: Basic analysis (5-year only, no sensitivity)
- Pro: Full analysis, all horizons, PDF export

---

## 11. Future Considerations (V2+)

1. Market data pulls (rent comps, insurance ranges)
2. County-specific tax/transfer fee automation
3. Portfolio-level risk aggregation
4. STR modeling toggle
5. 1031 exchange scenario planning
6. Mobile app
