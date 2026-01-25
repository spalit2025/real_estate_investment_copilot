'use client';

/**
 * Deal Comparison Page
 * Select 2-4 deals and compare side-by-side
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Deal } from '@/types/deal';
import type { ModelOutput, HorizonResult } from '@/types/model';

interface CompareResult {
  deal: Deal;
  modelOutput: ModelOutput;
  verdict: 'buy' | 'skip' | 'watch';
  verdictReason: string;
}

interface DealSummary {
  id: string;
  address: string;
  city: string;
  state: string;
  purchasePrice: number;
  status: string;
  verdict?: string;
}

export default function ComparePage() {
  const [deals, setDeals] = useState<DealSummary[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [compareResults, setCompareResults] = useState<CompareResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await fetch('/api/deals?status=analyzed');
      if (!response.ok) throw new Error('Failed to fetch deals');
      const data = await response.json();
      setDeals(data.deals || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load deals');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDealSelection = (dealId: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(dealId)) {
        return prev.filter((id) => id !== dealId);
      }
      if (prev.length >= 4) {
        return prev; // Max 4 deals
      }
      return [...prev, dealId];
    });
    setCompareResults(null);
  };

  const runComparison = async () => {
    if (selectedIds.length < 2) {
      setError('Select at least 2 deals to compare');
      return;
    }

    setIsComparing(true);
    setError(null);

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealIds: selectedIds }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to compare deals');
      }

      const result = await response.json();
      setCompareResults(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Comparison failed');
    } finally {
      setIsComparing(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'buy': return 'text-green-600 bg-green-100';
      case 'skip': return 'text-red-600 bg-red-100';
      case 'watch': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getBestValue = (results: CompareResult[], getValue: (r: CompareResult) => number, higherIsBetter = true) => {
    const values = results.map(getValue);
    const best = higherIsBetter ? Math.max(...values) : Math.min(...values);
    return values.map(v => v === best);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Compare Deals</h1>
        <p className="text-gray-500">Select 2-4 analyzed deals to compare side-by-side</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Deal Selection */}
      {!compareResults && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Deals to Compare</CardTitle>
          </CardHeader>
          <CardContent>
            {deals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No analyzed deals found.</p>
                <Link href="/deals">
                  <Button>Go to Deals</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {deals.map((deal) => (
                    <div
                      key={deal.id}
                      onClick={() => toggleDealSelection(deal.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedIds.includes(deal.id)
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{deal.address}</p>
                          <p className="text-sm text-gray-500">{deal.city}, {deal.state}</p>
                          <p className="text-sm font-semibold mt-1">{formatCurrency(deal.purchasePrice)}</p>
                        </div>
                        {deal.verdict && (
                          <span className={`px-2 py-1 rounded text-xs font-bold ${getVerdictColor(deal.verdict)}`}>
                            {deal.verdict.toUpperCase()}
                          </span>
                        )}
                      </div>
                      {selectedIds.includes(deal.id) && (
                        <div className="mt-2 text-blue-600 text-sm font-medium">✓ Selected</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {selectedIds.length} of 4 deals selected (min 2)
                  </p>
                  <Button
                    onClick={runComparison}
                    disabled={selectedIds.length < 2 || isComparing}
                  >
                    {isComparing ? 'Comparing...' : 'Compare Selected'}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Comparison Results */}
      {compareResults && (
        <>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Comparison Results</h2>
            <Button variant="outline" onClick={() => setCompareResults(null)}>
              ← Select Different Deals
            </Button>
          </div>

          {/* Verdict Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {compareResults.map((result) => (
              <Card key={result.deal.id} className="text-center">
                <CardContent className="pt-4">
                  <p className="font-medium text-sm truncate">{result.deal.address}</p>
                  <p className="text-xs text-gray-500">{result.deal.city}</p>
                  <div className={`mt-2 px-3 py-1 rounded-full inline-block ${getVerdictColor(result.verdict)}`}>
                    <span className="font-bold">{result.verdict.toUpperCase()}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{result.verdictReason}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Side-by-Side Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-2 font-semibold">Metric</th>
                      {compareResults.map((result) => (
                        <th key={result.deal.id} className="text-right py-3 px-2 font-semibold">
                          <div className="truncate max-w-[150px]">{result.deal.address}</div>
                          <div className="text-xs font-normal text-gray-500">{result.deal.city}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Purchase Price */}
                    <tr className="border-b">
                      <td className="py-2 px-2 font-medium">Purchase Price</td>
                      {compareResults.map((result, i) => {
                        const isBest = getBestValue(compareResults, r => r.deal.purchasePrice, false)[i];
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-semibold' : ''}`}>
                            {formatCurrency(result.deal.purchasePrice)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Initial Equity */}
                    <tr className="border-b">
                      <td className="py-2 px-2 font-medium">Initial Equity</td>
                      {compareResults.map((result, i) => {
                        const isBest = getBestValue(compareResults, r => r.modelOutput.resultsByHorizon.year7.initialEquity, false)[i];
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-semibold' : ''}`}>
                            {formatCurrency(result.modelOutput.resultsByHorizon.year7.initialEquity)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* 7-Year IRR */}
                    <tr className="border-b bg-blue-50">
                      <td className="py-2 px-2 font-medium">7-Year IRR</td>
                      {compareResults.map((result, i) => {
                        const isBest = getBestValue(compareResults, r => r.modelOutput.resultsByHorizon.year7.irr)[i];
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-bold' : 'font-semibold'}`}>
                            {formatPercent(result.modelOutput.resultsByHorizon.year7.irr)}
                            {isBest && ' ★'}
                          </td>
                        );
                      })}
                    </tr>

                    {/* 5-Year IRR */}
                    <tr className="border-b">
                      <td className="py-2 px-2 font-medium">5-Year IRR</td>
                      {compareResults.map((result, i) => {
                        const isBest = getBestValue(compareResults, r => r.modelOutput.resultsByHorizon.year5.irr)[i];
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-semibold' : ''}`}>
                            {formatPercent(result.modelOutput.resultsByHorizon.year5.irr)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* 10-Year IRR */}
                    <tr className="border-b">
                      <td className="py-2 px-2 font-medium">10-Year IRR</td>
                      {compareResults.map((result, i) => {
                        const isBest = getBestValue(compareResults, r => r.modelOutput.resultsByHorizon.year10.irr)[i];
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-semibold' : ''}`}>
                            {formatPercent(result.modelOutput.resultsByHorizon.year10.irr)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Equity Multiple */}
                    <tr className="border-b bg-blue-50">
                      <td className="py-2 px-2 font-medium">7-Year Multiple</td>
                      {compareResults.map((result, i) => {
                        const isBest = getBestValue(compareResults, r => r.modelOutput.resultsByHorizon.year7.equityMultiple)[i];
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-bold' : 'font-semibold'}`}>
                            {result.modelOutput.resultsByHorizon.year7.equityMultiple.toFixed(2)}x
                            {isBest && ' ★'}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Total Return */}
                    <tr className="border-b">
                      <td className="py-2 px-2 font-medium">7-Year Total Return</td>
                      {compareResults.map((result, i) => {
                        const isBest = getBestValue(compareResults, r => r.modelOutput.resultsByHorizon.year7.totalReturn)[i];
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-semibold' : ''}`}>
                            {formatCurrency(result.modelOutput.resultsByHorizon.year7.totalReturn)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* vs REIT */}
                    <tr className="border-b bg-blue-50">
                      <td className="py-2 px-2 font-medium">vs REIT Baseline</td>
                      {compareResults.map((result, i) => {
                        const isBest = getBestValue(compareResults, r => r.modelOutput.resultsByHorizon.year7.reitComparison)[i];
                        const value = result.modelOutput.resultsByHorizon.year7.reitComparison;
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-bold' : value < 0 ? 'text-red-600' : ''}`}>
                            {value > 0 ? '+' : ''}{formatPercent(value)}
                            {isBest && ' ★'}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Year 1 Cash Flow */}
                    <tr className="border-b">
                      <td className="py-2 px-2 font-medium">Year 1 Cash Flow</td>
                      {compareResults.map((result, i) => {
                        const year1 = result.modelOutput.resultsByYear.find(y => y.year === 1);
                        const cf = year1?.cashFlowAfterTax ?? 0;
                        const isBest = getBestValue(compareResults, r => r.modelOutput.resultsByYear.find(y => y.year === 1)?.cashFlowAfterTax ?? 0)[i];
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-semibold' : cf < 0 ? 'text-red-600' : ''}`}>
                            {formatCurrency(cf)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Year 1 NOI */}
                    <tr className="border-b">
                      <td className="py-2 px-2 font-medium">Year 1 NOI</td>
                      {compareResults.map((result, i) => {
                        const year1 = result.modelOutput.resultsByYear.find(y => y.year === 1);
                        const isBest = getBestValue(compareResults, r => r.modelOutput.resultsByYear.find(y => y.year === 1)?.noi ?? 0)[i];
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-semibold' : ''}`}>
                            {formatCurrency(year1?.noi ?? 0)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Cap Rate */}
                    <tr className="border-b">
                      <td className="py-2 px-2 font-medium">Cap Rate</td>
                      {compareResults.map((result, i) => {
                        const year1 = result.modelOutput.resultsByYear.find(y => y.year === 1);
                        const capRate = (year1?.noi ?? 0) / result.deal.purchasePrice;
                        const isBest = getBestValue(compareResults, r => {
                          const y1 = r.modelOutput.resultsByYear.find(y => y.year === 1);
                          return (y1?.noi ?? 0) / r.deal.purchasePrice;
                        })[i];
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-semibold' : ''}`}>
                            {formatPercent(capRate)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Monthly Rent */}
                    <tr className="border-b">
                      <td className="py-2 px-2 font-medium">Monthly Rent</td>
                      {compareResults.map((result, i) => {
                        const isBest = getBestValue(compareResults, r => r.deal.monthlyRent)[i];
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-semibold' : ''}`}>
                            {formatCurrency(result.deal.monthlyRent)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Gross Yield */}
                    <tr className="border-b">
                      <td className="py-2 px-2 font-medium">Gross Yield</td>
                      {compareResults.map((result, i) => {
                        const grossYield = (result.deal.monthlyRent * 12) / result.deal.purchasePrice;
                        const isBest = getBestValue(compareResults, r => (r.deal.monthlyRent * 12) / r.deal.purchasePrice)[i];
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-semibold' : ''}`}>
                            {formatPercent(grossYield)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Data Gaps */}
                    <tr className="border-b">
                      <td className="py-2 px-2 font-medium">Data Gaps</td>
                      {compareResults.map((result, i) => {
                        const highGaps = result.modelOutput.dataGaps.filter(g => g.impact === 'high').length;
                        const isBest = getBestValue(compareResults, r => r.modelOutput.dataGaps.filter(g => g.impact === 'high').length, false)[i];
                        return (
                          <td key={result.deal.id} className={`text-right py-2 px-2 ${isBest ? 'text-green-600 font-semibold' : highGaps > 0 ? 'text-amber-600' : ''}`}>
                            {highGaps > 0 ? `${highGaps} HIGH` : 'None'}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                <strong>★</strong> = Best value in category | <span className="text-green-600">Green</span> = Best performing
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="mt-6 flex gap-4">
            {compareResults.map((result) => (
              <Link key={result.deal.id} href={`/deals/${result.deal.id}/analyze`}>
                <Button variant="outline" size="sm">
                  View {result.deal.address.substring(0, 20)}...
                </Button>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
