'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { seg: 'editor', label: 'Editor' },
  { seg: 'respostas', label: 'Respostas' },
  { seg: 'configuracoes', label: 'Configurações' },
];

export default function FormTabs({ id }: { id: string }) {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1">
      {TABS.map((t) => {
        const href = `/formulario/${id}/${t.seg}`;
        const active = pathname.startsWith(href);
        return (
          <Link
            key={t.seg}
            href={href}
            className={`rounded-lg px-3 py-2 text-sm ${
              active ? 'bg-blue-50 font-medium text-[var(--brand)]' : 'text-[var(--muted)] hover:bg-gray-50'
            }`}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
