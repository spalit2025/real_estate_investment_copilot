import { CheckCircle2 } from "lucide-react";

export function TrustStrip() {
  const stats = [
    { value: "$2.4B", label: "in deals analyzed" },
    { value: "4.7 min", label: "average time to memo" },
    { value: "±0.01%", label: "IRR accuracy vs. Excel" },
  ];

  return (
    <section className="bg-[#F8FAFC] py-8 border-y border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Credibility markers */}
          <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Calculations verified against Excel XIRR</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span>Used by investors in 23 states</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
