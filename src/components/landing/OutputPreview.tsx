export function OutputPreview() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            See What You'll Get
          </h2>
        </div>

        {/* Sample memo */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gray-900 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">INVESTMENT MEMO</p>
                  <h3 className="text-xl font-bold">123 Oak Street, Austin, TX</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
                    BUY
                  </span>
                  <span className="text-xs text-gray-400">← Clear verdict</span>
                </div>
              </div>
              <p className="mt-3 text-gray-300 text-sm">
                Primary Driver: Strong rent yield with moderate appreciation in growing submarket
              </p>
            </div>

            {/* Returns by horizon */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-semibold text-gray-900">RETURNS BY HORIZON</h4>
                <span className="text-xs text-gray-500">← Multiple exit scenarios</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { horizon: "5-Year", irr: "11.2%", multiple: "1.7x" },
                  { horizon: "7-Year", irr: "14.2%", multiple: "2.1x" },
                  { horizon: "10-Year", irr: "15.8%", multiple: "2.8x" },
                ].map((period) => (
                  <div key={period.horizon} className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">{period.horizon}</p>
                    <p className="text-2xl font-bold text-green-600">{period.irr}</p>
                    <p className="text-sm text-gray-500">{period.multiple}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-blue-600">
                vs. REIT Baseline: +6.3% at 7 years
              </p>
            </div>

            {/* Sensitivity Analysis */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-semibold text-gray-900">SENSITIVITY ANALYSIS</h4>
                <span className="text-xs text-gray-500">← Know your downside</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Rent -10%</p>
                    <p className="font-semibold text-amber-600">9.8% IRR</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Appreciation -2%</p>
                    <p className="font-semibold text-amber-600">10.1% IRR</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Vacancy +5%</p>
                    <p className="font-semibold text-amber-600">11.5% IRR</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Notes */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-semibold text-gray-900">RISK NOTES</h4>
                <span className="text-xs text-gray-500">← Nothing hidden</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  Property is 35 years old — budget for roof
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  HOA has rental restrictions — verify terms
                </li>
              </ul>
            </div>

            {/* Next Steps */}
            <div className="p-6 bg-blue-50">
              <div className="flex items-center gap-2 mb-4">
                <h4 className="font-semibold text-gray-900">NEXT STEPS</h4>
                <span className="text-xs text-gray-500">← Actionable</span>
              </div>
              <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                <li>Verify actual rent comps (Zillow shows $2,400)</li>
                <li>Get insurance quote — coastal zone TBD</li>
                <li>Inspect roof and HVAC</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
