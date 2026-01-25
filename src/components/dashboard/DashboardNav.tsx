'use client';

/**
 * Dashboard navigation component
 */

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@/lib/db/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardNavProps {
  user: User;
}

const navItems = [
  { href: '/deals', label: 'Deals' },
  { href: '/compare', label: 'Compare' },
  { href: '/settings/profiles', label: 'Profiles' },
];

export function DashboardNav({ user }: DashboardNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/deals" className="text-xl font-bold text-gray-900">
                RE Copilot
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                    pathname.startsWith(item.href)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">{user.email}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
