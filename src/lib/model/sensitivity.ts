import type { Deal, GlobalAssumptions, SensitivityResult, SensitivityVariable } from '@/types';
import { SENSITIVITY_DELTAS } from '@/config/defaults';

/**
 * Function type for running the model and getting IRR at different horizons
 * This allows the sensitivity module to be decoupled from the actual model implementation
 */
export type ModelRunner = (
  deal: Deal,
  assumptions: GlobalAssumptions
) => { irr5: number; irr7: number; irr10: number };

/**
 * Sensitivity scenario configuration
 */
interface SensitivityScenario {
  variable: SensitivityVariable;
  delta: number;
  modifiedDeal: Deal;
}

/**
 * Create a modified deal for a sensitivity scenario
 *
 * @param deal - Original deal
 * @param variable - Variable to modify
 * @param delta - Change to apply (as decimal, e.g., 0.05 for +5%)
 * @returns Modified deal with the change applied
 */
function createModifiedDeal(
  deal: Deal,
  variable: SensitivityVariable,
  delta: number
): Deal {
  const modifiedDeal = { ...deal };

  switch (variable) {
    case 'rent':
      // Modify base rent by delta percentage
      // e.g., delta = 0.10 means rent increases by 10%
      modifiedDeal.monthlyRent = deal.monthlyRent * (1 + delta);
      break;

    case 'appreciation':
      // Add delta to appreciation rate
      // e.g., delta = 0.01 means appreciation increases from 3% to 4%
      modifiedDeal.appreciationPct = deal.appreciationPct + delta;
      break;

    case 'vacancy':
      // Add delta to vacancy rate
      // Note: positive delta means WORSE vacancy (more lost rent)
      // e.g., delta = 0.05 means vacancy increases from 5% to 10%
      modifiedDeal.vacancyPct = Math.max(0, Math.min(1, deal.vacancyPct + delta));
      break;

    default:
      throw new Error(`Unknown sensitivity variable: ${variable}`);
  }

  return modifiedDeal;
}

/**
 * Generate all sensitivity scenarios
 *
 * @param deal - Base deal
 * @returns Array of scenarios to run
 */
function generateScenarios(deal: Deal): SensitivityScenario[] {
  const scenarios: SensitivityScenario[] = [];

  // Rent sensitivity scenarios
  for (const delta of SENSITIVITY_DELTAS.rent) {
    scenarios.push({
      variable: 'rent',
      delta,
      modifiedDeal: createModifiedDeal(deal, 'rent', delta),
    });
  }

  // Appreciation sensitivity scenarios
  for (const delta of SENSITIVITY_DELTAS.appreciation) {
    scenarios.push({
      variable: 'appreciation',
      delta,
      modifiedDeal: createModifiedDeal(deal, 'appreciation', delta),
    });
  }

  // Vacancy sensitivity scenarios
  for (const delta of SENSITIVITY_DELTAS.vacancy) {
    scenarios.push({
      variable: 'vacancy',
      delta,
      modifiedDeal: createModifiedDeal(deal, 'vacancy', delta),
    });
  }

  return scenarios;
}

/**
 * Run sensitivity analysis
 *
 * Runs the financial model with modified inputs for:
 * - Rent: -10%, -5%, base, +5%, +10%
 * - Appreciation: -2%, -1%, base, +1%, +2%
 * - Vacancy: +5%, +3%, base, -2%, -3%
 *
 * @param deal - Base deal to analyze
 * @param assumptions - Global assumptions
 * @param runModel - Function to run the model and get IRR results
 * @returns Array of sensitivity results
 */
export function runSensitivityAnalysis(
  deal: Deal,
  assumptions: GlobalAssumptions,
  runModel: ModelRunner
): SensitivityResult[] {
  const scenarios = generateScenarios(deal);
  const results: SensitivityResult[] = [];

  for (const scenario of scenarios) {
    const modelResult = runModel(scenario.modifiedDeal, assumptions);

    results.push({
      variable: scenario.variable,
      delta: scenario.delta,
      irr5: modelResult.irr5,
      irr7: modelResult.irr7,
      irr10: modelResult.irr10,
    });
  }

  return results;
}

/**
 * Format sensitivity delta for display
 *
 * @param variable - Sensitivity variable type
 * @param delta - Delta value
 * @returns Human-readable string
 */
export function formatSensitivityDelta(
  variable: SensitivityVariable,
  delta: number
): string {
  const sign = delta >= 0 ? '+' : '';
  const percentage = (delta * 100).toFixed(0);

  switch (variable) {
    case 'rent':
      return `${sign}${percentage}% rent`;
    case 'appreciation':
      return `${sign}${percentage}% appreciation`;
    case 'vacancy':
      // Positive delta = worse (higher vacancy)
      if (delta > 0) {
        return `+${percentage}% vacancy (worse)`;
      } else if (delta < 0) {
        return `${percentage}% vacancy (better)`;
      }
      return 'base vacancy';
    default:
      return `${sign}${percentage}%`;
  }
}

/**
 * Get base case scenario from sensitivity results
 *
 * @param results - Sensitivity results array
 * @param variable - Variable type to filter
 * @returns Base case (delta = 0) result for the variable
 */
export function getBaseCase(
  results: SensitivityResult[],
  variable: SensitivityVariable
): SensitivityResult | undefined {
  return results.find((r) => r.variable === variable && r.delta === 0);
}

/**
 * Calculate IRR change from base case
 *
 * @param baseIRR - Base case IRR
 * @param scenarioIRR - Scenario IRR
 * @returns Percentage point change
 */
export function calculateIRRChange(baseIRR: number, scenarioIRR: number): number {
  return scenarioIRR - baseIRR;
}

/**
 * Find worst case IRR across all scenarios
 *
 * @param results - Sensitivity results
 * @param horizon - Which horizon to check (5, 7, or 10)
 * @returns Worst case scenario
 */
export function findWorstCase(
  results: SensitivityResult[],
  horizon: 5 | 7 | 10
): SensitivityResult | undefined {
  const irrKey = `irr${horizon}` as 'irr5' | 'irr7' | 'irr10';

  return results.reduce((worst, current) => {
    if (!worst) return current;
    return current[irrKey] < worst[irrKey] ? current : worst;
  }, undefined as SensitivityResult | undefined);
}

/**
 * Find best case IRR across all scenarios
 *
 * @param results - Sensitivity results
 * @param horizon - Which horizon to check (5, 7, or 10)
 * @returns Best case scenario
 */
export function findBestCase(
  results: SensitivityResult[],
  horizon: 5 | 7 | 10
): SensitivityResult | undefined {
  const irrKey = `irr${horizon}` as 'irr5' | 'irr7' | 'irr10';

  return results.reduce((best, current) => {
    if (!best) return current;
    return current[irrKey] > best[irrKey] ? current : best;
  }, undefined as SensitivityResult | undefined);
}
