import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Form } from '@/lib/types';
import { formatDateTimeBR } from '@/lib/format';

export default async function RespostasIndex() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('forms_overview')
    .select('*')
    .order('created_at', { ascending: false });
  const forms = (data ?? []) as Form[];

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-6 text-xl font-semibold">Respostas</h1>
      <div className="card divide-y divide-[var(--line)]">
        {forms.length === 0 && <p className="p-6 text-sm text-[var(--muted)]">Nenhum formulário criado.</p>}
        {forms.map((f) => (
          <Link
            key={f.id}
            href={`/formulario/${f.id}/respostas`}
            className="flex items-center justify-between p-5 hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">{f.name}</p>
              <p className="hint">Criado em {formatDateTimeBR(f.created_at)}</p>
            </div>
            <span className="text-sm text-[var(--muted)]">{f.responses_count ?? 0} respostas</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
