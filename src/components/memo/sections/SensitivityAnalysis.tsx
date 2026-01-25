'use client';

/**
 * Sensitivity Analysis section - shows how IRR changes with different assumptions
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SensitivityResult } from '@/types/model';

interface SensitivityAnalysisProps {
  sensitivity: SensitivityResult[];
}

export function SensitivityAnalysis({ sensitivity }: SensitivityAnalysisProps) {
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  // Group by variable
  const byVariable: Record<string, SensitivityResult[]> = {};
  sensitivity.forEach((result) => {
    if (!byVariable[result.variable]) {
      byVariable[result.variable] = [];
    }
    byVariable[result.variable].push(result);
  });

  const variableLabels: Record<string, string> = {
    rent: 'Rent Change',
    appreciation: 'Appreciation Change',
    vacancy: 'Vacancy Change',
  };

  const getColorClass = (irr: number, baseIrr: number) => {
    if (irr >= baseIrr + 0.02) return 'bg-green-100 text-green-800';
    if (irr >= baseIrr) return 'bg-green-50 text-green-700';
    if (irr >= baseIrr - 0.02) return 'bg-yellow-50 text-yellow-700';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sensitivity Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          How the 7-year IRR changes under different scenarios
        </p>

        <div className="space-y-6">
          {Object.entries(byVariable).map(([variable, results]) => {
            // Sort by delta
            const sorted = [...results].sort((a, b) => a.delta - b.delta);
            const baseCase = sorted.find((r) => r.delta === 0);
            const baseIrr = baseCase?.irr7 ?? 0;

            return (
              <div key={variable}>
                <h4 className="font-semibold text-gray-700 mb-2">{variableLabels[variable] || variable}</h4>
                <div className="flex gap-2 flex-wrap">
                  {sorted.map((result) => (
                    <div
                      key={`${result.variable}-${result.delta}`}
                      className={`px-3 py-2 rounded-lg text-center min-w-[80px] ${
                        result.delta === 0
                          ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                          : getColorClass(result.irr7, baseIrr)
                      }`}
                    >
                      <div className="text-xs font-medium">
                        {result.delta === 0
                          ? 'Base'
                          : `${result.delta > 0 ? '+' : ''}${formatPercent(result.delta)}`}
                      </div>
                      <div className="text-lg font-bold">{formatPercent(result.irr7)}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Key Takeaways</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {Object.entries(byVariable).map(([variable, results]) => {
              const sorted = [...results].sort((a, b) => a.irr7 - b.irr7);
              const worst = sorted[0];
              const best = sorted[sorted.length - 1];
              const spread = best.irr7 - worst.irr7;

              return (
                <li key={variable}>
                  <strong>{variableLabels[variable] || variable}:</strong> IRR ranges from{' '}
                  {formatPercent(worst.irr7)} to {formatPercent(best.irr7)} (spread: {formatPercent(spread)})
                </li>
              );
            })}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
