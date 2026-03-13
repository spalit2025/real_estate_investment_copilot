import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 mb-4">
            <Building2 className="h-8 w-8 text-blue-500" />
            <span className="text-lg font-bold text-white">RE Investment Copilot</span>
          </Link>
          <p className="text-sm max-w-md mb-6">
            Decision-ready underwriting for residential rentals with financing and tax effects.
          </p>
          <a
            href="https://github.com/spalit2025/re-investment-copilot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors mb-8"
          >
            View on GitHub
          </a>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-xs text-gray-500 max-w-4xl mx-auto text-center">
            RE Investment Copilot provides analysis tools for educational purposes. It is not a licensed
            investment advisor and does not provide financial, legal, or tax advice. All investment
            decisions should be made in consultation with qualified professionals.
          </p>
          <p className="text-xs text-gray-500 mt-4 text-center">
            MIT License. © {new Date().getFullYear()} RE Investment Copilot.
          </p>
        </div>
      </div>
    </footer>
  );
}
