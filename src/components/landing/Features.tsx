import {
  CalendarRange,
  Receipt,
  SlidersHorizontal,
  BarChart3,
  AlertTriangle,
  FileDown
} from "lucide-react";

export function Features() {
  const features = [
    {
      icon: CalendarRange,
      title: "Multi-Horizon Analysis",
      description: "See returns at 5, 7, and 10-year exits. Different hold periods tell different stories — know which timeline works for your strategy.",
    },
    {
      icon: Receipt,
      title: "Full Tax Modeling",
      description: "Depreciation, capital gains, depreciation recapture at exit. The IRS doesn't forget these — and neither do we.",
    },
    {
      icon: SlidersHorizontal,
      title: "Sensitivity Analysis",
      description: "What if rent is 10% lower? Appreciation is 2% instead of 4%? Vacancy doubles? See the impact on IRR instantly.",
    },
    {
      icon: BarChart3,
      title: "REIT Baseline Comparison",
      description: "Every deal is benchmarked against a 6% REIT return. If you can't beat passive investing, why take the risk?",
    },
    {
      icon: AlertTriangle,
      title: "Risk & Data Gap Flags",
      description: "We call out what's unknown and what could go wrong. Rent control? Insurance uncertainty? You'll know before you bid.",
    },
    {
      icon: FileDown,
      title: "Exportable Memos",
      description: "Professional PDF output you can share with partners, lenders, or your future self. Consistent format, every time.",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Built for Investors Who Do Their Own Math
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-200 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
