'use client';

/**
 * Next Steps section - recommended actions and diligence questions
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Deal } from '@/types/deal';

interface NextStepsProps {
  deal: Deal;
  verdict: 'buy' | 'skip' | 'watch';
}

export function NextSteps({ deal, verdict }: NextStepsProps) {
  // Generate context-specific diligence questions
  const diligenceQuestions: string[] = [];

  // Always include these
  diligenceQuestions.push('Verify the property condition with a professional inspection');
  diligenceQuestions.push('Confirm rental income with current lease agreements or market comps');

  // Context-specific questions
  if (deal.propertyType === 'condo' || deal.hoaMonthly > 0) {
    diligenceQuestions.push('Review HOA financials, reserves, and any pending special assessments');
  }

  if (deal.yearBuilt > 0 && new Date().getFullYear() - deal.yearBuilt > 20) {
    diligenceQuestions.push('Get estimates for major systems (roof, HVAC, plumbing, electrical)');
  }

  if (deal.isRentControlled) {
    diligenceQuestions.push('Review local rent control ordinance and allowable annual increases');
  }

  if (deal.propertyTaxAnnual === 0) {
    diligenceQuestions.push('Verify property tax amount with county assessor');
  }

  if (deal.insuranceAnnual === 0) {
    diligenceQuestions.push('Get insurance quotes, especially for flood/earthquake if applicable');
  }

  // Add market-specific questions
  if (deal.marketTag === 'bay_area_appreciation') {
    diligenceQuestions.push('Research local zoning changes or development that may affect value');
  } else {
    diligenceQuestions.push('Verify rental demand and vacancy rates in the specific submarket');
  }

  const getVerdictNextSteps = () => {
    switch (verdict) {
      case 'buy':
        return [
          'Schedule property inspection',
          'Lock in financing terms with lender',
          'Prepare purchase offer with appropriate contingencies',
          'Set up property management if not self-managing',
        ];
      case 'watch':
        return [
          'Monitor listing for price reductions',
          'Research comparable sales to establish fair value',
          'Track local market trends for 30-60 days',
          'Consider submitting a lower offer to test seller motivation',
        ];
      case 'skip':
        return [
          'Document reasons for skipping for future reference',
          'Continue searching for better opportunities',
          'Consider if any deal terms could change to make it viable',
        ];
      default:
        return [];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next Steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Recommended Actions</h4>
          <ol className="list-decimal list-inside space-y-2">
            {getVerdictNextSteps().map((step, index) => (
              <li key={index} className="text-gray-600">{step}</li>
            ))}
          </ol>
        </div>

        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Top Diligence Questions</h4>
          <ol className="list-decimal list-inside space-y-2">
            {diligenceQuestions.slice(0, 5).map((question, index) => (
              <li key={index} className="text-gray-600">{question}</li>
            ))}
          </ol>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Reminder:</strong> This analysis is based on the assumptions provided.
            Always verify key inputs before making investment decisions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
