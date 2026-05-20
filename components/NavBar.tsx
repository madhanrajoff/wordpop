'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const NAV_LINKS = [
  { href: '/', label: 'Words' },
  { href: '/history', label: 'History' },
  { href: '/settings', label: 'Settings' },
];

export function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-40 bg-navy-light/90 backdrop-blur border-b border-white/10">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl leading-none">
          Word<span className="text-accent">Pop</span>
        </Link>

        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  active
                    ? 'text-white bg-white/10 font-medium'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            );
          })}

          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1.5 rounded-lg text-sm text-white/40
                       hover:text-white hover:bg-white/5 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
