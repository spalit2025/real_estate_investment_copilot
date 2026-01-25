import { XCircle, CheckCircle2, FileSpreadsheet, FileText } from "lucide-react";

export function ProblemSection() {
  const painPoints = [
    {
      title: "You're flying blind on taxes",
      description: "That \"cash flow\" number doesn't include depreciation benefits or the capital gains hit at exit. You're comparing deals on incomplete data.",
    },
    {
      title: "Sensitivity analysis takes forever",
      description: "You know rent could be $200 lower. You know appreciation might be 2% instead of 4%. But modeling every scenario manually? Nobody has time for that.",
    },
    {
      title: "Every deal feels like starting over",
      description: "New spreadsheet, new formulas, new mistakes. There's no consistency, no repeatability, no way to compare apples to apples.",
    },
    {
      title: "Pro forma fantasies",
      description: "The listing says 8% cap rate. But with realistic vacancy, actual insurance costs, and real property taxes? The deal looks completely different.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Your Spreadsheet Is Lying to You
            <span className="text-gray-500"> (By Omission)</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {painPoints.map((point, index) => (
            <div key={index} className="flex gap-4">
              <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{point.title}</h3>
                <p className="text-gray-600">{point.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Visual comparison */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Spreadsheet side */}
          <div className="bg-red-50 rounded-xl p-6 border border-red-100">
            <div className="flex items-center gap-3 mb-4">
              <FileSpreadsheet className="h-8 w-8 text-red-500" />
              <h4 className="font-semibold text-gray-900">Your Current Spreadsheet</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Missing tax effects
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                No sensitivity analysis
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Different format every time
              </li>
              <li className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Hours to build properly
              </li>
            </ul>
          </div>

          {/* Memo side */}
          <div className="bg-green-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-8 w-8 text-green-600" />
              <h4 className="font-semibold text-gray-900">Investment Memo</h4>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Full tax modeling included
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Instant sensitivity runs
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Consistent, comparable format
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Ready in under 5 minutes
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
