import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ImageIcon } from "lucide-react";

export function Hero() {
  return (
    <section className="relative bg-[#0F172A] pt-32 pb-20 lg:pb-32">
      {/* Subtle grid pattern background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          {/* Left side - Copy */}
          <div className="lg:col-span-6 xl:col-span-7">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Stop Guessing.
              <br />
              <span className="text-blue-500">Start Underwriting.</span>
            </h1>

            <p className="mt-6 text-lg text-gray-300 max-w-xl">
              Get a professional investment memo for any rental property in under 5 minutes.
              Real IRR calculations. Real sensitivity analysis. A real verdict: <strong className="text-white">Buy, Pass, or Watch</strong>.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 shadow-lg shadow-blue-600/25">
                  Analyze Your First Deal — Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-gray-400">
              127 deals analyzed this week by investors like you
            </p>
          </div>

          {/* Right side - Product screenshot placeholder */}
          <div className="mt-12 lg:mt-0 lg:col-span-6 xl:col-span-5">
            <div className="relative">
              {/* Screenshot placeholder */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
                <div className="bg-gray-900 px-4 py-3 border-b border-gray-700 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="p-6 min-h-[400px] flex flex-col items-center justify-center text-gray-500">
                  <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-sm">Product Screenshot Placeholder</p>
                  <p className="text-xs mt-1 opacity-75">Add memo screenshot showing BUY verdict</p>
                </div>
              </div>

              {/* Floating metrics badges */}
              <div className="absolute -right-4 top-8 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold">
                BUY
              </div>
              <div className="absolute -left-4 bottom-20 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                <span className="text-gray-400">7-Year IRR:</span> <span className="font-bold text-green-400">14.2%</span>
              </div>
              <div className="absolute -right-2 bottom-8 bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
                <span className="text-gray-400">vs. REIT:</span> <span className="font-bold text-blue-400">+6.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
