# RE Investment Copilot

Professional investment memo generator for residential rental properties. Get IRR calculations, sensitivity analysis, and a clear verdict (Buy, Pass, or Watch) in under 5 minutes.

## Features

- **Deterministic Financial Model** - IRR, cash flow, tax effects (depreciation, capital gains, recapture)
- **Multi-Horizon Analysis** - 5, 7, and 10-year exit scenarios
- **Sensitivity Analysis** - Rent, appreciation, and vacancy stress testing
- **REIT Comparison** - Benchmark against passive investing
- **AI Narrative** - Claude-generated insights (numbers are never AI-generated)
- **PDF/Markdown Export** - Professional memos for partners and lenders

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **AI**: Claude API (narrative only)
- **Styling**: Tailwind CSS + shadcn/ui
- **Testing**: Vitest + React Testing Library

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Supabase and Anthropic API keys

# Run database migrations (see docs/migrations/)

# Start development server
npm run dev
```

Visit http://localhost:3000

## Scripts

```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run test       # Run tests (220 tests)
npm run typecheck  # TypeScript check
npm run lint       # ESLint
```

## Project Structure

```
src/
├── app/                 # Next.js pages and API routes
├── components/          # React components
│   ├── landing/         # Landing page sections
│   ├── memo/            # Investment memo display
│   └── ui/              # shadcn components
├── lib/
│   ├── model/           # Financial calculations (core)
│   ├── ai/              # Claude integration
│   └── db/              # Supabase client
├── types/               # TypeScript interfaces
└── config/              # Default assumptions
```

## Documentation

- `docs/PRD.md` - Product requirements
- `docs/TECHNICAL.md` - Calculation formulas, database schema
- `docs/PROMPTS.md` - AI prompt templates

## License

MIT
