"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0F172A]/95 backdrop-blur-sm border-b border-white/10">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold text-white">RE Investment Copilot</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            <a href="#features" className="text-sm text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#faq" className="text-sm text-gray-300 hover:text-white transition-colors">
              FAQ
            </a>
            <a
              href="https://github.com/spalit2025/re-investment-copilot"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/10">
                GitHub
              </Button>
            </a>
            <Link href="/deals/sample/analyze">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                View Demo
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden text-gray-300 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <a
                href="#features"
                className="text-sm text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#faq"
                className="text-sm text-gray-300 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>
              <div className="flex flex-col gap-2 pt-4 border-t border-white/10">
                <a
                  href="https://github.com/spalit2025/re-investment-copilot"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" className="w-full text-gray-300 hover:text-white hover:bg-white/10">
                    GitHub
                  </Button>
                </a>
                <Link href="/deals/sample/analyze">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    View Demo
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
