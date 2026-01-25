'use client';

/**
 * Year-by-Year breakdown table
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { YearResult } from '@/types/model';

interface YearByYearTableProps {
  years: YearResult[];
}

export function YearByYearTable({ years }: YearByYearTableProps) {
  const [expanded, setExpanded] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const displayYears = expanded ? years : years.slice(0, 5);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Year-by-Year Cash Flow</CardTitle>
        {years.length > 5 && (
          <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show Less' : `Show All ${years.length} Years`}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-2 px-2">Year</th>
                <th className="text-right py-2 px-2">Gross Rent</th>
                <th className="text-right py-2 px-2">Vacancy</th>
                <th className="text-right py-2 px-2">Effective Income</th>
                <th className="text-right py-2 px-2">OpEx</th>
                <th className="text-right py-2 px-2">NOI</th>
                <th className="text-right py-2 px-2">Debt Service</th>
                <th className="text-right py-2 px-2">CF Before Tax</th>
                <th className="text-right py-2 px-2">Tax</th>
                <th className="text-right py-2 px-2 font-semibold">CF After Tax</th>
              </tr>
            </thead>
            <tbody>
              {displayYears.map((year) => (
                <tr key={year.year} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2 font-medium">{year.year}</td>
                  <td className="text-right py-2 px-2">{formatCurrency(year.grossRent)}</td>
                  <td className="text-right py-2 px-2 text-red-600">({formatCurrency(year.vacancy)})</td>
                  <td className="text-right py-2 px-2">{formatCurrency(year.effectiveGrossIncome)}</td>
                  <td className="text-right py-2 px-2 text-red-600">({formatCurrency(year.operatingExpenses)})</td>
                  <td className="text-right py-2 px-2">{formatCurrency(year.noi)}</td>
                  <td className="text-right py-2 px-2 text-red-600">({formatCurrency(year.debtService)})</td>
                  <td className={`text-right py-2 px-2 ${year.cashFlowBeforeTax < 0 ? 'text-red-600' : ''}`}>
                    {formatCurrency(year.cashFlowBeforeTax)}
                  </td>
                  <td className={`text-right py-2 px-2 ${year.incomeTax > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {year.incomeTax > 0 ? `(${formatCurrency(year.incomeTax)})` : formatCurrency(Math.abs(year.incomeTax))}
                  </td>
                  <td className={`text-right py-2 px-2 font-semibold ${year.cashFlowAfterTax < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formatCurrency(year.cashFlowAfterTax)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-100 font-semibold">
                <td className="py-2 px-2">Total</td>
                <td className="text-right py-2 px-2">
                  {formatCurrency(displayYears.reduce((sum, y) => sum + y.grossRent, 0))}
                </td>
                <td className="text-right py-2 px-2 text-red-600">
                  ({formatCurrency(displayYears.reduce((sum, y) => sum + y.vacancy, 0))})
                </td>
                <td className="text-right py-2 px-2">
                  {formatCurrency(displayYears.reduce((sum, y) => sum + y.effectiveGrossIncome, 0))}
                </td>
                <td className="text-right py-2 px-2 text-red-600">
                  ({formatCurrency(displayYears.reduce((sum, y) => sum + y.operatingExpenses, 0))})
                </td>
                <td className="text-right py-2 px-2">
                  {formatCurrency(displayYears.reduce((sum, y) => sum + y.noi, 0))}
                </td>
                <td className="text-right py-2 px-2 text-red-600">
                  ({formatCurrency(displayYears.reduce((sum, y) => sum + y.debtService, 0))})
                </td>
                <td className="text-right py-2 px-2">
                  {formatCurrency(displayYears.reduce((sum, y) => sum + y.cashFlowBeforeTax, 0))}
                </td>
                <td className="text-right py-2 px-2">
                  {formatCurrency(displayYears.reduce((sum, y) => sum + y.incomeTax, 0))}
                </td>
                <td className="text-right py-2 px-2">
                  {formatCurrency(displayYears.reduce((sum, y) => sum + y.cashFlowAfterTax, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-gray-500">Avg Annual Cash Flow</p>
            <p className="font-semibold">
              {formatCurrency(years.reduce((sum, y) => sum + y.cashFlowAfterTax, 0) / years.length)}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-gray-500">Year 1 NOI</p>
            <p className="font-semibold">{years[0] ? formatCurrency(years[0].noi) : '-'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-gray-500">Year 10 NOI</p>
            <p className="font-semibold">{years[9] ? formatCurrency(years[9].noi) : '-'}</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-gray-500">NOI Growth</p>
            <p className="font-semibold">
              {years[0] && years[9]
                ? `${(((years[9].noi / years[0].noi) ** (1 / 9) - 1) * 100).toFixed(1)}%/yr`
                : '-'}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
