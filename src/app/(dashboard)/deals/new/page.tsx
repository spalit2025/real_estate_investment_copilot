'use client';

/**
 * New deal creation page
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DealForm } from '@/components/forms/DealForm';
import type { DealFormValues } from '@/lib/validations/deal';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function NewDealPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: DealFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create deal');
      }

      const deal = await response.json();
      router.push(`/deals/${deal.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Deal</h1>
        <p className="text-gray-500">Enter property details for investment analysis</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <DealForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Create Deal"
      />
    </div>
  );
}
