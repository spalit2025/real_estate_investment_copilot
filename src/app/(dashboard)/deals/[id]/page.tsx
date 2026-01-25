'use client';

/**
 * Deal view/edit page
 */

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DealForm } from '@/components/forms/DealForm';
import type { DealFormValues } from '@/lib/validations/deal';
import type { Deal } from '@/types/deal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function DealPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchDeal();
  }, [id]);

  const fetchDeal = async () => {
    try {
      const response = await fetch(`/api/deals/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Deal not found');
        } else {
          throw new Error('Failed to fetch deal');
        }
        return;
      }
      const data = await response.json();
      setDeal(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (values: DealFormValues) => {
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update deal');
      }

      const updatedDeal = await response.json();
      setDeal(updatedDeal);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to archive this deal?')) return;

    try {
      const response = await fetch(`/api/deals/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deal');
      }

      router.push('/deals');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">Loading deal...</p>
      </div>
    );
  }

  if (error && !deal) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/deals">
            <Button variant="outline">Back to Deals</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!deal) return null;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const formatPercent = (value: number) =>
    `${(value * 100).toFixed(1)}%`;

  if (isEditing) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Deal</h1>
            <p className="text-gray-500">{deal.address}</p>
          </div>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DealForm
          initialValues={deal}
          onSubmit={handleUpdate}
          isLoading={isSaving}
          submitLabel="Save Changes"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{deal.address}</h1>
          <p className="text-gray-500">
            {deal.city}, {deal.state} {deal.zip}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button variant="outline" onClick={handleDelete}>
            Archive
          </Button>
          <Link href={`/deals/${id}/analyze`}>
            <Button>Analyze</Button>
          </Link>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Type</span>
              <span className="font-medium">{deal.propertyType.toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Market</span>
              <span className="font-medium">{deal.marketTag === 'bay_area_appreciation' ? 'Bay Area' : 'Cash Flow'}</span>
            </div>
            {deal.beds > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Beds / Baths</span>
                <span className="font-medium">{deal.beds} / {deal.baths}</span>
              </div>
            )}
            {deal.sqft > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Sq Ft</span>
                <span className="font-medium">{deal.sqft.toLocaleString()}</span>
              </div>
            )}
            {deal.yearBuilt > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Year Built</span>
                <span className="font-medium">{deal.yearBuilt}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Purchase & Financing */}
        <Card>
          <CardHeader>
            <CardTitle>Purchase & Financing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Purchase Price</span>
              <span className="font-medium">{formatCurrency(deal.purchasePrice)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Down Payment</span>
              <span className="font-medium">{formatPercent(deal.downPaymentPct)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Loan Amount</span>
              <span className="font-medium">{formatCurrency(deal.purchasePrice * (1 - deal.downPaymentPct))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Interest Rate</span>
              <span className="font-medium">{formatPercent(deal.interestRate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Loan Term</span>
              <span className="font-medium">{deal.loanTermYears} years</span>
            </div>
          </CardContent>
        </Card>

        {/* Income */}
        <Card>
          <CardHeader>
            <CardTitle>Income</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Monthly Rent</span>
              <span className="font-medium">{formatCurrency(deal.monthlyRent)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Annual Rent</span>
              <span className="font-medium">{formatCurrency(deal.monthlyRent * 12)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Vacancy</span>
              <span className="font-medium">{formatPercent(deal.vacancyPct)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Rent Growth</span>
              <span className="font-medium">{formatPercent(deal.rentGrowthPct)}/yr</span>
            </div>
          </CardContent>
        </Card>

        {/* Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Property Tax</span>
              <span className="font-medium">{formatCurrency(deal.propertyTaxAnnual)}/yr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Insurance</span>
              <span className="font-medium">{formatCurrency(deal.insuranceAnnual)}/yr</span>
            </div>
            {deal.hoaMonthly > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">HOA</span>
                <span className="font-medium">{formatCurrency(deal.hoaMonthly)}/mo</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Management</span>
              <span className="font-medium">{formatPercent(deal.managementPct)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Repairs + CapEx</span>
              <span className="font-medium">{formatPercent(deal.repairsPct + deal.capexPct)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Exit */}
        <Card>
          <CardHeader>
            <CardTitle>Exit Assumptions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Appreciation</span>
              <span className="font-medium">{formatPercent(deal.appreciationPct)}/yr</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Selling Costs</span>
              <span className="font-medium">{formatPercent(deal.sellingCostsPct)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Constraints */}
        <Card>
          <CardHeader>
            <CardTitle>Constraints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Rent Controlled</span>
              <span className="font-medium">{deal.isRentControlled ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">HOA Rental Limit</span>
              <span className="font-medium">{deal.hasHOARentalLimit ? 'Yes' : 'No'}</span>
            </div>
            {deal.knownCapex && (
              <div className="mt-2">
                <span className="text-gray-500">Known CapEx:</span>
                <p className="text-sm mt-1">{deal.knownCapex}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status */}
      <div className="mt-6 text-sm text-gray-500">
        Status: <span className="font-medium capitalize">{deal.status}</span>
        {deal.verdict && (
          <> · Verdict: <span className="font-medium capitalize">{deal.verdict}</span></>
        )}
      </div>
    </div>
  );
}
