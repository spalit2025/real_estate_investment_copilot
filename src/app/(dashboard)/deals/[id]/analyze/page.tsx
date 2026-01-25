'use client';

/**
 * Deal analysis page - runs model and displays investment memo
 */

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { MemoView } from '@/components/memo';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Deal } from '@/types/deal';
import type { ModelOutput } from '@/types/model';
import type { MemoNarrative } from '@/lib/ai';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface AnalysisResult {
  deal: Deal;
  modelOutput: ModelOutput;
  verdict: 'buy' | 'skip' | 'watch';
  verdictReason: string;
  narrative?: MemoNarrative;
}

export default function AnalyzePage({ params }: PageProps) {
  const { id } = use(params);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingNarrative, setIsGeneratingNarrative] = useState(false);
  const [isExporting, setIsExporting] = useState<'pdf' | 'markdown' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDealAndAnalyze();
  }, [id]);

  const exportPDF = async () => {
    setIsExporting('pdf');
    try {
      const response = await fetch(`/api/export/pdf?dealId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'investment_memo.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export PDF');
    } finally {
      setIsExporting(null);
    }
  };

  const exportMarkdown = async () => {
    setIsExporting('markdown');
    try {
      const response = await fetch(`/api/export/markdown?dealId=${id}`);
      if (!response.ok) {
        throw new Error('Failed to generate Markdown');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition')?.split('filename=')[1]?.replace(/"/g, '') || 'investment_memo.md';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export Markdown');
    } finally {
      setIsExporting(null);
    }
  };

  const fetchDealAndAnalyze = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First fetch the deal to check if it exists
      const dealResponse = await fetch(`/api/deals/${id}`);
      if (!dealResponse.ok) {
        if (dealResponse.status === 404) {
          setError('Deal not found');
        } else {
          throw new Error('Failed to fetch deal');
        }
        return;
      }

      const dealData = await dealResponse.json();
      setDeal(dealData);

      // Now run the analysis
      await runAnalysis();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to analyze deal');
      }

      const result = await response.json();
      setDeal(result.data.deal);
      setAnalysisResult(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateNarrative = async (regenerate = false) => {
    setIsGeneratingNarrative(true);
    setError(null);

    try {
      const response = await fetch('/api/memo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dealId: id, regenerate }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate AI insights');
      }

      const result = await response.json();
      setAnalysisResult((prev) => prev ? {
        ...prev,
        narrative: result.data.narrative,
      } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGeneratingNarrative(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading deal...</p>
        </div>
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Analysis</h1>
          <p className="text-gray-500">{deal.address}, {deal.city}, {deal.state}</p>
        </div>
        <div className="flex space-x-2">
          <Link href={`/deals/${id}`}>
            <Button variant="outline">View Deal</Button>
          </Link>
          <Button onClick={() => runAnalysis()} disabled={isAnalyzing}>
            {isAnalyzing ? 'Re-analyzing...' : 'Re-analyze'}
          </Button>
        </div>
      </div>

      {/* Export Buttons */}
      {analysisResult && (
        <div className="mb-6 flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportMarkdown}
            disabled={isExporting !== null}
          >
            {isExporting === 'markdown' ? 'Exporting...' : '📄 Export Markdown'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportPDF}
            disabled={isExporting !== null}
          >
            {isExporting === 'pdf' ? 'Exporting...' : '📑 Export PDF'}
          </Button>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading state for analysis */}
      {isAnalyzing && !analysisResult && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Running financial analysis...</p>
            <p className="text-sm text-gray-400 mt-2">Calculating IRR, cash flows, and sensitivity...</p>
          </div>
        </div>
      )}

      {/* AI Insights Button */}
      {analysisResult && !analysisResult.narrative && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-blue-900">Generate AI Insights</h3>
              <p className="text-sm text-blue-700">
                Get an AI-generated executive summary, highlights, and recommendations.
              </p>
            </div>
            <Button
              onClick={() => generateNarrative()}
              disabled={isGeneratingNarrative}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGeneratingNarrative ? (
                <>
                  <span className="animate-spin mr-2">⟳</span>
                  Generating...
                </>
              ) : (
                '✦ Generate AI Insights'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Regenerate AI option if narrative exists */}
      {analysisResult?.narrative && (
        <div className="mb-6 flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => generateNarrative(true)}
            disabled={isGeneratingNarrative}
          >
            {isGeneratingNarrative ? 'Regenerating...' : '↻ Regenerate AI Insights'}
          </Button>
        </div>
      )}

      {/* Loading state for narrative generation */}
      {isGeneratingNarrative && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Generating AI insights...</p>
          </div>
        </div>
      )}

      {/* Memo View */}
      {analysisResult && (
        <MemoView
          deal={analysisResult.deal}
          modelOutput={analysisResult.modelOutput}
          verdict={analysisResult.verdict}
          verdictReason={analysisResult.verdictReason}
          narrative={analysisResult.narrative}
        />
      )}
    </div>
  );
}
