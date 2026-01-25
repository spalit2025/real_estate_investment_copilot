# RE Investment Copilot

Decision-ready underwriting for residential rentals with financing and tax effects.

## Project Overview

This is a Next.js application that generates professional investment memos for real estate deals. Users input property details, and the system produces a structured analysis with IRR calculations, sensitivity analysis, and AI-generated narrative.

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Claude API (narrative generation only - NOT for calculations)
- **Styling**: Tailwind CSS + shadcn/ui
- **PDF Export**: @react-pdf/renderer
- **Hosting**: Vercel

## Architecture Principles

### Deterministic Core
The financial model is pure TypeScript math. AI generates narrative FROM computed outputs, never the other way around. This ensures:
- Reproducibility: Same inputs = same numbers
- Auditability: Every number traces to an input or default
- Trust: Users can verify calculations independently

### Three-Layer Model
1. **Config**: Global defaults (tax rates, REIT baseline, etc.)
2. **Property Inputs**: User-provided deal data
3. **Model Outputs**: Computed results (never AI-generated)

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── (dashboard)/       # Protected pages
│   │   ├── deals/         # Deal list, create, view
│   │   └── compare/       # Side-by-side comparison
│   └── api/               # API routes
│       ├── deals/         # CRUD operations
│       ├── analyze/       # Run model, generate memo
│       └── export/        # PDF generation
├── components/
│   ├── ui/                # shadcn components
│   ├── forms/             # Deal input forms
│   └── memo/              # Memo display components
├── lib/
│   ├── model/             # Financial calculations (CRITICAL)
│   │   ├── amortization.ts
│   │   ├── cashflow.ts
│   │   ├── irr.ts
│   │   ├── taxes.ts
│   │   └── sensitivity.ts
│   ├── ai/                # Claude integration
│   │   └── narrative.ts   # Generate memo narrative from model outputs
│   ├── db/                # Supabase client and queries
│   └── utils/             # Helpers, formatters
├── types/                 # TypeScript interfaces
│   ├── deal.ts
│   ├── model.ts
│   └── memo.ts
└── config/
    └── defaults.ts        # Global assumption defaults
```

## Key Files Reference

- `docs/PRD.md` - Product requirements
- `docs/TECHNICAL.md` - Calculations, schema, API spec
- `docs/PROMPTS.md` - AI prompt templates

## Default Assumptions

Always use these unless user overrides:
- Federal tax rate: 30%
- State tax rate: 9%
- REIT baseline return: 6% annual
- Mortgage: 10-year ARM at 6%
- Buyer closing costs: Included in initial equity
- Selling costs: 6% agent + 1% transfer tax + 1% closing

## Output Contract

Every memo MUST include these sections in order:
1. Quick Verdict (Buy/Pass/Watch + single biggest driver)
2. Key Assumptions Used
3. 5/7/10-Year Results (equity, cash flow, IRR, multiple)
4. Sensitivity Analysis (rent, appreciation, vacancy)
5. Risk Notes
6. Data Gaps
7. Next Steps + Top 3 Diligence Questions

## Commands

```bash
# Development
npm run dev

# Type checking
npm run typecheck

# Run tests (especially model tests)
npm run test

# Build
npm run build
```

## Critical Rules

1. **NEVER let AI generate financial numbers** - All calculations in `/lib/model/`
2. **ALWAYS write unit tests for model functions** - These are the source of truth
3. **ALWAYS trace outputs to inputs** - Include `assumptions_used` in all results
4. **Use TypeScript strictly** - No `any` types in model code
5. **Format currency consistently** - Use Intl.NumberFormat, always show 2 decimals for rates

## Development Workflow

1. Start with `/lib/model/` functions - get the math right first
2. Write tests for each calculation
3. Build UI forms that collect required inputs
4. Connect form → model → display results
5. Add AI narrative layer last (it consumes model outputs)

## Testing Priority

1. IRR calculation (must match Excel XIRR within 0.01%)
2. Amortization schedule (must match standard calculators)
3. Tax calculations (depreciation, capital gains)
4. Sensitivity runs (verify delta calculations)
