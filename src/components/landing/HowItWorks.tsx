import { ClipboardList, Calculator, FileCheck, ImageIcon } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: ClipboardList,
      title: "Enter the Deal",
      time: "3 minutes",
      description: "Plug in the property details, purchase price, rent, and expenses. We pre-fill smart defaults so you're not starting from zero.",
    },
    {
      number: "2",
      icon: Calculator,
      title: "Run the Model",
      time: "instant",
      description: "Our engine calculates year-by-year cash flows, IRR at 5/7/10 years, sensitivity analysis, and tax-adjusted exit proceeds. All deterministic math — no AI hallucinations on your numbers.",
    },
    {
      number: "3",
      icon: FileCheck,
      title: "Get Your Memo",
      time: "instant",
      description: "A professional investment memo with a clear verdict: Buy, Pass, or Watch. Export to PDF, share with partners, or save for your records.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            From Listing to Verdict in Three Steps
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector line (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gray-200" />
              )}

              <div className="text-center">
                {/* Step number + icon */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <step.icon className="h-10 w-10 text-blue-600" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </span>
                </div>

                {/* Title and time */}
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-blue-600 font-medium mb-4">
                  {step.time}
                </p>

                {/* Description */}
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Screenshot placeholders for each step */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {["Deal Input Form", "Running Analysis", "Final Memo"].map((label, index) => (
            <div key={index} className="bg-gray-100 rounded-lg border border-gray-200 p-8 flex flex-col items-center justify-center min-h-[200px]">
              <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Screenshot: {label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
