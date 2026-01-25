'use client';

/**
 * Investment Returns section - 5/7/10 year comparison table
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HorizonResult } from '@/types/model';

interface InvestmentReturnsProps {
  horizons: {
    year5: HorizonResult;
    year7: HorizonResult;
    year10: HorizonResult;
  };
}

export function InvestmentReturns({ horizons }: InvestmentReturnsProps) {
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const periods = [
    { key: 'year5', label: '5 Year', data: horizons.year5 },
    { key: 'year7', label: '7 Year', data: horizons.year7 },
    { key: 'year10', label: '10 Year', data: horizons.year10 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Investment Returns by Hold Period</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Metric</th>
                {periods.map((period) => (
                  <th key={period.key} className="text-right py-2 px-4">{period.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2 pr-4 text-gray-600">Internal Rate of Return (IRR)</td>
                {periods.map((period) => (
                  <td key={period.key} className="text-right py-2 px-4 font-semibold">
                    {formatPercent(period.data.irr)}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 text-gray-600">Equity Multiple</td>
                {periods.map((period) => (
                  <td key={period.key} className="text-right py-2 px-4 font-semibold">
                    {period.data.equityMultiple.toFixed(2)}x
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 text-gray-600">Total Return</td>
                {periods.map((period) => (
                  <td key={period.key} className="text-right py-2 px-4 font-semibold">
                    {formatCurrency(period.data.totalReturn)}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 text-gray-600">Cumulative Cash Flow</td>
                {periods.map((period) => (
                  <td key={period.key} className="text-right py-2 px-4 font-semibold">
                    {formatCurrency(period.data.cumulativeCashFlow)}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="py-2 pr-4 text-gray-600">Net Sale Proceeds</td>
                {periods.map((period) => (
                  <td key={period.key} className="text-right py-2 px-4 font-semibold">
                    {formatCurrency(period.data.netSaleProceeds)}
                  </td>
                ))}
              </tr>
              <tr className="border-b bg-gray-50">
                <td className="py-2 pr-4 text-gray-600">Excess Over REIT (6%)</td>
                {periods.map((period) => (
                  <td
                    key={period.key}
                    className={`text-right py-2 px-4 font-semibold ${period.data.reitComparison > 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {period.data.reitComparison > 0 ? '+' : ''}{formatPercent(period.data.reitComparison)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
