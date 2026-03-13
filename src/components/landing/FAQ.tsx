"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export function FAQ() {
  const faqs = [
    {
      question: "How accurate are the calculations?",
      answer: "Our IRR calculations match Excel XIRR within 0.01%. The model uses standard amortization formulas, straight-line depreciation over 27.5 years, and current capital gains rates. Every number traces to an input or a default you can see and override.",
    },
    {
      question: "What if I don't know all the inputs?",
      answer: "We use smart defaults based on property type and location. Don't know the insurance cost? We'll estimate it and flag it as a data gap. The memo tells you exactly what's assumed and how sensitive your returns are to those assumptions.",
    },
    {
      question: "Is this financial advice?",
      answer: "No. RE Investment Copilot is an analysis tool that helps you model deals consistently. We don't tell you what to buy — we give you the numbers so you can decide. Always consult with qualified professionals before making investment decisions.",
    },
    {
      question: "Can I compare multiple properties?",
      answer: "Yes. Save deals and view them side-by-side using the comparison tool with key metrics: IRR, equity multiple, cash flow, and REIT comparison.",
    },
    {
      question: "What markets/property types are supported?",
      answer: "Any residential rental in the US — single-family, condo, townhouse, or small multifamily (2-4 units). We support both cash-flow markets and appreciation markets with appropriate default assumptions.",
    },
    {
      question: "How is the AI used?",
      answer: "The AI generates the narrative explanations — the \"why\" behind the numbers. It never generates the numbers themselves. All financial calculations are deterministic math that you can verify.",
    },
    {
      question: "Can I export the memo?",
      answer: "Yes. Every memo can be exported to PDF or Markdown. Share with partners, lenders, or save for your records.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Questions? Answers.
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
