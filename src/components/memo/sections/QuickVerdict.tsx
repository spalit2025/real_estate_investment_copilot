'use client';

/**
 * Quick Verdict section - Buy/Pass/Watch with key driver
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { HorizonResult } from '@/types/model';

interface QuickVerdictProps {
  verdict: 'buy' | 'skip' | 'watch';
  verdictReason: string;
  horizons: {
    year5: HorizonResult;
    year7: HorizonResult;
    year10: HorizonResult;
  };
}

export function QuickVerdict({ verdict, verdictReason, horizons }: QuickVerdictProps) {
  const verdictConfig = {
    buy: {
      label: 'BUY',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-500',
      description: 'This deal meets investment criteria',
    },
    skip: {
      label: 'SKIP',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-500',
      description: 'This deal does not meet investment criteria',
    },
    watch: {
      label: 'WATCH',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-500',
      description: 'This deal has potential but needs monitoring',
    },
  };

  const config = verdictConfig[verdict];
  const horizon7 = horizons.year7;

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  return (
    <Card className={`border-l-4 ${config.borderColor}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Investment Verdict</span>
          <span className={`px-4 py-2 rounded-full text-lg font-bold ${config.bgColor} ${config.textColor}`}>
            {config.label}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-lg mb-4">{verdictReason}</p>

        {horizon7 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">7-Year IRR</p>
              <p className="text-2xl font-bold">{formatPercent(horizon7.irr)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Equity Multiple</p>
              <p className="text-2xl font-bold">{horizon7.equityMultiple.toFixed(2)}x</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Return</p>
              <p className="text-2xl font-bold">{formatCurrency(horizon7.totalReturn)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">vs REIT</p>
              <p className={`text-2xl font-bold ${horizon7.reitComparison > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {horizon7.reitComparison > 0 ? '+' : ''}{formatPercent(horizon7.reitComparison)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
