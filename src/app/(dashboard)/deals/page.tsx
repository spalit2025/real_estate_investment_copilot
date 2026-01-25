'use client';

/**
 * Deals list page with tag filtering and portfolio summary
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Deal } from '@/types/deal';
import { PRESET_MARKET_TAGS } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Human-readable labels for preset tags
const MARKET_TAG_LABELS: Record<string, string> = {
  bay_area_appreciation: 'Bay Area / Appreciation',
  cash_flow_market: 'Cash Flow Market',
  midwest_value: 'Midwest Value',
  sunbelt_growth: 'Sunbelt Growth',
  coastal_premium: 'Coastal Premium',
  college_town: 'College Town',
  vacation_rental: 'Vacation Rental',
  untagged: 'Untagged',
};

interface PortfolioSummary {
  tag: string;
  count: number;
  totalValue: number;
  totalMonthlyRent: number;
  avgGrossYield: number;
  verdicts: {
    buy: number;
    skip: number;
    watch: number;
    pending: number;
  };
}

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // Portfolio summary
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary[]>([]);
  const [showSummary, setShowSummary] = useState(true);

  useEffect(() => {
    fetchTags();
    fetchPortfolioSummary();
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [selectedTag, selectedStatus]);

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/deals/tags');
      if (response.ok) {
        const data = await response.json();
        setAvailableTags(data.tags || []);
      }
    } catch (err) {
      console.error('Failed to fetch tags:', err);
    }
  };

  const fetchPortfolioSummary = async () => {
    try {
      const response = await fetch('/api/deals/portfolio');
      if (response.ok) {
        const data = await response.json();
        setPortfolioSummary(data.summary || []);
      }
    } catch (err) {
      console.error('Failed to fetch portfolio summary:', err);
    }
  };

  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedTag) params.append('marketTag', selectedTag);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(`/api/deals?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch deals');
      }
      const data = await response.json();
      setDeals(data.deals);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to archive this deal?')) return;

    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deal');
      }

      // Refresh list and summary
      fetchDeals();
      fetchPortfolioSummary();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) =>
    `${(value * 100).toFixed(1)}%`;

  const getTagLabel = (tag: string) =>
    MARKET_TAG_LABELS[tag] || tag.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  const getStatusBadge = (status: string, verdict?: string) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full';

    if (verdict) {
      const verdictColors: Record<string, string> = {
        buy: 'bg-green-100 text-green-800',
        skip: 'bg-red-100 text-red-800',
        watch: 'bg-yellow-100 text-yellow-800',
      };
      return (
        <span className={`${baseClasses} ${verdictColors[verdict] || 'bg-gray-100 text-gray-800'}`}>
          {verdict.toUpperCase()}
        </span>
      );
    }

    const statusColors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      analyzed: 'bg-blue-100 text-blue-800',
      archived: 'bg-gray-100 text-gray-500',
    };
    return (
      <span className={`${baseClasses} ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getTagBadge = (tag: string) => {
    const colors: Record<string, string> = {
      bay_area_appreciation: 'bg-purple-100 text-purple-800',
      cash_flow_market: 'bg-green-100 text-green-800',
      midwest_value: 'bg-blue-100 text-blue-800',
      sunbelt_growth: 'bg-orange-100 text-orange-800',
      coastal_premium: 'bg-cyan-100 text-cyan-800',
      college_town: 'bg-yellow-100 text-yellow-800',
      vacation_rental: 'bg-pink-100 text-pink-800',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded ${colors[tag] || 'bg-gray-100 text-gray-700'}`}>
        {getTagLabel(tag)}
      </span>
    );
  };

  // Calculate totals for portfolio
  const portfolioTotals = portfolioSummary.reduce(
    (acc, s) => ({
      count: acc.count + s.count,
      totalValue: acc.totalValue + s.totalValue,
      totalMonthlyRent: acc.totalMonthlyRent + s.totalMonthlyRent,
      buy: acc.buy + s.verdicts.buy,
      skip: acc.skip + s.verdicts.skip,
      watch: acc.watch + s.verdicts.watch,
      pending: acc.pending + s.verdicts.pending,
    }),
    { count: 0, totalValue: 0, totalMonthlyRent: 0, buy: 0, skip: 0, watch: 0, pending: 0 }
  );

  if (isLoading && deals.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading deals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Deals</h1>
          <p className="text-gray-500">
            {total} {total === 1 ? 'deal' : 'deals'} total
          </p>
        </div>
        <Link href="/deals/new">
          <Button>New Deal</Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Portfolio Summary */}
      {portfolioSummary.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Portfolio Summary</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSummary(!showSummary)}
              >
                {showSummary ? 'Hide' : 'Show'}
              </Button>
            </div>
          </CardHeader>
          {showSummary && (
            <CardContent>
              {/* Totals row */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Total Properties</p>
                    <p className="text-xl font-semibold">{portfolioTotals.count}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Value</p>
                    <p className="text-xl font-semibold">{formatCurrency(portfolioTotals.totalValue)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Monthly Rent</p>
                    <p className="text-xl font-semibold">{formatCurrency(portfolioTotals.totalMonthlyRent)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avg Gross Yield</p>
                    <p className="text-xl font-semibold">
                      {portfolioTotals.totalValue > 0
                        ? formatPercent((portfolioTotals.totalMonthlyRent * 12) / portfolioTotals.totalValue)
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Verdicts</p>
                    <div className="flex gap-2 text-sm">
                      <span className="text-green-600">{portfolioTotals.buy} BUY</span>
                      <span className="text-yellow-600">{portfolioTotals.watch} WATCH</span>
                      <span className="text-red-600">{portfolioTotals.skip} SKIP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* By tag breakdown */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Market Tag</th>
                      <th className="text-right py-2 font-medium">Deals</th>
                      <th className="text-right py-2 font-medium">Total Value</th>
                      <th className="text-right py-2 font-medium">Monthly Rent</th>
                      <th className="text-right py-2 font-medium">Gross Yield</th>
                      <th className="text-center py-2 font-medium">Verdicts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolioSummary.map((summary) => (
                      <tr
                        key={summary.tag}
                        className="border-b hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedTag(summary.tag === 'untagged' ? '' : summary.tag)}
                      >
                        <td className="py-2">{getTagBadge(summary.tag)}</td>
                        <td className="text-right py-2">{summary.count}</td>
                        <td className="text-right py-2">{formatCurrency(summary.totalValue)}</td>
                        <td className="text-right py-2">{formatCurrency(summary.totalMonthlyRent)}</td>
                        <td className="text-right py-2">{formatPercent(summary.avgGrossYield)}</td>
                        <td className="text-center py-2">
                          <div className="flex justify-center gap-2 text-xs">
                            {summary.verdicts.buy > 0 && (
                              <span className="text-green-600">{summary.verdicts.buy} BUY</span>
                            )}
                            {summary.verdicts.watch > 0 && (
                              <span className="text-yellow-600">{summary.verdicts.watch} WATCH</span>
                            )}
                            {summary.verdicts.skip > 0 && (
                              <span className="text-red-600">{summary.verdicts.skip} SKIP</span>
                            )}
                            {summary.verdicts.pending > 0 && (
                              <span className="text-gray-500">{summary.verdicts.pending} pending</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-48">
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger>
              <SelectValue placeholder="All Tags" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tags</SelectItem>
              {/* Show preset tags that exist in the user's deals */}
              {PRESET_MARKET_TAGS.filter(tag => availableTags.includes(tag)).map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {getTagLabel(tag)}
                </SelectItem>
              ))}
              {/* Show custom tags that aren't presets */}
              {availableTags
                .filter(tag => !PRESET_MARKET_TAGS.includes(tag as typeof PRESET_MARKET_TAGS[number]))
                .map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {getTagLabel(tag)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="analyzed">Analyzed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {(selectedTag || selectedStatus) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedTag('');
              setSelectedStatus('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Deals List */}
      {deals.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            {selectedTag || selectedStatus ? (
              <p className="text-gray-500 mb-4">No deals match your filters.</p>
            ) : (
              <>
                <p className="text-gray-500 mb-4">No deals yet. Create your first deal to get started.</p>
                <Link href="/deals/new">
                  <Button>Create Deal</Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {deals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Link
                        href={`/deals/${deal.id}`}
                        className="text-lg font-medium text-gray-900 hover:text-blue-600"
                      >
                        {deal.address}
                      </Link>
                      {getStatusBadge(deal.status, deal.verdict)}
                      {deal.marketTag && getTagBadge(deal.marketTag)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {deal.city}, {deal.state} · {deal.propertyType.toUpperCase()} ·{' '}
                      {formatCurrency(deal.purchasePrice)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(deal.monthlyRent)}/mo rent ·{' '}
                      {((deal.monthlyRent * 12 / deal.purchasePrice) * 100).toFixed(1)}% gross yield
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/deals/${deal.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                    {deal.status !== 'archived' && (
                      <>
                        <Link href={`/deals/${deal.id}/analyze`}>
                          <Button size="sm">Analyze</Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(deal.id)}
                        >
                          Archive
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
