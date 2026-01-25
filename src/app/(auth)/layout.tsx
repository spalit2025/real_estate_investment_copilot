/**
 * Auth layout - minimal layout for login/signup pages
 */

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            RE Investment Copilot
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Decision-ready underwriting for residential rentals
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
