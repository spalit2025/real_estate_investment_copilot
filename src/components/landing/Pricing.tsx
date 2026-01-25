import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pricing() {
  const plans = [
    {
      name: "Pay Per Memo",
      price: "$29",
      unit: "per memo",
      description: "Best for occasional investors",
      features: [
        "Full analysis (5/7/10 year)",
        "Sensitivity analysis",
        "PDF export",
        "Saved to your account",
      ],
      cta: "Buy a Single Memo",
      highlighted: false,
    },
    {
      name: "Unlimited",
      price: "$79",
      unit: "/month",
      annualPrice: "$599/year (save 37%)",
      description: "Best for active investors",
      features: [
        "Unlimited memos",
        "Deal comparison view",
        "Saved assumption profiles",
        "Priority support",
      ],
      cta: "Start Free Trial",
      highlighted: true,
    },
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Pricing That Makes Sense
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-8 ${
                plan.highlighted
                  ? "bg-blue-600 text-white ring-4 ring-blue-600 ring-offset-2"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              {plan.highlighted && (
                <span className="inline-block bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  BEST VALUE
                </span>
              )}

              <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                {plan.name}
              </h3>

              <div className="mb-4">
                <span className={`text-4xl font-bold ${plan.highlighted ? "text-white" : "text-gray-900"}`}>
                  {plan.price}
                </span>
                <span className={plan.highlighted ? "text-blue-100" : "text-gray-600"}>
                  {plan.unit}
                </span>
              </div>

              {plan.annualPrice && (
                <p className={`text-sm mb-4 ${plan.highlighted ? "text-blue-100" : "text-gray-600"}`}>
                  or {plan.annualPrice}
                </p>
              )}

              <p className={`mb-6 ${plan.highlighted ? "text-blue-100" : "text-gray-600"}`}>
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className={`h-5 w-5 ${plan.highlighted ? "text-blue-200" : "text-green-600"}`} />
                    <span className={plan.highlighted ? "text-white" : "text-gray-700"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href="/signup">
                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? "bg-white text-blue-600 hover:bg-gray-100"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Below pricing notes */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-gray-600">
            Every plan includes a 14-day free trial. No credit card required. Your first 3 memos are free forever.
          </p>
          <p className="text-lg font-medium text-gray-900">
            One bad deal costs $50,000+. One good memo costs $29.
          </p>
        </div>
      </div>
    </section>
  );
}
