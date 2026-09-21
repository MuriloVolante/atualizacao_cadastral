import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Form } from '@/lib/types';
import FormCard from '@/components/FormCard';

const TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'ativos', label: 'Ativos' },
  { key: 'encerrados', label: 'Encerrados' },
];

export default async function Formularios({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab = 'todos' } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from('forms_overview').select('*').order('created_at', { ascending: false });
  if (tab === 'ativos') query = query.eq('status', 'ativo');
  if (tab === 'encerrados') query = query.eq('status', 'encerrado');

  const { data } = await query;
  const forms = (data ?? []) as Form[];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Formulários</h1>
        <Link href="/dashboard/novo" className="btn-primary">
          + Criar formulário
        </Link>
      </div>

      <div className="mb-5 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/dashboard/formularios?tab=${t.key}`}
            className={`chip border ${
              tab === t.key
                ? 'border-[var(--brand)] bg-blue-50 text-[var(--brand)]'
                : 'border-[var(--line)] bg-white text-[var(--muted)]'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {forms.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-[var(--muted)]">Nenhum formulário nesta visão.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {forms.map((form) => (
            <FormCard key={form.id} form={form} />
          ))}
        </div>
      )}
    </div>
  );
}
