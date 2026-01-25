'use client';

/**
 * AI Insights section - displays AI-generated narrative
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { MemoNarrative } from '@/lib/ai';

interface AIInsightsProps {
  narrative: MemoNarrative;
}

export function AIInsights({ narrative }: AIInsightsProps) {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="border-l-4 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-blue-600">✦</span>
            Executive Summary
            <span className="text-xs font-normal text-gray-400 ml-2">AI Generated</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{narrative.executiveSummary}</p>
        </CardContent>
      </Card>

      {/* Two-column layout for highlights and concerns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Investment Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Investment Highlights</CardTitle>
          </CardHeader>
          <CardContent>
            {narrative.investmentHighlights.length > 0 ? (
              <ul className="space-y-2">
                {narrative.investmentHighlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No highlights identified</p>
            )}
          </CardContent>
        </Card>

        {/* Key Concerns */}
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-700">Key Concerns</CardTitle>
          </CardHeader>
          <CardContent>
            {narrative.keyConcerns.length > 0 ? (
              <ul className="space-y-2">
                {narrative.keyConcerns.map((concern, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-amber-600 mt-1">⚠</span>
                    <span className="text-gray-700">{concern}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 italic">No significant concerns identified</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sensitivity Insights */}
      {narrative.sensitivityInsights && (
        <Card>
          <CardHeader>
            <CardTitle>Sensitivity Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {narrative.sensitivityInsights}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recommendation */}
      {narrative.recommendation && (
        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {narrative.recommendation}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Timestamp */}
      <p className="text-xs text-gray-400 text-right">
        Analysis generated: {new Date(narrative.generatedAt).toLocaleString()}
      </p>
    </div>
  );
}
