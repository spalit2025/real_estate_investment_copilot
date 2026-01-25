/**
 * PDF Document for Investment Memo
 * Uses @react-pdf/renderer for PDF generation
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { Deal } from '@/types/deal';
import type { ModelOutput, YearResult, HorizonResult } from '@/types/model';
import type { MemoNarrative } from '@/lib/ai';

// Define styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #2563eb',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  verdictBanner: {
    padding: 12,
    marginBottom: 20,
    borderRadius: 4,
  },
  verdictBuy: {
    backgroundColor: '#dcfce7',
    borderLeft: '4 solid #22c55e',
  },
  verdictSkip: {
    backgroundColor: '#fee2e2',
    borderLeft: '4 solid #ef4444',
  },
  verdictWatch: {
    backgroundColor: '#fef9c3',
    borderLeft: '4 solid #eab308',
  },
  verdictLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  verdictReason: {
    fontSize: 11,
    color: '#374151',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    borderBottom: '1 solid #e5e7eb',
    paddingBottom: 4,
  },
  table: {
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e5e7eb',
    paddingVertical: 6,
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    paddingHorizontal: 4,
  },
  tableCellRight: {
    flex: 1,
    paddingHorizontal: 4,
    textAlign: 'right',
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#374151',
    marginBottom: 4,
  },
  bulletList: {
    marginLeft: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 12,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#374151',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metricBox: {
    width: '23%',
    padding: 8,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTop: '1 solid #e5e7eb',
    paddingTop: 10,
  },
  riskHigh: {
    backgroundColor: '#fee2e2',
    padding: 6,
    marginBottom: 4,
    borderRadius: 2,
  },
  riskMedium: {
    backgroundColor: '#fef9c3',
    padding: 6,
    marginBottom: 4,
    borderRadius: 2,
  },
  riskLow: {
    backgroundColor: '#dbeafe',
    padding: 6,
    marginBottom: 4,
    borderRadius: 2,
  },
});

// Helper functions
const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value: number): string =>
  `${(value * 100).toFixed(1)}%`;

interface MemoPDFProps {
  deal: Deal;
  modelOutput: ModelOutput;
  verdict: 'buy' | 'skip' | 'watch';
  verdictReason: string;
  narrative?: MemoNarrative;
}

export function MemoPDF({
  deal,
  modelOutput,
  verdict,
  verdictReason,
  narrative,
}: MemoPDFProps) {
  const { resultsByYear, resultsByHorizon, sensitivityRuns, dataGaps } = modelOutput;
  const h7 = resultsByHorizon.year7;

  const getVerdictStyle = () => {
    switch (verdict) {
      case 'buy':
        return styles.verdictBuy;
      case 'skip':
        return styles.verdictSkip;
      case 'watch':
        return styles.verdictWatch;
    }
  };

  const getVerdictColor = () => {
    switch (verdict) {
      case 'buy':
        return '#15803d';
      case 'skip':
        return '#dc2626';
      case 'watch':
        return '#ca8a04';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Investment Memo</Text>
          <Text style={styles.subtitle}>
            {deal.address}, {deal.city}, {deal.state} {deal.zip}
          </Text>
          <Text style={styles.subtitle}>
            {deal.propertyType.toUpperCase()} | {deal.beds}bd/{deal.baths}ba | {deal.sqft} sqft | Built {deal.yearBuilt}
          </Text>
        </View>

        {/* Verdict Banner */}
        <View style={[styles.verdictBanner, getVerdictStyle()]}>
          <Text style={[styles.verdictLabel, { color: getVerdictColor() }]}>
            {verdict.toUpperCase()}
          </Text>
          <Text style={styles.verdictReason}>{verdictReason}</Text>
        </View>

        {/* Key Metrics Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Purchase Price</Text>
            <Text style={styles.metricValue}>{formatCurrency(deal.purchasePrice)}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>7-Year IRR</Text>
            <Text style={styles.metricValue}>{formatPercent(h7.irr)}</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>Equity Multiple</Text>
            <Text style={styles.metricValue}>{h7.equityMultiple.toFixed(2)}x</Text>
          </View>
          <View style={styles.metricBox}>
            <Text style={styles.metricLabel}>vs REIT</Text>
            <Text style={styles.metricValue}>
              {h7.reitComparison > 0 ? '+' : ''}{formatPercent(h7.reitComparison)}
            </Text>
          </View>
        </View>

        {/* AI Executive Summary (if available) */}
        {narrative?.executiveSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.text}>{narrative.executiveSummary}</Text>
          </View>
        )}

        {/* Investment Returns Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Investment Returns</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Horizon</Text>
              <Text style={styles.tableCellRight}>IRR</Text>
              <Text style={styles.tableCellRight}>Multiple</Text>
              <Text style={styles.tableCellRight}>Total Return</Text>
              <Text style={styles.tableCellRight}>vs REIT</Text>
            </View>
            {[
              { label: '5-Year', data: resultsByHorizon.year5 },
              { label: '7-Year', data: resultsByHorizon.year7 },
              { label: '10-Year', data: resultsByHorizon.year10 },
            ].map(({ label, data }) => (
              <View key={label} style={styles.tableRow}>
                <Text style={styles.tableCell}>{label}</Text>
                <Text style={styles.tableCellRight}>{formatPercent(data.irr)}</Text>
                <Text style={styles.tableCellRight}>{data.equityMultiple.toFixed(2)}x</Text>
                <Text style={styles.tableCellRight}>{formatCurrency(data.totalReturn)}</Text>
                <Text style={styles.tableCellRight}>
                  {data.reitComparison > 0 ? '+' : ''}{formatPercent(data.reitComparison)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Two-column layout for Highlights and Concerns */}
        {narrative && (narrative.investmentHighlights.length > 0 || narrative.keyConcerns.length > 0) && (
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Investment Highlights</Text>
                <View style={styles.bulletList}>
                  {narrative.investmentHighlights.map((item, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            <View style={styles.column}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Key Concerns</Text>
                <View style={styles.bulletList}>
                  {narrative.keyConcerns.map((item, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.bulletText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Key Assumptions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Assumptions</Text>
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Text style={styles.text}>• Down Payment: {formatPercent(deal.downPaymentPct)}</Text>
              <Text style={styles.text}>• Interest Rate: {formatPercent(deal.interestRate)}</Text>
              <Text style={styles.text}>• Loan Term: {deal.loanTermYears} years</Text>
              <Text style={styles.text}>• Monthly Rent: {formatCurrency(deal.monthlyRent)}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.text}>• Vacancy: {formatPercent(deal.vacancyPct)}</Text>
              <Text style={styles.text}>• Rent Growth: {formatPercent(deal.rentGrowthPct)}/yr</Text>
              <Text style={styles.text}>• Appreciation: {formatPercent(deal.appreciationPct)}/yr</Text>
              <Text style={styles.text}>• Selling Costs: {formatPercent(deal.sellingCostsPct)}</Text>
            </View>
          </View>
        </View>

        {/* Risk Notes */}
        {dataGaps.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Data Gaps & Risks</Text>
            {dataGaps.slice(0, 5).map((gap, i) => (
              <View
                key={i}
                style={
                  gap.impact === 'high'
                    ? styles.riskHigh
                    : gap.impact === 'medium'
                    ? styles.riskMedium
                    : styles.riskLow
                }
              >
                <Text style={styles.text}>
                  <Text style={{ fontWeight: 'bold' }}>{gap.impact.toUpperCase()}: </Text>
                  {gap.field} - {gap.recommendation}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Recommendation */}
        {narrative?.recommendation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendation</Text>
            <Text style={styles.text}>{narrative.recommendation}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by RE Investment Copilot | {new Date().toLocaleDateString()} | For informational purposes only
        </Text>
      </Page>

      {/* Page 2: Detailed Cash Flow */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Year-by-Year Cash Flow</Text>
          <Text style={styles.subtitle}>
            {deal.address}, {deal.city}, {deal.state}
          </Text>
        </View>

        {/* Cash Flow Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, { width: 30 }]}>Year</Text>
            <Text style={styles.tableCellRight}>Gross Rent</Text>
            <Text style={styles.tableCellRight}>NOI</Text>
            <Text style={styles.tableCellRight}>Debt Service</Text>
            <Text style={styles.tableCellRight}>CF After Tax</Text>
            <Text style={styles.tableCellRight}>Property Value</Text>
          </View>
          {resultsByYear.map((year) => (
            <View key={year.year} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: 30 }]}>{year.year}</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(year.grossRent)}</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(year.noi)}</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(year.debtService)}</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(year.cashFlowAfterTax)}</Text>
              <Text style={styles.tableCellRight}>{formatCurrency(year.propertyValue)}</Text>
            </View>
          ))}
        </View>

        {/* Sensitivity Analysis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sensitivity Analysis (7-Year IRR)</Text>
          <View style={styles.twoColumn}>
            <View style={styles.column}>
              <Text style={[styles.text, { fontWeight: 'bold' }]}>Rent Sensitivity:</Text>
              {sensitivityRuns
                .filter((s) => s.variable === 'rent')
                .sort((a, b) => a.delta - b.delta)
                .map((s) => (
                  <Text key={`rent-${s.delta}`} style={styles.text}>
                    {s.delta === 0 ? 'Base' : `${s.delta > 0 ? '+' : ''}${formatPercent(s.delta)}`}: {formatPercent(s.irr7)}
                  </Text>
                ))}
            </View>
            <View style={styles.column}>
              <Text style={[styles.text, { fontWeight: 'bold' }]}>Appreciation Sensitivity:</Text>
              {sensitivityRuns
                .filter((s) => s.variable === 'appreciation')
                .sort((a, b) => a.delta - b.delta)
                .map((s) => (
                  <Text key={`app-${s.delta}`} style={styles.text}>
                    {s.delta === 0 ? 'Base' : `${s.delta > 0 ? '+' : ''}${formatPercent(s.delta)}`}: {formatPercent(s.irr7)}
                  </Text>
                ))}
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Generated by RE Investment Copilot | {new Date().toLocaleDateString()} | For informational purposes only
        </Text>
      </Page>
    </Document>
  );
}
