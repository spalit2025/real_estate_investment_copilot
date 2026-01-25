'use client';

/**
 * Key Assumptions section - displays the assumptions used in the analysis
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { GlobalAssumptions } from '@/types/deal';

interface KeyAssumptionsProps {
  assumptions: GlobalAssumptions;
}

export function KeyAssumptions({ assumptions }: KeyAssumptionsProps) {
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  const assumptionGroups = [
    {
      title: 'Tax Rates',
      items: [
        { label: 'Federal Tax Rate', value: formatPercent(assumptions.federalTaxRate) },
        { label: 'State Tax Rate', value: formatPercent(assumptions.stateTaxRate) },
        { label: 'Capital Gains Rate', value: formatPercent(assumptions.capitalGainsRate) },
        { label: 'Depreciation Recapture', value: formatPercent(assumptions.deprecationRecaptureRate) },
      ],
    },
    {
      title: 'Depreciation',
      items: [
        { label: 'Depreciation Period', value: `${assumptions.depreciationYears} years` },
        { label: 'Land Value', value: formatPercent(assumptions.landValuePct) },
      ],
    },
    {
      title: 'Comparison',
      items: [
        { label: 'REIT Baseline Return', value: `${formatPercent(assumptions.reitBaselineReturn)}/yr` },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Assumptions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assumptionGroups.map((group) => (
            <div key={group.title}>
              <h4 className="font-semibold text-gray-700 mb-2">{group.title}</h4>
              <dl className="space-y-1">
                {group.items.map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <dt className="text-gray-500">{item.label}</dt>
                    <dd className="font-medium">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
