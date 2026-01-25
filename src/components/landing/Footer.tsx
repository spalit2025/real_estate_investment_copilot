import Link from "next/link";
import { Building2 } from "lucide-react";

export function Footer() {
  const links = {
    product: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
    resources: [
      { label: "Blog", href: "#" },
      { label: "Deal Analysis Guide", href: "#" },
      { label: "IRR Calculator", href: "#" },
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Disclaimer", href: "#" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Building2 className="h-8 w-8 text-blue-500" />
              <span className="text-lg font-bold text-white">RE Investment Copilot</span>
            </Link>
            <p className="text-sm">
              support@reinvestmentcopilot.com
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {links.product.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {links.resources.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {links.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {links.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-xs text-gray-500 max-w-4xl">
            RE Investment Copilot provides analysis tools for educational purposes. It is not a licensed
            investment advisor and does not provide financial, legal, or tax advice. All investment
            decisions should be made in consultation with qualified professionals.
          </p>
          <p className="text-xs text-gray-500 mt-4">
            © {new Date().getFullYear()} RE Investment Copilot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
