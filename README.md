# RE Investment Copilot - Claude Code Starter Kit

## What's In This Kit

This starter kit contains everything you need to begin building with Claude Code:

```
re-copilot-starter-kit/
├── CLAUDE.md           # Project instructions for Claude Code
├── QUICKSTART.md       # Step-by-step build guide
├── README.md           # This file
└── docs/
    ├── PRD.md          # Enhanced product requirements
    ├── TECHNICAL.md    # Calculations, schema, API spec
    └── PROMPTS.md      # AI prompt templates
```

## How to Use This Kit

1. **Create your project directory** and copy these files into it
2. **Place CLAUDE.md in the root** - Claude Code reads this automatically
3. **Place docs/ folder** with PRD, TECHNICAL, and PROMPTS
4. **Follow QUICKSTART.md** for day-by-day build instructions

## Changes Made to Your Original PRD

Your original PRD was excellent. Here's what was added to make it build-ready:

### Added: Data Model (Section 6)
- Complete TypeScript interfaces for `Deal`, `GlobalAssumptions`, `ModelOutput`
- Detailed structure for `YearResult`, `HorizonResult`, `SensitivityResult`
- This gives Claude Code exact types to implement

### Added: API Routes (Section 7)
- RESTful endpoints for deals CRUD
- Analyze endpoint specification
- Export endpoints for PDF/Markdown

### Added: Pricing Model (Section 10)
- Three pricing options with specific numbers
- Helps inform paywall implementation

### Added: Technical Specification (New File)
- **Calculation Formulas**: Every formula written out explicitly
  - Amortization
  - Cash flow (year by year)
  - Tax calculations (depreciation, capital gains)
  - IRR (Newton-Raphson method)
  - Sensitivity analysis methodology
- **Database Schema**: Complete SQL for Supabase with RLS
- **Testing Requirements**: Unit test examples with expected values
- **Error Handling**: Validation rules and edge cases

### Added: Enhanced Prompts (New File)
- System prompt with explicit rules (never generate numbers)
- User prompt template with all variable placeholders
- Verdict logic prompt (decision framework)
- Comparison prompt for multi-deal analysis
- Data gap assessment prompt
- Risk notes prompt

### Added: CLAUDE.md (New File)
- Project overview and principles
- Tech stack decisions
- Directory structure
- Development workflow
- Critical rules (deterministic model, testing)

### Added: Quick Start Guide (New File)
- Pre-flight checklist
- Day-by-day build instructions
- Specific Claude Code prompts to use
- Tips for solo building

## What Was NOT Changed

Your core PRD decisions were kept intact:
- Deterministic model principle
- Output contract (7 sections)
- Default assumptions
- User flows
- Success metrics
- Non-functional requirements
- Future considerations

These were good decisions that didn't need modification.

## Recommended Build Order

1. **Week 1**: Financial model engine (the math)
2. **Week 2**: Database + input forms
3. **Week 3**: Memo generation + display
4. **Week 4**: AI narrative + export
5. **Week 5**: Payments + polish + launch

## Key Success Factors

1. **Get the math right first** - Test IRR against Excel before anything else
2. **AI is for narrative only** - Never let it generate numbers
3. **Test obsessively** - Unit tests are your safety net
4. **Ship ugly, then polish** - Working > pretty

## Questions?

If you get stuck, the most useful approach in Claude Code is:

> "I'm implementing [X] from docs/TECHNICAL.md. Here's my current code: [paste]. It's not working because [symptom]. Expected behavior is [Y]. Help me fix it."

Good luck building! 🏠📊
