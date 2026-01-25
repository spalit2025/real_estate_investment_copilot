# Quick Start Guide
Getting started with Claude Code for RE Investment Copilot

## Pre-Flight Checklist

Before opening Claude Code, ensure you have:

- [ ] Node.js 18+ installed
- [ ] A Supabase account (free tier works)
- [ ] An Anthropic API key (for Claude API)
- [ ] A Stripe account (can defer until payment phase)

## Step 1: Project Setup (Day 1)

Open Claude Code and run:

```bash
# Create project
npx create-next-app@latest re-copilot --typescript --tailwind --eslint --app --src-dir

cd re-copilot

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @anthropic-ai/sdk
npm install zod react-hook-form @hookform/resolvers
npm install lucide-react
npm install @react-pdf/renderer

# shadcn/ui setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label table tabs form select dialog alert
```

Then ask Claude Code:
> "Set up the project structure from CLAUDE.md. Create the directory structure and placeholder files."

## Step 2: Financial Model (Days 2-4)

This is the most critical part. Start here.

Ask Claude Code:
> "Create the financial model engine in /lib/model/. Start with amortization.ts - implement the amortization schedule calculation with monthly payment, principal, interest, and remaining balance. Include unit tests."

Then:
> "Create irr.ts - implement IRR calculation using Newton-Raphson method. Must match Excel XIRR within 0.01%. Include unit tests with known values."

Then:
> "Create cashflow.ts - implement annual cash flow calculation including gross rent, vacancy, operating expenses, NOI, debt service, and before-tax cash flow."

Then:
> "Create taxes.ts - implement depreciation calculation (27.5 year straight-line) and exit tax calculation including depreciation recapture and capital gains."

Then:
> "Create sensitivity.ts - implement sensitivity analysis that runs the model with modified inputs for rent, appreciation, and vacancy."

**TEST EVERYTHING**: Run `npm test` after each module. The model is your source of truth.

## Step 3: Database Setup (Day 4)

Go to Supabase dashboard:
1. Create new project
2. Go to SQL Editor
3. Run the SQL from TECHNICAL.md Section 3

Then ask Claude Code:
> "Create /lib/db/client.ts with Supabase client setup. Create /lib/db/deals.ts with CRUD functions for deals table. Use the schema from TECHNICAL.md."

## Step 4: Deal Input Form (Days 5-6)

Ask Claude Code:
> "Create the deal input form at /app/(dashboard)/deals/new/page.tsx. Use react-hook-form with zod validation. Include all fields from the Deal interface in TECHNICAL.md. Group into sections: Property, Purchase, Financing, Income, Expenses, Exit, Constraints."

## Step 5: Model Integration (Day 7)

Ask Claude Code:
> "Create /app/api/analyze/route.ts. This endpoint should: 1) Load deal from database, 2) Run the financial model, 3) Generate sensitivity analysis, 4) Return ModelOutput. Do NOT call Claude API yet - just return computed results."

Then:
> "Create the memo display component at /components/memo/MemoView.tsx. Display all computed results in a clean format matching the output contract from PRD.md."

## Step 6: AI Narrative Layer (Day 8)

Ask Claude Code:
> "Create /lib/ai/narrative.ts. Implement generateMemoNarrative() that takes ModelOutput and returns AI-generated narrative using Claude API. Use the system prompt and user prompt template from PROMPTS.md."

Then:
> "Update the analyze endpoint to optionally call the AI narrative generation after model computation. Add a 'generateNarrative' query param."

## Step 7: Export (Day 9)

Ask Claude Code:
> "Create /app/api/export/pdf/route.ts and /components/memo/MemoPDF.tsx. Use @react-pdf/renderer to generate a professional PDF of the memo."

## Step 8: Polish & Payments (Days 10-12)

Ask Claude Code:
> "Add Stripe subscription checkout. Create pricing page with two tiers: $29/memo and $79/month unlimited."

> "Create the deal comparison view at /app/(dashboard)/compare/page.tsx. Side-by-side view of 2-3 deals with key metrics."

> "Create the landing page at /app/page.tsx with value proposition, features, and pricing."

## Context Files Summary

When working in Claude Code, make sure these files are in your project:

```
your-project/
├── CLAUDE.md          # Project instructions (Claude reads this)
├── docs/
│   ├── PRD.md         # Product requirements
│   ├── TECHNICAL.md   # Calculations, schema, API spec
│   └── PROMPTS.md     # AI prompt templates
└── ... (rest of project)
```

Claude Code will reference CLAUDE.md automatically. Point it to the docs/ files when working on specific areas.

## Common Claude Code Commands

```
# Start a feature
"Implement [feature] following the spec in docs/TECHNICAL.md"

# Debug
"This test is failing: [paste error]. The expected behavior is [X]. Fix it."

# Refactor
"Refactor [file] to be more readable. Keep the same functionality."

# Add tests
"Add unit tests for [function] with edge cases for [scenarios]"

# Review
"Review this implementation against the PRD. What's missing?"
```

## Tips for Solo Building

1. **Test the model obsessively** - Run your IRR calculation against Excel. If they don't match, stop and fix it.

2. **Start ugly, make it pretty later** - Get the math working before you polish the UI.

3. **Commit often** - Small commits make it easy to rollback when things break.

4. **Use Claude for rubber ducking** - Explain what you're trying to do before asking for code.

5. **Take breaks** - 4 hours of focused work beats 8 hours of grinding.

## Red Flags to Watch

- IRR doesn't match Excel → Stop, debug the calculation
- AI is generating numbers → Fix the prompt to only use computed values
- Tests are passing but results look wrong → Add more test cases
- Supabase RLS blocking queries → Check your policies
