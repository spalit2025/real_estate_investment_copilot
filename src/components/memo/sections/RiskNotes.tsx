'use client';

/**
 * Risk Notes section - highlights key risks based on deal characteristics
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Deal } from '@/types/deal';
import type { ModelOutput } from '@/types/model';

interface RiskNotesProps {
  deal: Deal;
  modelOutput: ModelOutput;
}

export function RiskNotes({ deal, modelOutput }: RiskNotesProps) {
  const risks: { level: 'high' | 'medium' | 'low'; text: string }[] = [];

  // Check for rent control
  if (deal.isRentControlled) {
    risks.push({
      level: 'high',
      text: 'Property is rent controlled - rent growth may be limited by local ordinances',
    });
  }

  // Check for HOA rental restrictions
  if (deal.hasHOARentalLimit) {
    risks.push({
      level: 'high',
      text: 'HOA has rental restrictions - verify rental cap and waitlist requirements',
    });
  }

  // Check for high vacancy assumption
  if (deal.vacancyPct < 0.03) {
    risks.push({
      level: 'medium',
      text: 'Vacancy assumption is aggressive (<3%) - consider increasing for conservative analysis',
    });
  }

  // Check for high appreciation assumption
  if (deal.appreciationPct > 0.05) {
    risks.push({
      level: 'medium',
      text: `Appreciation assumption of ${(deal.appreciationPct * 100).toFixed(1)}% is above historical average`,
    });
  }

  // Check for negative cash flow
  const year1 = modelOutput.resultsByYear.find((y) => y.year === 1);
  if (year1 && year1.cashFlowAfterTax < 0) {
    risks.push({
      level: 'high',
      text: `Negative cash flow in Year 1: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(year1.cashFlowAfterTax)}`,
    });
  }

  // Check for low down payment (PMI risk)
  if (deal.downPaymentPct < 0.20) {
    risks.push({
      level: 'medium',
      text: 'Down payment <20% - private mortgage insurance (PMI) may apply',
    });
  }

  // Check for ARM
  if (deal.isARM) {
    risks.push({
      level: 'medium',
      text: 'Adjustable rate mortgage - payments may increase after initial fixed period',
    });
  }

  // Check property age
  if (deal.yearBuilt > 0 && new Date().getFullYear() - deal.yearBuilt > 30) {
    risks.push({
      level: 'low',
      text: `Property is ${new Date().getFullYear() - deal.yearBuilt} years old - higher maintenance and CapEx likely`,
    });
  }

  // Check for known CapEx issues
  if (deal.knownCapex && deal.knownCapex.trim().length > 0) {
    risks.push({
      level: 'medium',
      text: `Known CapEx issues: ${deal.knownCapex}`,
    });
  }

  // Check cash-on-cash return
  if (year1) {
    const initialEquity = modelOutput.resultsByHorizon.year5.initialEquity;
    const cashOnCash = year1.cashFlowAfterTax / initialEquity;
    if (cashOnCash < 0.04) {
      risks.push({
        level: 'medium',
        text: `Year 1 cash-on-cash return is ${(cashOnCash * 100).toFixed(1)}% - below typical 4-6% target`,
      });
    }
  }

  const getLevelStyles = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (risks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600">No significant risks identified based on deal characteristics.</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by level (high first)
  const sortedRisks = [...risks].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.level] - order[b.level];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {sortedRisks.map((risk, index) => (
            <li
              key={index}
              className={`p-3 rounded-lg border ${getLevelStyles(risk.level)}`}
            >
              <span className="font-semibold uppercase text-xs mr-2">{risk.level}</span>
              {risk.text}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
