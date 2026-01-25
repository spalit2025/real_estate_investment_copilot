import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="py-20 bg-[#0F172A]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl mb-6">
          Your Next Deal Deserves Better Than a Spreadsheet
        </h2>

        <p className="text-lg text-gray-300 mb-10">
          Run your first analysis free. See the difference between guessing and knowing.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup">
            <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6">
              Analyze a Deal Now — Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-sm text-gray-400">
          First 3 memos free. No credit card required. Cancel anytime.
        </p>

        <div className="mt-8">
          <a href="#" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300">
            <Play className="h-4 w-4" />
            Want to see it first? Watch the 2-minute demo
          </a>
        </div>
      </div>
    </section>
  );
}
