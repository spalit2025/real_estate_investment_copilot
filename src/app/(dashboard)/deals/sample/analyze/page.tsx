'use client';

/**
 * Sample deal analysis page
 * Runs the financial model client-side on a pre-loaded deal — no API or DB needed
 */

import { useMemo } from 'react';
import Link from 'next/link';
import { MemoView } from '@/components/memo';
import { Button } from '@/components/ui/button';
import { SAMPLE_DEAL } from '@/config/sample-deal';
import { runModel, determineVerdict } from '@/lib/model';

export default function SampleAnalyzePage() {
  const { modelOutput, verdict, verdictReason } = useMemo(() => {
    const output = runModel(SAMPLE_DEAL);
    const { verdict: v, driver } = determineVerdict(
      output.resultsByHorizon.year7,
      output.dataGaps
    );
    return { modelOutput: output, verdict: v, verdictReason: driver };
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sample Investment Analysis</h1>
          <p className="text-gray-500">
            {SAMPLE_DEAL.address}, {SAMPLE_DEAL.city}, {SAMPLE_DEAL.state}
          </p>
          <p className="text-sm text-gray-400 mt-1">
            This is a pre-loaded demo. All calculations run client-side.
          </p>
        </div>
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>

      {/* Memo View */}
      <MemoView
        deal={SAMPLE_DEAL}
        modelOutput={modelOutput}
        verdict={verdict}
        verdictReason={verdictReason}
      />
    </div>
  );
}
