'use client';

/**
 * Data Gaps section - highlights missing or unverified data
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { DataGap } from '@/types/model';

interface DataGapsProps {
  gaps: DataGap[];
}

export function DataGaps({ gaps }: DataGapsProps) {
  if (gaps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Data Gaps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600">All required data has been provided.</p>
        </CardContent>
      </Card>
    );
  }

  const getImpactStyles = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Sort by impact
  const sortedGaps = [...gaps].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.impact] - order[b.impact];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Gaps</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-4">
          The following data was not provided and defaults were used. Verify these values for more accurate analysis.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4">Field</th>
                <th className="text-left py-2 px-4">Default Used</th>
                <th className="text-left py-2 px-4">Impact</th>
                <th className="text-left py-2 pl-4">Recommendation</th>
              </tr>
            </thead>
            <tbody>
              {sortedGaps.map((gap, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2 pr-4 font-medium">{gap.field}</td>
                  <td className="py-2 px-4 text-gray-600">{gap.defaultUsed}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactStyles(gap.impact)}`}>
                      {gap.impact.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 pl-4 text-gray-600 text-sm">{gap.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
