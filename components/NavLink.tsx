'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + '/');
  return (
    <Link
      href={href}
      className={`block rounded-lg px-3 py-2 text-sm ${
        active ? 'bg-blue-50 font-medium text-[var(--brand)]' : 'text-[var(--ink)] hover:bg-gray-50'
      }`}
    >
      {children}
    </Link>
  );
}
