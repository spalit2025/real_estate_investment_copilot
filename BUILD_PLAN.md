# Build Plan: RE Investment Copilot

**Status**: Phase 9 Complete
**Last Updated**: 2026-01-24
**Target**: Production-ready investment memo generator

---

## Project Summary

A Next.js application that generates professional investment memos for residential rental properties with IRR calculations, tax effects, sensitivity analysis, and AI-generated narratives.

**Core Principle**: Financial model is pure deterministic TypeScript. AI generates narrative FROM computed outputs only.

---

## Phase 1: Project Foundation

**Status**: [x] Complete

### Tasks

- [x] **1.1** Initialize Next.js project with TypeScript, Tailwind, App Router
  ```bash
  npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
  ```

- [x] **1.2** Install core dependencies
  - [x] `@supabase/supabase-js @supabase/auth-helpers-nextjs`
  - [x] `@anthropic-ai/sdk`
  - [x] `zod react-hook-form @hookform/resolvers`
  - [x] `lucide-react`
  - [x] `@react-pdf/renderer`
  - [x] `vitest @testing-library/react @testing-library/jest-dom` (testing)

- [x] **1.3** Set up shadcn/ui
  - [x] Run `npx shadcn@latest init`
  - [x] Add components: button, card, input, label, table, tabs, form, select, dialog, alert

- [x] **1.4** Create directory structure
  ```
  src/
  ├── app/
  │   ├── (auth)/login/, signup/
  │   ├── (dashboard)/deals/, compare/
  │   └── api/deals/, analyze/, memo/, export/
  ├── components/ui/, forms/, memo/
  ├── lib/model/, ai/, db/, utils/
  ├── types/
  └── config/
  ```

- [x] **1.5** Create TypeScript interfaces in `src/types/`
  - [x] `deal.ts` - Deal interface (30+ fields)
  - [x] `model.ts` - ModelOutput, YearResult, HorizonResult, SensitivityResult, DataGap
  - [x] `memo.ts` - MemoContent, MemoSection
  - [x] `index.ts` - Re-exports

- [x] **1.6** Create `src/config/defaults.ts` with global assumptions
  - Federal tax: 30%, State tax: 9%
  - REIT baseline: 6%
  - Down payment: 25%, Interest: 6%, Term: 30yr
  - Vacancy: 5%, Management: 8%, Repairs: 5%, CapEx: 5%
  - Rent growth: 3%, Appreciation: 3%
  - Depreciation: 27.5 years
  - Selling costs: 7%
  - Helper functions: getCombinedTaxRate, getEffectiveAssumptions

---

## Phase 2: Financial Model Engine (CRITICAL)

**Status**: [x] Complete
**Priority**: Highest - This is the foundation. All calculations must be deterministic and testable.

### Tasks

- [x] **2.1** Create `src/lib/model/amortization.ts`
  - [x] `calculateMonthlyPayment(principal, rate, years)` - standard amortization formula
  - [x] `generateAmortizationSchedule(loanAmount, rate, termYears)` - monthly breakdown
  - [x] `getLoanBalanceAtYear(schedule, year)` - remaining balance lookup
  - [x] `getInterestForYear(schedule, year)` - annual interest
  - [x] `getPrincipalForYear(schedule, year)` - annual principal
  - [x] Unit tests: $300K @ 6% / 30yr = $1,798.65/month ✓

- [x] **2.2** Create `src/lib/model/irr.ts`
  - [x] `calculateIRR(cashFlows)` - Newton-Raphson implementation with bisection fallback
  - [x] Tolerance: 0.0001 (0.01%), Max iterations: 100
  - [x] `calculateNPV(cashFlows, rate)` - helper function
  - [x] `calculateEquityMultiple(cashFlows)` - total return / investment
  - [x] `calculateREITComparison(...)` - excess return vs REIT baseline
  - [x] Unit tests pass ✓

- [x] **2.3** Create `src/lib/model/cashflow.ts`
  - [x] `calculateAnnualIncome(deal, year)` - grossRent, vacancy, effectiveGrossIncome
  - [x] `calculateOperatingExpenses(deal, egi, year)` - taxes, insurance, HOA, management, repairs, CapEx
  - [x] `calculateNOI(income, expenses)` - net operating income
  - [x] `calculateCashFlowBeforeTax(noi, debtService)` - pre-tax cash flow
  - [x] Additional helpers: initialEquity, loanAmount, propertyValue, equity, capRate, CoC, GRM
  - [x] Unit tests with known values ✓

- [x] **2.4** Create `src/lib/model/taxes.ts`
  - [x] `calculateAnnualDepreciation(purchasePrice, landValuePct, depreciationYears)` - 27.5yr straight-line
  - [x] `calculateTaxableIncome(noi, depreciation, interest)` - annual taxable income
  - [x] `calculateIncomeTax(taxableIncome, combinedRate)` - annual tax (can be negative)
  - [x] `calculateExitTaxes(params)` - recapture + capital gains + state
  - [x] `calculateCashFlowAfterTax(cfbt, tax)` - after-tax cash flow
  - [x] Unit tests: depreciation = (400K * 0.80) / 27.5 = $11,636.36 ✓

- [x] **2.5** Create `src/lib/model/sensitivity.ts`
  - [x] `runSensitivityAnalysis(deal, assumptions, modelRunner)` - run model with modified inputs
  - [x] Rent deltas: [-10%, -5%, 0, +5%, +10%]
  - [x] Appreciation deltas: [-2%, -1%, 0, +1%, +2%]
  - [x] Vacancy deltas: [+5%, +3%, 0, -2%, -3%]
  - [x] Helper functions: formatSensitivityDelta, getBaseCase, findWorstCase, findBestCase
  - [x] Returns SensitivityResult[] with IRR at 5/7/10 years ✓

- [x] **2.6** Create `src/lib/model/index.ts`
  - [x] `runModel(deal, assumptions)` → ModelOutput
  - [x] Orchestrates all calculations
  - [x] Generates year-by-year results (1-10)
  - [x] Computes horizon summaries (5, 7, 10 years)
  - [x] Identifies data gaps
  - [x] `determineVerdict(horizonResult, gaps)` - BUY/PASS/WATCH logic
  - [x] Integration tests for full model run ✓

**Test Results**: 130 tests passing

---

## Phase 3: Database Layer

**Status**: [x] Complete

### Tasks

- [x] **3.1** Set up Supabase project
  - [x] Create `.env.local.example` with required environment variables
  - [x] Copy project URL and anon key to `.env.local` (user action)

- [x] **3.2** Create database schema (`src/lib/db/schema.sql`)
  - [x] Create `deals` table with all columns
  - [x] Create `memos` table
  - [x] Create `assumption_profiles` table
  - [x] Create indexes
  - [x] Enable RLS and create policies
  - [x] Add auto-update trigger for updated_at

- [x] **3.3** Create `src/lib/db/client.ts`
  - [x] Supabase client initialization with auth-helpers-nextjs
  - [x] Server and client variants (createServerClient, createBrowserClient)
  - [x] Admin client for bypassing RLS (createAdminClient)

- [x] **3.4** Create `src/lib/db/deals.ts`
  - [x] `createDeal(deal)` - insert new deal
  - [x] `getDeal(id)` - get single deal
  - [x] `getDeals(userId, options)` - list user's deals with filtering/pagination
  - [x] `updateDeal(id, updates)` - partial update
  - [x] `deleteDeal(id, hardDelete)` - soft delete (archive) or hard delete
  - [x] `updateDealStatus(id, status)` - status update helper
  - [x] `updateDealVerdict(id, verdict)` - verdict update helper
  - [x] `dealExists(id)` - check existence
  - [x] `getDealsCounts(userId)` - counts by status for dashboard

- [x] **3.5** Create `src/lib/db/memos.ts`
  - [x] `saveMemo(dealId, modelOutput, assumptionsSnapshot, narrative)` - save/update memo
  - [x] `getMemoByDealId(dealId)` - get latest memo for deal
  - [x] `getMemo(memoId)` - get memo by ID
  - [x] `getMemoHistory(dealId)` - get all versions
  - [x] `updateMemo(memoId, updates)` - update memo
  - [x] `updateMemoNarrative(memoId, narrative)` - update narrative only
  - [x] `deleteMemo(memoId)` - delete memo
  - [x] `deleteMemosByDealId(dealId)` - delete all memos for deal

- [x] **3.6** Create supporting files
  - [x] `src/lib/db/types.ts` - Database row types (snake_case)
  - [x] `src/lib/db/utils.ts` - Case conversion utilities (dealToRow, rowToDeal)
  - [x] `src/lib/db/index.ts` - Re-exports
  - [x] `src/test/db/utils.test.ts` - Unit tests for utilities

**Test Results**: 137 tests passing (130 model + 7 db utilities)

---

## Phase 4: Authentication

**Status**: [x] Complete

### Tasks

- [x] **4.1** Configure Supabase Auth
  - [x] Enable email/password auth (user action in Supabase dashboard)
  - [x] Configure redirect URLs (user action)

- [x] **4.2** Create `src/app/(auth)/login/page.tsx`
  - [x] Login form with email/password
  - [x] Error handling
  - [x] Redirect to dashboard on success
  - [x] Link to signup page

- [x] **4.3** Create `src/app/(auth)/signup/page.tsx`
  - [x] Signup form with password confirmation
  - [x] Password validation (min 8 chars)
  - [x] Email confirmation flow with success message

- [x] **4.4** Create auth middleware (`src/middleware.ts`)
  - [x] Protect dashboard routes (/deals, /compare, /settings)
  - [x] Redirect unauthenticated users to login
  - [x] Redirect authenticated users from auth pages to dashboard

- [x] **4.5** Create `src/lib/auth/session.ts`
  - [x] `getCurrentUser()` - get authenticated user
  - [x] `getCurrentUserId()` - get user ID
  - [x] `isAuthenticated()` - check auth status
  - [x] `getSession()` - get full session
  - [x] `requireAuth()` - require auth or throw

- [x] **4.6** Create supporting files
  - [x] `src/app/(auth)/layout.tsx` - minimal auth layout
  - [x] `src/app/auth/callback/route.ts` - email confirmation handler
  - [x] `src/app/(dashboard)/layout.tsx` - dashboard layout with nav
  - [x] `src/app/(dashboard)/deals/page.tsx` - placeholder deals page
  - [x] `src/components/dashboard/DashboardNav.tsx` - navigation with sign out

---

## Phase 5: Deal Input Form

**Status**: [x] Complete

### Tasks

- [x] **5.1** Create `src/components/forms/DealForm.tsx`
  - [x] react-hook-form integration
  - [x] zod validation schema (`src/lib/validations/deal.ts`)
  - [x] Section grouping: Property, Purchase, Financing, Income, Expenses, Exit, Constraints
  - [x] Validation warnings for unusual values (rent yield >18%, appreciation >8%)

- [x] **5.2** Create `src/app/(dashboard)/deals/new/page.tsx`
  - [x] New deal creation page
  - [x] Form submission → API → redirect to deal view

- [x] **5.3** Create `src/app/(dashboard)/deals/[id]/page.tsx`
  - [x] View existing deal with summary cards
  - [x] Edit mode toggle
  - [x] "Analyze" button (links to Phase 6)
  - [x] Archive functionality

- [x] **5.4** Create `src/app/(dashboard)/deals/page.tsx`
  - [x] List all user's deals
  - [x] Status badges (draft, analyzed, archived)
  - [x] Verdict badges (buy, pass, watch)
  - [x] Quick actions (view, analyze, archive)
  - [x] Gross yield calculation display

- [x] **5.5** Create deal API routes
  - [x] `POST /api/deals` - create with validation
  - [x] `GET /api/deals` - list with filtering/pagination
  - [x] `GET /api/deals/[id]` - get one with ownership check
  - [x] `PUT /api/deals/[id]` - update with validation
  - [x] `DELETE /api/deals/[id]` - soft delete (archive) or hard delete

---

## Phase 5.5: Property Data Lookup

**Status**: [x] Complete

### Tasks

- [x] **5.5.1** Create Realty in US API client (`src/lib/api/realty-in-us.ts`)
  - [x] `autoCompleteAddress(query)` - validate and parse address
  - [x] `searchProperties(address)` - search for property
  - [x] `getPropertyDetail(propertyId)` - get detailed property info
  - [x] `lookupPropertyData(address)` - combined lookup
  - [x] `mapPropertyType(realtyType)` - map to our enum

- [x] **5.5.2** Create property lookup API route (`src/app/api/property-lookup/route.ts`)
  - [x] Authentication check
  - [x] Address validation
  - [x] Map API response to deal form fields
  - [x] Return structured PropertyLookupResponse

- [x] **5.5.3** Update DealForm with lookup functionality
  - [x] "Lookup" button next to address field
  - [x] Auto-populate form fields from API response
  - [x] Display data source, rent range, and last sale info
  - [x] Loading and error states

- [x] **5.5.4** Environment configuration
  - [x] Add RAPIDAPI_KEY to `.env.local.example`

**API Used**: Realty in US by Api Dojo (via RapidAPI)
- Property details: beds, baths, sqft, year built, property type
- Financial data: list price, estimated value, property taxes, rental estimate
- High reliability (9.9 rating, 100% success rate)

---

## Phase 6: Model Integration & Display

**Status**: [x] Complete

### Tasks

- [x] **6.1** Create `src/app/api/analyze/route.ts`
  - [x] Load deal from database
  - [x] Run financial model
  - [x] Determine verdict using `determineVerdict()`
  - [x] Update deal status and verdict
  - [x] Return ModelOutput with verdict and reason

- [x] **6.2** Create `src/components/memo/MemoView.tsx`
  - [x] Main memo display component
  - [x] Renders all 8 sections (verdict, assumptions, returns, year-by-year, sensitivity, risks, gaps, next steps)

- [x] **6.3** Create `src/components/memo/sections/`
  - [x] `QuickVerdict.tsx` - Buy/Pass/Watch with key metrics
  - [x] `KeyAssumptions.tsx` - tax rates, depreciation, comparison baseline
  - [x] `InvestmentReturns.tsx` - 5/7/10 year comparison table
  - [x] `SensitivityAnalysis.tsx` - rent, appreciation, vacancy sensitivity
  - [x] `RiskNotes.tsx` - context-aware risk bullets
  - [x] `DataGaps.tsx` - gaps with impact levels and recommendations
  - [x] `NextSteps.tsx` - verdict-specific actions and diligence questions

- [x] **6.4** Create `src/components/memo/tables/`
  - [x] `YearByYearTable.tsx` - annual cash flow breakdown with expandable view

- [x] **6.5** Create `src/app/(dashboard)/deals/[id]/analyze/page.tsx`
  - [x] Analysis page that runs model and displays memo
  - [x] Re-analyze button for updating analysis
  - [x] Loading states and error handling

---

## Phase 7: AI Narrative Layer

**Status**: [x] Complete

### Tasks

- [x] **7.1** Create `src/lib/ai/narrative.ts`
  - [x] `generateMemoNarrative(modelOutput)` - main function
  - [x] Uses system prompt from docs/PROMPTS.md
  - [x] Builds user prompt with computed values
  - [x] Returns structured narrative sections (executiveSummary, highlights, concerns, insights, recommendation)

- [x] **7.2** Create `src/lib/ai/client.ts`
  - [x] Anthropic SDK initialization with lazy loading
  - [x] API key from environment
  - [x] `isAnthropicConfigured()` check function

- [x] **7.3** Create `src/lib/ai/prompts.ts`
  - [x] System prompt constant (MEMO_SYSTEM_PROMPT)
  - [x] User prompt builder function (buildMemoUserPrompt)
  - [x] Comparison prompt (buildComparisonPrompt)

- [x] **7.4** Create `src/app/api/memo/generate/route.ts`
  - [x] Takes dealId with optional regenerate flag
  - [x] Calls narrative generation via Anthropic Claude
  - [x] Saves memo to database
  - [x] Returns full memo with narrative
  - [x] Caches existing narrative (re-fetch unless regenerate=true)

- [x] **7.5** Implement AI Insights UI
  - [x] Created `AIInsights.tsx` component with structured display
  - [x] Updated `MemoView.tsx` to accept optional narrative prop
  - [x] Updated analyze page with "Generate AI Insights" button
  - [x] Regenerate option for existing narratives

**Note**: Verdict logic was already implemented in Phase 2/6 in `determineVerdict()` function. Updated "PASS" to "SKIP" for clarity.

---

## Phase 8: Export

**Status**: [x] Complete

### Tasks

- [x] **8.1** Create `src/components/memo/MemoPDF.tsx`
  - [x] @react-pdf/renderer Document with 2-page layout
  - [x] Professional formatting with styles
  - [x] Verdict banner, metrics grid, returns table
  - [x] AI insights integration (if available)
  - [x] Year-by-year cash flow table
  - [x] Sensitivity analysis section

- [x] **8.2** Create `src/app/api/export/pdf/route.ts`
  - [x] Load deal and run model
  - [x] Fetch existing narrative if available
  - [x] Render PDF with react-pdf/renderer
  - [x] Return file with Content-Disposition header

- [x] **8.3** Create `src/app/api/export/markdown/route.ts`
  - [x] Generate comprehensive markdown with all sections
  - [x] Tables for returns, assumptions, cash flows, sensitivity
  - [x] Include AI narrative if available
  - [x] Return text file with proper headers

- [x] **8.4** Add export buttons to analyze page
  - [x] "Export PDF" button
  - [x] "Export Markdown" button
  - [x] Loading states for both exports
  - [x] Auto-download with generated filename

---

## Phase 9: Advanced Features

**Status**: [x] Complete

### Tasks

- [x] **9.1** Create deal comparison view
  - [x] `src/app/(dashboard)/compare/page.tsx`
  - [x] `src/app/api/compare/route.ts` - comparison API
  - [x] Select 2-4 analyzed deals to compare
  - [x] Side-by-side metrics table with 14+ metrics
  - [x] Highlight best values with star indicator
  - [x] Verdict summary cards

- [x] **9.2** Create assumption profiles
  - [x] `src/lib/db/profiles.ts` - database operations
  - [x] `src/app/api/profiles/route.ts` - list/create API
  - [x] `src/app/api/profiles/[id]/route.ts` - get/update/delete API
  - [x] `src/app/(dashboard)/settings/profiles/page.tsx` - management UI
  - [x] Create/edit/delete profiles
  - [x] "Bay Area Defaults", "Cash Flow Market", "Conservative Investor" presets
  - [x] Set default profile for new deals
  - [x] Navigation link added to dashboard

- [x] **9.3** Implement portfolio tagging
  - [x] Expanded marketTag to support 7 preset tags + custom tags
  - [x] Updated DealForm with preset selection + custom input
  - [x] Added tag filtering to deals list page
  - [x] Created portfolio summary component with totals and per-tag breakdown
  - [x] API endpoints: `/api/deals/tags`, `/api/deals/portfolio`
  - [x] Database migration: `docs/migrations/003_custom_market_tags.sql`

---

## Phase 10: Polish & Launch

**Status**: [ ] Not Started

### Tasks

- [ ] **10.1** Create landing page
  - [ ] `src/app/page.tsx`
  - [ ] Value proposition
  - [ ] Features list
  - [ ] Pricing section
  - [ ] CTA buttons

- [ ] **10.2** Stripe integration (optional for V1)
  - [ ] Pricing page
  - [ ] Checkout flow
  - [ ] Subscription management
  - [ ] Usage tracking for per-memo pricing

- [ ] **10.3** Final testing
  - [ ] IRR accuracy validation vs Excel
  - [ ] Full user flow testing
  - [ ] Mobile responsiveness
  - [ ] Error handling

- [ ] **10.4** Deployment
  - [ ] Vercel project setup
  - [ ] Environment variables
  - [ ] Domain configuration
  - [ ] Production Supabase setup

---

## Default Assumptions Reference

| Assumption | Default | Override |
|------------|---------|----------|
| Federal tax rate | 30% | User |
| State tax rate | 9% | User |
| REIT baseline | 6% | Config |
| Down payment | 25% | User |
| Interest rate | 6% | User |
| Loan term | 30 years | User |
| Vacancy | 5% | User |
| Management | 8% | User |
| Repairs | 5% | User |
| CapEx | 5% | User |
| Rent growth | 3%/year | User |
| Appreciation | 3%/year | User |
| Depreciation | 27.5 years | Config |
| Land value | 20% | Config |
| Selling costs | 7% | User |

---

## Critical Rules Checklist

- [ ] Model is deterministic - same inputs = same outputs
- [ ] AI never calculates - only interprets computed results
- [ ] IRR matches Excel XIRR within 0.01%
- [ ] All outputs trace to inputs or documented defaults
- [ ] No `any` types in model code
- [ ] Unit tests for all model functions

---

## Progress Log

| Date | Phase | Tasks Completed | Notes |
|------|-------|-----------------|-------|
| 2026-01-23 | Planning | Initial plan created | Ready to begin Phase 1 |
| 2026-01-23 | Phase 1 | All 6 tasks complete | Next.js, deps, shadcn, types, config done |
| 2026-01-23 | Phase 2 | All 6 tasks complete | Financial model engine complete with 130 passing tests |
| 2026-01-23 | Phase 3 | All 6 tasks complete | Database layer with Supabase, CRUD operations, 137 tests passing |
| 2026-01-23 | Phase 4 | All 6 tasks complete | Authentication with login/signup, middleware, session helpers |
| 2026-01-23 | Phase 5 | All 5 tasks complete | Deal form, CRUD pages, API routes with validation |
| 2026-01-23 | Phase 5.5 | All 4 tasks complete | Property lookup via Realty in US API |
| 2026-01-24 | Phase 6 | All 5 tasks complete | Analyze API, MemoView, all section components |
| 2026-01-24 | Phase 6.5 | Verdict fix | Changed "PASS" to "SKIP" for clarity |
| 2026-01-24 | Phase 7 | All 5 tasks complete | AI narrative layer with Claude integration |
| 2026-01-24 | Phase 8 | All 4 tasks complete | PDF and Markdown export functionality |
| 2026-01-24 | Phase 9 | All 3 tasks complete | Comparison view, profiles, portfolio tagging |

---

## Notes

- Start with Phase 2 (Financial Model) even before UI - it's the foundation
- Test obsessively - run calculations against Excel
- Commit often with small, focused commits
- Reference docs/TECHNICAL.md for exact formulas
- Reference docs/PROMPTS.md for AI prompt templates
