import { Calculator, TrendingUp, GitCompare, BarChart3, Play, ImageIcon } from "lucide-react";

export function SolutionSection() {
  const benefits = [
    {
      icon: Calculator,
      title: "Real after-tax returns",
      description: "We model depreciation, capital gains, and depreciation recapture. The IRR you see is the IRR you'll actually earn.",
    },
    {
      icon: TrendingUp,
      title: "Instant sensitivity analysis",
      description: "See how your returns change if rent drops 10%, appreciation slows, or vacancy spikes. Know your downside before you commit.",
    },
    {
      icon: GitCompare,
      title: "Consistent, comparable memos",
      description: "Every deal gets the same rigorous analysis. Compare properties across markets with confidence.",
    },
    {
      icon: BarChart3,
      title: "REIT reality check",
      description: "Is this deal actually better than just buying VNQ? We'll tell you — with numbers.",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Underwriting That Actually Tells You the Truth
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            RE Investment Copilot runs a complete financial model on any rental property — with financing,
            taxes, depreciation, and exit costs baked in. You get a professional investment memo with a
            clear verdict, not another spreadsheet you have to interpret yourself.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex gap-4 bg-white p-6 rounded-xl border border-gray-200">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Demo video placeholder */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-xl">
            <div className="aspect-video flex flex-col items-center justify-center text-gray-500">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4 cursor-pointer hover:bg-blue-700 transition-colors">
                <Play className="h-10 w-10 text-white ml-1" />
              </div>
              <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">Demo Video Placeholder</p>
              <p className="text-xs opacity-75">Watch a deal go from listing to verdict in 90 seconds</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
