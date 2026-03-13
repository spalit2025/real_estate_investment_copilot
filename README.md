# RE Investment Copilot

Real estate investors underwrite deals in spreadsheets -- copying formulas
between tabs, manually adjusting tax assumptions, and hoping the IRR formula
didn't break. When it's time to share the analysis with a partner or lender,
they screenshot the spreadsheet or write a narrative from memory.

RE Investment Copilot replaces that workflow. Enter a deal, get a professional
investment memo with IRR calculations, sensitivity analysis, tax-adjusted cash
flows, and a clear verdict (Buy / Watch / Skip) -- backed by a deterministic
financial model where every number traces to an input or assumption.

## Why I built this

1. **Can you separate AI narrative from financial math?** The model engine
   is pure TypeScript with 230 unit tests. Claude generates the memo narrative
   from pre-computed results, never from raw inputs. This means the numbers
   are auditable and the AI can't hallucinate a return.

2. **What does "good enough to share" look like for a rental analysis?**
   Most investors stop at a spreadsheet. A structured memo with sensitivity
   tables and risk flags is what institutional investors produce -- but
   individual investors rarely have time to format one.

3. **How do you compare deals across different markets?** Percentile-based
   scoring ranks properties against each other on appreciation, income, and
   risk -- not absolute thresholds that break across geographies.

## Demo

<!-- TODO: Add screenshot of investment memo output -->

## How it works

```
Deal Input (price, rent, financing, expenses)
    |
    v
Financial Model Engine (pure TypeScript, no AI)
    |
    ├── Amortization schedule (360-month breakdown)
    ├── Year-by-year cash flows (years 1-10)
    ├── Tax calculations (depreciation, passive loss, recapture)
    ├── Exit analysis at 5/7/10-year horizons
    ├── Sensitivity analysis (rent, appreciation, vacancy)
    └── Percentile-based scoring across deals
    |
    v
Verdict Engine (BUY / WATCH / SKIP)
    |
    v
Claude API (narrative only -- interprets computed results)
    |
    v
Investment Memo (PDF / Markdown export)
```

## Quick start

```bash
git clone https://github.com/spalit2025/re-investment-copilot.git
cd re-investment-copilot
npm install

cp .env.local.example .env.local
# Add Supabase and Anthropic API keys

npm run dev
```

## Architecture

- `lib/model/amortization.ts` -- loan schedule with monthly P&I breakdown
- `lib/model/cashflow.ts` -- annual income, expenses, NOI, cash-on-cash
- `lib/model/irr.ts` -- Newton-Raphson IRR with bisection fallback
- `lib/model/taxes.ts` -- depreciation, passive loss treatment, exit taxes
- `lib/model/sensitivity.ts` -- stress testing across rent/appreciation/vacancy
- `lib/model/scoring.ts` -- percentile-based deal ranking (appreciation, income, risk)
- `lib/model/index.ts` -- orchestrates full 10-year model run with horizon summaries
- `lib/ai/narrative.ts` -- Claude prompt that consumes model output, never raw inputs
- `lib/db/` -- Supabase client with row-level security
- `config/defaults.ts` -- global assumptions (tax rates, REIT baseline, verdict thresholds)

## Key design decisions

- **Deterministic core, AI narrative layer:** Financial numbers come from
  TypeScript math with 230 unit tests. Claude only sees computed results and
  writes the narrative. This makes the model auditable -- you can verify every
  number without trusting the AI.

- **Passive loss treatment:** Per-deal toggle inherited from global assumptions.
  When passive losses are usable (AGI under $150K), negative taxable income
  creates a tax benefit that improves after-tax cash flow. When not usable,
  losses carry forward with no current-year benefit. Most simple calculators
  ignore this entirely.

- **Percentile scoring over absolute thresholds:** A 10% IRR means different
  things in San Francisco vs. Memphis. Scoring deals relative to each other
  (50% appreciation + 30% income + 20% risk) lets investors compare across
  markets without recalibrating thresholds.

- **Sensitivity-first verdict:** The BUY/WATCH/SKIP verdict isn't just IRR
  vs. a threshold. It checks IRR > 12%, equity multiple > 1.8x, REIT
  comparison > 2% excess, and flags high-impact data gaps. A deal with great
  IRR but missing property tax data gets WATCH, not BUY.

## Tech stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Database:** Supabase (PostgreSQL with row-level security)
- **Auth:** Supabase Auth
- **AI:** Claude API (narrative generation only)
- **Styling:** Tailwind CSS + shadcn/ui
- **Testing:** Vitest (230 tests across model, components, DB utils)
- **Export:** @react-pdf/renderer for PDF memos

## Configuration

All assumptions configurable per-deal or globally:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-api-key
```

Default assumptions: 30% federal tax, 9% state tax (CA), 27.5-year
depreciation, 20% land value, 6% REIT baseline, 25% down payment.

## License

MIT
